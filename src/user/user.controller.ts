import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { DeleteResult, UpdateResult } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  async index(): Promise<User[]> {
    return this.userService.index();
  }

  @Get(":id")
  async show(@Param("id") id: number): Promise<User> {
    return this.userService.show(Number(id));
  }

  @Post()
  @UsePipes(ValidationPipe)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Put(":id")
  @UsePipes(ValidationPipe)
  async update(
    @Param("id") id: number,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UpdateResult> {
    return await this.userService.update(Number(id), updateUserDto);
  }

  @Delete(":id")
  async delete(@Param("id") id: number): Promise<DeleteResult> {
    return this.userService.delete(Number(id));
  }
}
