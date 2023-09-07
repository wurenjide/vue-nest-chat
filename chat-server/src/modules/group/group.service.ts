import { HttpStatus, Injectable } from '@nestjs/common';
import { Repository, Like, getRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { GroupShip } from './entities/groupship.entity';
import { GroupMessage } from './entities/groupMessage.entity';
import { User } from "../user/entity/user.entity"
@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupShip)
    private readonly groupUserRepository: Repository<GroupShip>,
    @InjectRepository(GroupMessage)
    private readonly groupMessageRepository: Repository<GroupMessage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  //获取用户的群
  async getUserGroups(userId: string) {
    try {
      if (userId) {
        const data = await this.groupUserRepository.find({ where: { userId: userId } });
        return { msg: '获取用户所有群成功', data };
      }
      return { code: HttpStatus.NOT_ACCEPTABLE, msg: '获取用户的群失败', data: "" };
    } catch (e) {
      return { code: HttpStatus.INTERNAL_SERVER_ERROR, msg: '获取用户的群失败', data: e };
    }
  }

  //获取群里的用户信息
  async getGroupUsers(groupId: string) {
    try {

      if (groupId) {
        const data = await this.groupUserRepository.find({ where: { groupId: groupId } });
        return { msg: '获取群的所有用户成功', data };
      }
      return { code: HttpStatus.NOT_ACCEPTABLE, msg: '获取群的用户失败', data: "" };
    } catch (e) {
      return { code: HttpStatus.INTERNAL_SERVER_ERROR, msg: '获取群的用户失败', data: e };
    }
  }

//获取群消息与群成员
  async getGroupMessages(groupId: string, current: number, pageSize: number) {
    let groupMessage = await this.groupMessageRepository
      .createQueryBuilder("groupMessage")
      .orderBy("groupMessage.time", "DESC")
      .where("groupMessage.groupId = :id", { id: groupId })
      .skip(current)
      .take(pageSize)
      .getMany();
    groupMessage = groupMessage.reverse();

    const userGather: { [key: string]: User } = {};
    let userArr = [];
    for (const message of groupMessage) {
      if (!userGather[message.userId]) {
        userGather[message.userId] = await this.userRepository
          .createQueryBuilder("user")
          .where("user.userId = :id", { id: message.userId })
          .getOne();
      }
    }
    userArr = Object.values(userGather);
    return { msg: '', data: { messageArr: groupMessage, userArr: userArr } };
  }

  //通过名字获取群
  async getGroupsByName(groupName: string) {
    try {
      if (groupName) {
        const groups = await this.groupRepository.find({ where: { groupName: Like(`%${groupName}%`) } });
        return { data: groups };
      }
      return { code: HttpStatus.NOT_ACCEPTABLE, msg: '请输入群昵称', data: null };
    } catch (e) {
      return { code: HttpStatus.INTERNAL_SERVER_ERROR, msg: '查找群错误', data: null };
    }
  }

}
