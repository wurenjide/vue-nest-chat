import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class GroupShip {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  groupId: string;

  @Column()
  userId: string;

  @Column({default:"member"})
  role:string

  @Column({type: 'double',default: new Date().valueOf()})
  createTime:number
}

