import { UserEntity } from '@modules/user/models/user.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RoomEntity } from '@modules/chat/models/room.entity';

@Entity()
export class MessageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @ManyToOne(() => UserEntity, user => user.messages)
  @JoinColumn()
  user: UserEntity;

  @ManyToOne(() => RoomEntity, room => room.messages)
  @JoinTable()
  room: RoomEntity;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
