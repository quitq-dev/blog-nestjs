import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { DeleteResult, Like, Repository, UpdateResult } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { FilterUserDto } from "./dto/filter-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private configService: ConfigService
  ) {}

  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow("AWS_S3_REGION"),
    credentials: {
      accessKeyId: this.configService.getOrThrow("AWS_ACCESS_KEY_ID"),
      secretAccessKey: this.configService.getOrThrow("AWS_SECRET_ACCESS_KEY"),
    },
  });

  async index(query: FilterUserDto): Promise<any> {
    const page = Number(query.page) || 1;
    const items_per_page = Number(query.items_per_page) || 10;
    const skip = (page - 1) * items_per_page;
    const keyword = query.search || "";

    const [result, total] = await this.userRepository.findAndCount({
      where: [
        { last_name: Like("%" + keyword + "%") },
        { first_name: Like("%" + keyword + "%") },
        { email: Like("%" + keyword + "%") },
      ],
      order: { created_at: "DESC" },
      take: items_per_page,
      skip: skip,
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

    const lastPage = Math.ceil(total / items_per_page);
    const nextPage = page + 1 > lastPage ? null : page + 1;
    const prevPage = page - 1 < 1 ? null : page - 1;

    return {
      data: result,
      total,
      currentPage: page,
      nextPage,
      prevPage,
      lastPage,
    };
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

  async upload(fileName: string, file: Buffer): Promise<any> {
    const putPayload = {
      Bucket: "nestjs-upload-file",
      Key: fileName,
      Body: file,
    };
    return await this.s3Client.send(new PutObjectCommand(putPayload));
  }

  async uploadAvatar(req: any, fileName: string, file: Buffer): Promise<any> {
    const { id } = req.data_user;
    await this.upload(fileName, file);
    return await this.userRepository.update(id, { avatar: fileName });
  }
}
