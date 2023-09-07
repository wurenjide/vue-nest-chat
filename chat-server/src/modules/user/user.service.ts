import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { nameVerify, passwordVerify } from 'src/common/tool/utils';
import { Repository, Like } from 'typeorm';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {

  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }

  async getUserById(userId: string) {
    try {
      if (userId) {
        const data = await this.userRepository.findOne({
          where: { userId: userId }
        });
        return { code: HttpStatus.OK, msg: '获取用户成功', data };
      }
    } catch (e) {
      return { code: HttpStatus.INTERNAL_SERVER_ERROR, msg: '获取用户失败', data: e };
    }
  }

  async updateUserName(user: User) {
    console.log(2)
    try {
      const oldUser = await this.userRepository.findOne({ where: { userId: user.userId } })
      if (oldUser && nameVerify(user.username)) {
        const isHaveName = await this.userRepository.findOne({ where: { username: user.username } })
        if (isHaveName && isHaveName.userId != oldUser.userId) {
          return { code: HttpStatus.NOT_ACCEPTABLE, msg: "用户名重复", data: "" }
        }
        await this.userRepository.update(user.userId, user)
        return { code: HttpStatus.OK, msg: "用户信息修改成功", data: user }
      }else{
        return { code: HttpStatus.NOT_ACCEPTABLE, msg: "用户信息修改失败", data: "" }
      }
    } catch (e) {
      return { code: HttpStatus.INTERNAL_SERVER_ERROR, msg: "用户信息修改失败", data: e }
    }
  }

  async updatePassword(user: User, password: string) {
    try {
      const oldUser = await this.userRepository.findOne({ where: { userId: user.userId, username: user.username } });
      const isMatch = await bcrypt.compare(user.password, oldUser.password)
      if (isMatch) {
        return { code: HttpStatus.NOT_ACCEPTABLE, msg: "原密码错误", data: "" }
      }
      if (oldUser && passwordVerify(password)) {
        const newUser = JSON.parse(JSON.stringify(oldUser));
        newUser.password = await bcrypt.hash(password, 10);
        await this.userRepository.update(oldUser, newUser);
        return { code: HttpStatus.OK, msg: '更新用户密码成功', data: newUser };
      }
      return { code: HttpStatus.NOT_ACCEPTABLE, msg: '更新失败', data: '' };
    } catch (e) {
      return { code: HttpStatus.INTERNAL_SERVER_ERROR, msg: '更新用户密码失败', data: e };
    }
  }

  async updateUserDiscription(user: User, discription: string) {
    try {
      const oldUser = await this.userRepository.findOne({ where: { userId: user.userId, username: user.username } });
      if (oldUser) {
        const newUser = JSON.parse(JSON.stringify(oldUser));
        newUser.discription = discription
        await this.userRepository.update(oldUser, newUser)
        return { code: HttpStatus.OK, msg: "更新成功", data: newUser }
      }
      return { code: HttpStatus.NOT_ACCEPTABLE, msg: '更新失败', data: '' };
    } catch (e) {
      return { code: HttpStatus.INTERNAL_SERVER_ERROR, msg: '更新失败', data: e };
    }
  }

  async setUserAvatar(user: User, file: any) {
    try {
      const random = Date.now() + '&';
      const stream = createWriteStream(join('public/avatar', random + file.originalname));
      stream.write(file.buffer);
      const avatar = process.env.BASE_URL + ":" + process.env.PORT + `/avatar/${random}${file.originalname}`;
      return { code: HttpStatus.OK, msg: '上传头像成功', data: avatar };
    } catch (e) {
      return { code: HttpStatus.INTERNAL_SERVER_ERROR, msg: '修改头像失败' };
    }
  }

  async getUserByUserName(username: string) {
    try {
      if (username) {
        const users = await this.userRepository.find({
          where: { username: Like(`%${username}%`) }
        });
        return { code: HttpStatus.OK, msg: "查找成功", data: users };
      }
      return { code: HttpStatus.NOT_ACCEPTABLE, msg: '请输入用户名', data: null };
    } catch (e) {
      return { code: HttpStatus.INTERNAL_SERVER_ERROR, msg: '查找用户错误', data: e };
    }
  }

  async deleteUser(userId: string) {
    try {
      await this.userRepository.delete({ userId: userId })
      return { code: HttpStatus.OK, msg: "删除成功", data: "" }
    } catch (e) {
      return { code: HttpStatus.INTERNAL_SERVER_ERROR, msg: '用户删除失败', data: e };
    }
  }

  async setUserImage(file: any) {
    try {
      const random = Date.now() + '&';
      const stream = createWriteStream(join('public/static', random + file.originalname));
      stream.write(file.buffer);
      const avatar = process.env.BASE_URL + ":" + process.env.PORT + `/static/${random}${file.originalname}`;
      return { code: HttpStatus.OK, msg: '上传图片成功', data: avatar };
    } catch (e) {
      return { code: HttpStatus.INTERNAL_SERVER_ERROR, msg: '上传图片失败' };
    }
  }
}
