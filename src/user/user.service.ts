import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}
  async index(): Promise<User[]> {
    return await this.userRepository.find({
      select: [
        "id",
        "first_name",
        "last_name",
        "email",
        "status",
        "created_at",
        "updated_at",
      ],
    });
  }

  async show(id: number): Promise<User> {
    return await this.userRepository.findOneBy({ id });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashPassword = await bcrypt.hash(createUserDto.password, 10);
      return await this.userRepository.save({
        ...createUserDto,
        password: hashPassword,
      });
    } catch (error: any) {
      throw new UnauthorizedException(error);
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto
  ): Promise<UpdateResult> {
    return await this.userRepository.update(id, updateUserDto);
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.userRepository.delete(id);
  }
}
