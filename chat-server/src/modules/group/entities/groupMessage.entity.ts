import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class GroupMessage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column()
  groupId: string;

  @Column()
  content: string;

  @Column()
  messageType: string;

  @Column('double')
  time: number;
}
