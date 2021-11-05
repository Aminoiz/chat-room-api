import { UserI } from '@modules/user/models/user.interface';

export interface ConnectedUserI {
  id?: number;
  socketId: string;
  user: UserI;
}
