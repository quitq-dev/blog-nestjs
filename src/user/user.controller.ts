import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/auth.guard";
import { DeleteResult, UpdateResult } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { FilterUserDto } from "./dto/filter-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { UserService } from "./user.service";

@ApiBearerAuth()
@ApiTags("Users")
@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @ApiQuery({ name: "page" })
  @ApiQuery({ name: "items_per_page" })
  @ApiQuery({ name: "search" })
  @UseGuards(AuthGuard)
  async index(@Query() query: FilterUserDto): Promise<any> {
    return this.userService.index(query);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  async show(@Param("id") id: number): Promise<User> {
    return this.userService.show(Number(id));
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Put(":id")
  @UseGuards(AuthGuard)
  @UsePipes(ValidationPipe)
  async update(
    @Param("id") id: number,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UpdateResult> {
    return await this.userService.update(Number(id), updateUserDto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  async delete(@Param("id") id: number): Promise<DeleteResult> {
    return this.userService.delete(Number(id));
  }

  @Post("upload-avatar")
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor("avatar"))
  async uploadAvatar(
    @Req() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: /.(jpg|jpeg|png)$/ }),
        ],
      })
    )
    file: Express.Multer.File
  ) {
    return this.userService.uploadAvatar(req, file.originalname, file.buffer);
  }
}
