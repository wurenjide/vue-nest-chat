import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
// import { UseGuards } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';

// import { FriendShip } from "../friend/entities/friend.entity";
// import { FriendMessage } from "../friend/entities/friendMessage.entity";
// import { Group } from "../group/entities/group.entity";
// import { GroupMessage } from "../group/entities/groupMessage.entity";
// import { GroupShip } from "../group/entities/groupship.entity";
// import { User } from "../user/entity/user.entity";
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';


/**
 * chatRoom包含了群聊和私聊
 */
//@UseGuards(JwtAuthGuard) 可以给websocket进行身份验证。
@WebSocketGateway({
  cors: { origin: /.*/, credentials: true },
  port: 3000,
  path: '/test',
  /**
   * 可以指定path:""属性创建更加复杂的应用，同时客服端需要设置path
   * 注意点:
   * 1. 如果使用了path，那么就会涉及到跨域问题，需要设置cors
   * 2. 如果只是使用namespace，啥都不需要干
   */
})
export class TestGateway implements OnGatewayConnection {


  constructor(
    // @InjectRepository(User)
    // private readonly userRepository: Repository<User>,
    // @InjectRepository(Group)
    // private readonly groupRepository: Repository<Group>,
    // @InjectRepository(GroupShip)
    // private readonly groupUserRepository: Repository<GroupShip>,
    // @InjectRepository(GroupMessage)
    // private readonly groupMessageRepository: Repository<GroupMessage>,
    // @InjectRepository(FriendShip)
    // private readonly friendRepository: Repository<FriendShip>,
    // @InjectRepository(FriendMessage)
    // private readonly friendMessageRepository: Repository<FriendMessage>,
) {

    this.defaultGroup = '聊天室';
}
@WebSocketServer()
server: Server;

// 默认群
defaultGroup: string;

  handleConnection(client: any, ...args: any[]) {
    console.log("连接")
    throw new Error('Method not implemented.');
  }
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
