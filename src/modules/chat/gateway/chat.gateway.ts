import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UserI } from '@modules/user/models/user.interface';
import { UserService } from '@modules/user/services/user.service';
import { BadRequestException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { RoomService } from '@modules/chat/services/room.service';
import { ConnectedUserService } from '@modules/chat/services/connected-user.service';
import { JoinedRoomService } from '@modules/chat/services/joined-room.service';
import { MessageService } from '@modules/chat/services/message.service';
import { AuthenticationService } from '@modules/authentication/services/authentication.service';
import { PageI } from '@modules/chat/models/page.interface';
import { ConnectedUserI } from '@modules/chat/models/connected-user.interface';
import { RoomI } from '@modules/chat/models/room.interface';
import { MessageI } from '@modules/chat/models/message.interface';
import { JoinedRoomI } from '@modules/chat/models/joined-room.interface';
import { ConfigService } from '@nestjs/config';
import { userJoinedMessage, userLeftMessage } from '@common/system-messages.object';
import { systemUser } from '@common/defaults';

@WebSocketGateway({ cors: { origin: ['http://localhost:3000', 'http://localhost:4200'] } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {

  @WebSocketServer()
  server: Server;

  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private roomService: RoomService,
    private connectedUserService: ConnectedUserService,
    private joinedRoomService: JoinedRoomService,
    private messageService: MessageService,
    private configService: ConfigService,
  ) { }

  async onModuleInit() {
    await this.connectedUserService.deleteAll();
    await this.joinedRoomService.deleteAll();
  }

  async handleConnection(socket: Socket) {
    try {
      const decodedToken = await this.authenticationService.verifyJwt(socket.handshake.headers.authorization);
      const user: UserI = await this.userService.getOne(decodedToken.user.id);
      if (!user) {
        return this.disconnect(socket);
      } else {
        socket.data.user = user;
        const rooms = await this.roomService.getRoomsForUser(user.id, { page: 1, limit: 10 });
        // Save connection to DB
        await this.connectedUserService.create({ socketId: socket.id, user });
        // Only emit rooms to the specific connected client
        return this.server.to(socket.id).emit('rooms', rooms);
      }
    } catch {
      return this.disconnect(socket);
    }
  }

  async handleDisconnect(socket: Socket) {
    // remove connection from DB
    await this.connectedUserService.deleteBySocketId(socket.id);
    socket.disconnect();
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(socket: Socket, room: RoomI) {
    const createdRoom: RoomI = await this.roomService.createRoom(room, socket.data.user);

    for (const user of createdRoom.users) {
      const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
      const rooms = await this.roomService.getRoomsForUser(user.id, { page: 1, limit: 10 });

      for (const connection of connections) {
        await this.server.to(connection.socketId).emit('rooms', rooms);
      }
    }
  }

  @SubscribeMessage('paginateRooms')
  async onPaginateRoom(socket: Socket, page: PageI) {
    const rooms = await this.roomService.getRoomsForUser(socket.data.user.id, this.handleIncomingPageRequest(page));
    return this.server.to(socket.id).emit('rooms', rooms);
  }

  @SubscribeMessage('joinRoom')
  async onJoinRoom(socket: Socket, room: RoomI) {
    const roomLimit: number = this.configService.get('ROOM_LIMIT', 100);

    const dbRoom = await this.roomService.getRoom(room.id);
    if (dbRoom.users.length >= roomLimit) {
      await this.server.to(socket.id).emit('Error', new BadRequestException());
      return;
    }

    const message: MessageI = await this.messageService.create(userJoinedMessage(room, systemUser));
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(room);
    for (const user of joinedUsers) {
      await this.server.to(user.socketId).emit('messageAdded', message);
    }

    const messages = await this.messageService.findMessagesForRoom(room, { limit: 10, page: 1 });
    // Save Connection to Room
    await this.joinedRoomService.create({ socketId: socket.id, user: socket.data.user, room });
    // Send last messages from Room to User
    await this.server.to(socket.id).emit('messages', messages);
  }

  @SubscribeMessage('leaveRoom')
  async onLeaveRoom(socket: Socket, room: RoomI) {
    // remove connection from JoinedRooms
    await this.joinedRoomService.deleteBySocketId(socket.id);

    const message: MessageI = await this.messageService.create(userLeftMessage(room, systemUser));
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(room);
    for (const user of joinedUsers) {
      await this.server.to(user.socketId).emit('messageAdded', message);
    }
  }

  @SubscribeMessage('addMessage')
  async onAddMessage(socket: Socket, message: MessageI) {
    const createdMessage: MessageI = await this.messageService.create({ ...message, user: socket.data.user });
    const room: RoomI = await this.roomService.getRoom(createdMessage.room.id);
    const joinedUsers: JoinedRoomI[] = await this.joinedRoomService.findByRoom(room);

    for (const user of joinedUsers) {
      await this.server.to(user.socketId).emit('messageAdded', createdMessage);
    }
  }

  private handleIncomingPageRequest(page: PageI) {
    page.limit = page.limit > 100 ? 100 : page.limit;
    // add page +1 to match angular material paginator
    page.page = page.page + 1;
    return page;
  }
}
