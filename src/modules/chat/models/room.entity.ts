import { UserEntity } from '@modules/user/models/user.entity';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { JoinedRoomEntity } from '@modules/chat/models/joined-room.entity';
import { MessageEntity } from '@modules/chat/models/message.entity';

@Entity()
export class RoomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({nullable: true})
  description: string;

  @ManyToMany(() => UserEntity)
  @JoinTable()
  users: UserEntity[];

  @OneToMany(() => JoinedRoomEntity, joinedRoom => joinedRoom.room)
  joinedUsers: JoinedRoomEntity[];

  @OneToMany(() => MessageEntity, message => message.room)
  messages: MessageEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
