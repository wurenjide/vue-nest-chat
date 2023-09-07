import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { Group } from '../group/entities/group.entity';
import { GroupShip } from "../group/entities/groupship.entity"
import { GroupMessage } from '../group/entities/groupMessage.entity';
import { FriendMessage } from '../friend/entities/friendMessage.entity';
import { FriendShip } from '../friend/entities/friend.entity';
import { TestGateway } from './test.gateway';

@Module({
    // imports: [
    //     TypeOrmModule.forFeature([User, Group, GroupShip, GroupMessage, FriendShip, FriendMessage])
    // ],
    providers: [TestGateway]

})
export class TestModule { }
