import { ConnectedUserEntity } from '@modules/chat/models/connected-user.entity';
import { JoinedRoomEntity } from '@modules/chat/models/joined-room.entity';
import { MessageEntity } from '@modules/chat/models/message.entity';
import { RoomEntity } from '@modules/chat/models/room.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  username: string;

  @Column({unique: true})
  email: string;

  @Column({select: false})
  password: string;

  @ManyToMany(() => RoomEntity, room => room.users)
  rooms: RoomEntity[]

  @OneToMany(() => ConnectedUserEntity, connection => connection.user)
  connections: ConnectedUserEntity[];

  @OneToMany(() => JoinedRoomEntity, joinedRoom => joinedRoom.room)
  joinedRooms: JoinedRoomEntity[];

  @OneToMany(() => MessageEntity, message => message.user)
  messages: MessageEntity[];

  @BeforeInsert()
  @BeforeUpdate()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
    this.username = this.username.toLowerCase();
  }
}
