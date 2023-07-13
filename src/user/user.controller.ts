import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/auth.guard";
import { DeleteResult, UpdateResult } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { FilterUserDto } from "./dto/filter-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { UserService } from "./user.service";

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags("Users")
@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @ApiQuery({ name: "page" })
  @ApiQuery({ name: "items_per_page" })
  @ApiQuery({ name: "search" })
  @Get()
  async index(@Query() query: FilterUserDto): Promise<any> {
    return this.userService.index(query);
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
