import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Render,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';
import { RegisterDto } from './register.dto';
import { ChangeUserDto } from './changeuser.dto';
import User from './user.entity';
import * as bcrypt from 'bcrypt';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private dataSource: DataSource,
  ) {}

  @Get()
  @Render('index')
  index() {
    return { message: 'Welcome to the homepage' };
  }

  @Post('/register')
  @HttpCode(200)
  async register(@Body() registerDto: RegisterDto) {
    if (
      !registerDto.email ||
      !registerDto.password ||
      !registerDto.passwordAgain
    ) {
      throw new BadRequestException('All fields are required');
    }
    if (!registerDto.email.includes('@')) {
      throw new BadRequestException('Email must contain a @ character');
    }
    if (registerDto.password !== registerDto.passwordAgain) {
      throw new BadRequestException('The two passwords must match');
    }
    if (registerDto.password.length < 8) {
      throw new BadRequestException(
        'The password must be at leat 8 characters long',
      );
    }

    const userRepo = this.dataSource.getRepository(User);
    const user = new User();
    user.email = registerDto.email;
    user.password = await bcrypt.hash(registerDto.password, 15);
    await userRepo.save(user);

    delete user.password;

    return user;
  }

  @Patch('/users/:id')
  async updateUser(
    @Param('id') id: number,
    @Body() changeuserDto: ChangeUserDto,
  ) {
    if (!changeuserDto.email || !changeuserDto.profilePicture) {
      throw new BadRequestException('All fields are required');
    }
    if (!changeuserDto.email.includes('@')) {
      throw new BadRequestException('Email must contain a @ character');
    }
    if (
      !changeuserDto.profilePicture.startsWith('http://') ||
      changeuserDto.profilePicture.startsWith('https://')
    ) {
      throw new BadRequestException('URL is not correct');
    }

    const userRepo = this.dataSource.getRepository(User);
    const user = userRepo.findOneBy({ id: id });
    user.email = changeuserDto.email;
    user.profilePictureURL = changeuserDto.profilePicture;
    await userRepo.save(user);

    return user;

    

  }
}
