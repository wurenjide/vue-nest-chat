import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { Group } from '../group/entities/group.entity';
import { GroupShip } from "../group/entities/groupship.entity"
import { GroupMessage } from '../group/entities/groupMessage.entity';
import { FriendMessage } from '../friend/entities/friendMessage.entity';
import { FriendShip } from '../friend/entities/friend.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, Group, GroupShip, GroupMessage, FriendShip, FriendMessage])
  ],
  controllers: [ChatController],
  providers: [ChatService,ChatGateway],
})
export class ChatModule {}
