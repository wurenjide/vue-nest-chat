import {Column, Entity, PrimaryGeneratedColumn}  from "typeorm"

@Entity()
export class User {

    //用户id
    @PrimaryGeneratedColumn("uuid")
    userId:string

    //用户名
    @Column()
    username:string

    //用户密码
    @Column()
    password:string

    //用户头像
    @Column({nullable:true})
    avatar:string

    @Column({default:"user"})
    role:string

    //用户描述
    @Column({nullable:true})
    discription:string
    
    //创建时间
    @Column({type: 'double',default: new Date().valueOf()})
    createTime: number;

}
