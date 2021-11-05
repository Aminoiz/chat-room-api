import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '@modules/user/user.module';
import { ChatGateway } from '@modules/chat/gateway/chat.gateway';
import { RoomEntity } from '@modules/chat/models/room.entity';
import { RoomService } from '@modules/chat/services/room.service';
import { ConnectedUserService } from '@modules/chat/services/connected-user.service';
import { ConnectedUserEntity } from '@modules/chat/models/connected-user.entity';
import { MessageEntity } from '@modules/chat/models/message.entity';
import { JoinedRoomEntity } from '@modules/chat/models/joined-room.entity';
import { JoinedRoomService } from '@modules/chat/services/joined-room.service';
import { MessageService } from '@modules/chat/services/message.service';
import { AuthenticationModule } from '@modules/authentication/authentication.module';

@Module({
  imports: [
    AuthenticationModule,
    UserModule,
    TypeOrmModule.forFeature([
      RoomEntity,
      ConnectedUserEntity,
      MessageEntity,
      JoinedRoomEntity
    ]),
  ],
  providers: [
    ChatGateway,
    RoomService,
    ConnectedUserService,
    JoinedRoomService,
    MessageService,
  ],
})
export class ChatModule { }
