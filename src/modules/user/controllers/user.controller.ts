import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '@modules/user/models/dto/create-user.dto';
import { LoginUserDto } from '@modules/user/models/dto/login-user.dto';
import { LoginResponseI } from '@modules/user/models/login-response.interface';
import { UserI } from '@modules/user/models/user.interface';
import { UserHelperService } from '@modules/user/services/user-helper.service';
import { UserService } from '@modules/user/services/user.service';

@Controller('users')
export class UserController {

  constructor(
    private userService: UserService,
    private userHelperService: UserHelperService,
  ) { }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserI> {
    const userEntity: UserI = this.userHelperService.createUserDtoToEntity(createUserDto);
    return this.userService.create(userEntity);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseI> {
    const userEntity: UserI = this.userHelperService.loginUserDtoToEntity(loginUserDto);
    const jwt: string = await this.userService.login(userEntity);
    return {
      access_token: jwt,
      token_type: 'JWT',
      expires_in: 10000,
    };
  }
}
