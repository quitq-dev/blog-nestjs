import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { LoginUserDto } from "./dto/login-user.dto";
import { RegisterUserDto } from "./dto/register-user.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    try {
      const hashPassword = await this.hashPassword(registerUserDto.password);
      const newData = {
        ...registerUserDto,
        refresh_token: "refresh_token_string",
        password: hashPassword,
      };
      return await this.userRepository.save(newData);
    } catch (error: any) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
    });
    if (!user) {
      console.log("user", user);
      throw new HttpException("Email is not exist!", HttpStatus.UNAUTHORIZED);
    }
    const checkPassword = bcrypt.compareSync(
      loginUserDto.password,
      user.password
    );
    if (!checkPassword) {
      throw new HttpException(
        "Password is not correct!",
        HttpStatus.UNAUTHORIZED
      );
    }
    const payload = { id: user.id, email: user.email };
    return this.generateToken(payload);
  }

  async refreshToken(refreshToken: any): Promise<any> {
    try {
      const verify = await this.jwtService.verifyAsync(
        refreshToken.refresh_token,
        {
          secret: this.configService.get<string>("SECRET"),
        }
      );
      if (!verify) {
        throw new HttpException(
          "Refresh token is not valid",
          HttpStatus.UNAUTHORIZED
        );
      }
      return await this.generateToken({ id: verify.id, email: verify.email });
    } catch (error) {
      console.log("error", error);
      throw new HttpException(
        "Refresh token is not valid",
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  async generateToken(payload: { id: number; email: string }) {
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>("SECRET"),
      expiresIn: this.configService.get<string>("EXPIRES_IN_REFRESH_TOKEN"),
    });
    await this.userRepository.update(
      {
        email: payload.email,
      },
      { refresh_token: refresh_token }
    );
    return { access_token, refresh_token };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }
}
