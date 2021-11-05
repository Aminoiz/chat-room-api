import { UserI } from '@modules/user/models/user.interface';
import { RoomI } from '@modules/chat/models/room.interface';

export interface MessageI {
  id?: number;
  text: string;
  user: UserI;
  room: RoomI;
  created_at: Date;
  updated_at: Date;
}
