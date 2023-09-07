import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendShip } from './entities/friend.entity';
import { FriendMessage } from './entities/friendMessage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendShip, FriendMessage]),
  ],
  controllers: [FriendController],
  providers: [FriendService],
})
export class FriendModule {}
