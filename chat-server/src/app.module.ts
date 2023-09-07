import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { FriendModule } from './modules/friend/friend.module';
import { GroupModule } from './modules/group/group.module';
import { ChatModule } from './modules/chat/chat.module';
import { AuthModule } from './modules/auth/auth.module';

import { HttpExceptionFilter } from "./common/filters/http-exception.filter"

import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/user/entity/user.entity';
import { FriendMessage } from './modules/friend/entities/friendMessage.entity';
import { FriendShip } from './modules/friend/entities/friend.entity';
import { Group } from './modules/group/entities/group.entity';
import { GroupShip } from './modules/group/entities/groupship.entity';
import { GroupMessage } from './modules/group/entities/groupMessage.entity';
import { TestGateway } from './modules/test/test.gateway';
import { TestModule } from './modules/test/test.module';
import { ChatGateway } from './modules/chat/chat.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, }),
    TypeOrmModule.forRoot({
      type: 'mysql',           // 数据库类型
      host: 'localhost',       // 数据库的连接地址host
      port: 3306,              // 数据库的端口 3306
      username: 'root',        // 连接账号
      password: '111111',     // 连接密码
      database: 'chat_test2',     // 连接的表名
      retryDelay: 3000,         // 重试连接数据库间隔
      retryAttempts: 10,       // 允许重连次数
      synchronize: true, // 实体与表同步 调试模式下开始。不然会有强替换导致数据丢是
      entities:[User,FriendMessage,FriendShip,Group,GroupShip,GroupMessage]
    }),
    UserModule,
    FriendModule,
    GroupModule,
    ChatModule,
    AuthModule,
    TestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
