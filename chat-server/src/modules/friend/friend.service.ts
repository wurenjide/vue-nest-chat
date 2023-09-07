import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { FriendShip } from './entities/friend.entity';
import { FriendMessage } from './entities/friendMessage.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(FriendShip)
    private readonly friendRepository: Repository<FriendShip>,
    @InjectRepository(FriendMessage)
    private readonly friendMessageRepository: Repository<FriendMessage>,
  ) { }

  async getFriends(userId: string) {
    try {
      if (userId) {
        return { msg: '获取用户好友成功', data: await this.friendRepository.find({ where: { userId: userId } }) };
      } else {
        return { msg: '获取用户好友失败', data: await this.friendRepository.find() };
      }
    } catch (e) {
      return { code: HttpStatus.INTERNAL_SERVER_ERROR, msg: '获取用户好友失败', data: e };
    }
  }

  async getFriendMessages(userId: string, friendId: string, current: number, pageSize: number) {
    const messages = await this.friendMessageRepository
      .createQueryBuilder("friendMessage")
      .orderBy("friendMessage.time", "DESC")
      .where("friendMessage.userId = :userId AND friendMessage.friendId = :friendId", { userId: userId, friendId: friendId })
      .orWhere("friendMessage.userId = :friendId AND friendMessage.friendId = :userId", { userId: userId, friendId: friendId })
      .skip(current)
      .take(pageSize)
      .getMany();
    return { msg: '', data: { messageArr: messages.reverse() } };
  }
}
