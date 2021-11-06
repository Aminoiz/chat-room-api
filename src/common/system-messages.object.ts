import { MessageI } from '@modules/chat/models/message.interface';
import { RoomI } from '@modules/chat/models/room.interface';
import { UserI } from '@modules/user/models/user.interface';

function userJoinedMessage(room: RoomI, user: UserI): MessageI {
  return {
    text: 'A new user joined the room',
    room,
    user,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

function userLeftMessage(room: RoomI, user: UserI): MessageI {
  return {
    text: 'A user left the room',
    room,
    user,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

export { userJoinedMessage, userLeftMessage };
