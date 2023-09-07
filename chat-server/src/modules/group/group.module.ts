import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { GroupShip } from './entities/groupship.entity';
import { GroupMessage } from './entities/groupMessage.entity';
import { User } from '../user/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, GroupShip, GroupMessage,User]),
  ],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
