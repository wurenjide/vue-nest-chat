import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FriendShip {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  friendId: string;

  @Column()
  userId: string;
}
