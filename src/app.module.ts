import { AuthenticationModule } from '@modules/authentication/authentication.module';
import { UserModule } from '@modules/user/user.module';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationMiddleware } from '@middlewares/authentication.middleware';
import { ChatModule } from '@modules/chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    AuthenticationModule,
    ChatModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .exclude(
        { path: '/api/users', method: RequestMethod.POST },
        { path: '/api/users/login', method: RequestMethod.POST }
      )
      .forRoutes('')
  }
}
