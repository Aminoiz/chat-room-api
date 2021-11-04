import { IsNotEmpty, IsString } from 'class-validator';
import { LoginUserDto } from '@modules/user/models/dto/login-user.dto';


export class CreateUserDto extends LoginUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
