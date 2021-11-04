import { AuthenticationModule } from '@modules/authentication/authentication.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '@modules/user/controllers/user.controller';
import { UserEntity } from '@modules/user/models/user.entity';
import { UserHelperService } from '@modules/user/services/user-helper.service';
import { UserService } from '@modules/user/services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    AuthenticationModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserHelperService],
  exports: [UserService]
})
export class UserModule {}
