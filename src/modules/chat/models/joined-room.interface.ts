import { UserI } from '@modules/user/models/user.interface';
import { RoomI } from '@modules/chat/models/room.interface';

export interface JoinedRoomI {
  id?: number;
  socketId: string;
  user: UserI;
  room: RoomI;
}
