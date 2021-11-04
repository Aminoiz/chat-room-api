import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from '@modules/authentication/guards/jwt.guard';
import { AuthenticationService } from '@modules/authentication/services/authentication.service';
import { JwtStrategy } from '@modules/authentication/strategies/jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '10000s' },
      }),
    }),
  ],
  providers: [AuthenticationService, JwtStrategy, JwtAuthGuard],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
