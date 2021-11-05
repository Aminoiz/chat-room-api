import { UserI } from '@modules/user/models/user.interface';

export interface RoomI {
  id?: number;
  name?: string;
  description?: string;
  users?: UserI[];
  created_at?: Date;
  updated_at?: Date;
}
