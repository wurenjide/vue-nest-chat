import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { passwordVerify, nameVerify } from "../../common/tool/utils"
import { GroupShip } from '../group/entities/groupship.entity';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User)
  private readonly userRepository: Repository<User>,
  @InjectRepository(GroupShip)
  private readonly groupUserRepository:Repository<GroupShip>,
    private readonly jwtService: JwtService,) { }

  async login(data: User): Promise<any> {
    const user = await this.userRepository.findOne({ where: { username: data.username } });
    if (!user) {
      return { code: 1, msg: '用户不存在', data: '' };
    }
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return { code: 1, msg: '密码错误', data: '' };
    }
    if (!passwordVerify(data.password) || !nameVerify(data.username)) {
      return { code: HttpStatus.NOT_ACCEPTABLE, msg: '注册校验不通过！', data: '' };
    }
    const payload = { userId: user.userId, password: user.password };
    return {
      msg: '登录成功',
      data: {
        user: user,
        token: this.jwtService.sign(payload)
      },
    };
  }
  async register(user: any): Promise<any> {
    const isHave = await this.userRepository.find({ where: { username: user.username } });
    if (isHave.length) {
      return { code: HttpStatus.NOT_ACCEPTABLE, msg: '用户名重复', data: '' };
    }
    if (!passwordVerify(user.password) || !nameVerify(user.username)) {
      return { code: HttpStatus.NOT_ACCEPTABLE, msg: '注册校验不通过！', data: '' };
    }
    user.password = await bcrypt.hash(user.password, 10)
    user.avatar = `api/avatar/avatar(${Math.round(Math.random() * 19 + 1)}).png`;
    user.role = 'user';
    const newUser = await this.userRepository.save(user);
    const payload = { userId: newUser.userId, password: newUser.password };
    await this.groupUserRepository.save({
      userId: newUser.userId,
      groupId: '聊天室',
    });
    return {
      code: HttpStatus.OK,
      msg: '注册成功',
      data: {
        user: newUser,
        token: this.jwtService.sign(payload)
      },
    };
  }
}
