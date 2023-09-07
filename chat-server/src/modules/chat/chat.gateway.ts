import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FriendShip } from "../friend/entities/friend.entity";
import { FriendMessage } from "../friend/entities/friendMessage.entity";
import { Group } from "../group/entities/group.entity";
import { GroupMessage } from "../group/entities/groupMessage.entity";
import { GroupShip } from "../group/entities/groupship.entity";
import { User } from "../user/entity/user.entity";

import { Server, Socket } from 'socket.io';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketServer, WebSocketGateway, OnGatewayConnection } from "@nestjs/websockets";
import { nameVerify } from "src/common/tool/utils";
import { HttpStatus } from "@nestjs/common";

@WebSocketGateway({
    cors: { origin: /.*/, credentials: true },
    port: 3000,
    path: '/chat',
    /**
     * 可以指定path:""属性创建更加复杂的应用，同时客服端需要设置path
     * 注意点:
     * 1. 如果使用了path，那么就会涉及到跨域问题，需要设置cors
     * 2. 如果只是使用namespace，啥都不需要干
     */
  })
export class ChatGateway  {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Group)
        private readonly groupRepository: Repository<Group>,
        @InjectRepository(GroupShip)
        private readonly groupUserRepository: Repository<GroupShip>,
        @InjectRepository(GroupMessage)
        private readonly groupMessageRepository: Repository<GroupMessage>,
        @InjectRepository(FriendShip)
        private readonly friendRepository: Repository<FriendShip>,
        @InjectRepository(FriendMessage)
        private readonly friendMessageRepository: Repository<FriendMessage>,
    ) {

        this.defaultGroup = '聊天室';
    }
    @WebSocketServer()
    server: Server;

    // 默认群
    defaultGroup: string;

    // socket连接钩子
    async handleConnection(client: Socket): Promise<string> {
        const userRoom = client.handshake.query.userId;
        // 连接默认加入"聊天室"房间
        client.join(this.defaultGroup);
        // 进来统计一下在线人数
        this.getActiveGroupUser();
        // 用户独有消息房间 根据userId
        if (userRoom) {
            client.join(userRoom);
        }
        return '连接成功';
    }


    // socket断连钩子
    async handleDisconnect(): Promise<any> {
        this.getActiveGroupUser();
    }

    // 创建群组
    @SubscribeMessage('addGroup')
    async addGroup(@ConnectedSocket() client: Socket, @MessageBody() data: Group): Promise<any> {
        const isUser = await this.userRepository.findOne({ where: { userId: data.userId } });
        if (isUser) {
            const isHaveGroup = await this.groupRepository.findOne({ where: { groupName: data.groupName } });
            if (isHaveGroup) {
                this.server.to(data.userId).emit('addGroup', { code: HttpStatus.NOT_ACCEPTABLE, msg: '该群名字已存在', data: isHaveGroup });
                return;
            }
            if (!nameVerify(data.groupName)) {
                return;
            }
            data = await this.groupRepository.save(data);
            client.join(data.groupId);
            const group = await this.groupUserRepository.save(data);
            this.server.to(group.groupId).emit('addGroup', { code: HttpStatus.OK, msg: `成功创建群${data.groupName}`, data: group });
            this.getActiveGroupUser();
        } else {
            this.server.to(data.userId).emit('addGroup', { code: HttpStatus.UNAUTHORIZED, msg: `你没资格创建群` });
        }
    }


    // 加入群组
    @SubscribeMessage('joinGroup')
    async joinGroup(@ConnectedSocket() client: Socket, @MessageBody() data: GroupShip): Promise<any> {
        const isUser = await this.userRepository.findOne({ where: { userId: data.userId } });
        if (isUser) {
            const group = await this.groupRepository.findOne({ where: { groupId: data.groupId } });
            let userGroup = await this.groupUserRepository.findOne({ where: { groupId: group.groupId, userId: data.userId } });
            const user = await this.userRepository.findOne({ where: { userId: data.userId } });
            if (group && user) {
                if (!userGroup) {
                    data.groupId = group.groupId;
                    userGroup = await this.groupUserRepository.save(data);
                }
                client.join(group.groupId);
                const res = { group: group, user: user };
                this.server.to(group.groupId).emit('joinGroup', {
                    code: HttpStatus.OK,
                    msg: `${user.username}加入群${group.groupName}`,
                    data: res
                });
                this.getActiveGroupUser();
            } else {
                this.server.to(data.userId).emit('joinGroup', { code: HttpStatus.NOT_ACCEPTABLE, msg: '进群失败', data: '' });
            }
        } else {
            this.server.to(data.userId).emit('joinGroup', { code: HttpStatus.UNAUTHORIZED, msg: '你没资格进群' });
        }
    }

    // 加入群组的socket连接
    @SubscribeMessage('joinGroupSocket')
    async joinGroupSocket(@ConnectedSocket() client: Socket, @MessageBody() data: GroupShip): Promise<any> {
        const group = await this.groupRepository.findOne({ where: { groupId: data.groupId } });
        const user = await this.userRepository.findOne({ where: { userId: data.userId } });
        if (group && user) {
            client.join(group.groupId);
            const res = { group: group, user: user };
            this.server.to(group.groupId).emit('joinGroupSocket', { code: HttpStatus.OK, msg: `${user.username}加入群${group.groupName}`, data: res });
        } else {
            this.server.to(data.userId).emit('joinGroupSocket', { code: HttpStatus.NOT_ACCEPTABLE, msg: '进群失败', data: '' });
        }
    }

    // 发送群消息
    @SubscribeMessage('groupMessage')
    async sendGroupMessage(@MessageBody() data: GroupMessageDto): Promise<any> {
        const isUser = await this.userRepository.findOne({ where: { userId: data.userId } });
        if (isUser) {
            const userGroupMap = await this.groupUserRepository.findOne({ where: { userId: data.userId, groupId: data.groupId } });
            if (!userGroupMap || !data.groupId) {
                this.server.to(data.userId).emit('groupMessage', { code: HttpStatus.NOT_ACCEPTABLE, msg: '群消息发送错误', data: '' });
                return;
            }
            data.time = new Date().valueOf(); // 使用服务端时间
            await this.groupMessageRepository.save(data);
            this.server.to(data.groupId).emit('groupMessage', { code: HttpStatus.OK, msg: '发送成功', data: data });
        } else {
            this.server.to(data.userId).emit('groupMessage', { code: HttpStatus.UNAUTHORIZED, msg: '你没资格发消息' });
        }
    }

    // 添加好友
    @SubscribeMessage('addFriend')
    async addFriend(@ConnectedSocket() client: Socket, @MessageBody() data: FriendShip): Promise<any> {
        const isUser = await this.userRepository.findOne({ where: { userId: data.userId } });
        if (isUser) {
            if (data.friendId && data.userId) {
                if (data.userId === data.friendId) {
                    this.server.to(data.userId).emit('addFriend', { code: HttpStatus.NOT_ACCEPTABLE, msg: '不能添加自己为好友', data: '' });
                    return;
                }
                const relation1 = await this.friendRepository.findOne({ where: { userId: data.userId, friendId: data.friendId } });
                const relation2 = await this.friendRepository.findOne({ where: { userId: data.friendId, friendId: data.userId } });
                const roomId = data.userId > data.friendId ? data.userId + data.friendId : data.friendId + data.userId;

                if (relation1 || relation2) {
                    this.server.to(data.userId).emit('addFriend', { code: HttpStatus.NOT_ACCEPTABLE, msg: '已经有该好友', data: data });
                    return;
                }

                const friend = await this.userRepository.findOne({ where: { userId: data.friendId } });
                const user = await this.userRepository.findOne({ where: { userId: data.userId } });
                if (!friend) {
                    this.server.to(data.userId).emit('addFriend', { code: HttpStatus.NOT_ACCEPTABLE, msg: '该好友不存在', data: '' });
                    return;
                }

                // 双方都添加好友 并存入数据库
                await this.friendRepository.save(data);
                const friendData = JSON.parse(JSON.stringify(data));
                const friendId = friendData.friendId;
                friendData.friendId = friendData.userId;
                friendData.userId = friendId;
                delete friendData.id;
                await this.friendRepository.save(friendData);
                client.join(roomId);

                // 如果是删掉的好友重新加, 重新获取一遍私聊消息
                let messages = await this.friendMessageRepository
                    .createQueryBuilder("friendMessage")
                    .orderBy("friendMessage.time", "DESC")
                    .where("friendMessage.userId = :userId AND friendMessage.friendId = :friendId", { userId: data.userId, friendId: data.friendId })
                    .orWhere("friendMessage.userId = :friendId AND friendMessage.friendId = :userId", { userId: data.userId, friendId: data.friendId })
                    .take(30)
                    .getMany();
                messages = messages.reverse();

                if (messages.length) {
                    // @ts-ignore
                    friend.messages = messages;
                    // @ts-ignore
                    user.messages = messages;
                }
                this.server.to(data.userId).emit('addFriend', { code: HttpStatus.OK, msg: `添加好友${friend.username}成功`, data: friend });
                this.server.to(data.friendId).emit('addFriend', { code: HttpStatus.OK, msg: `${user.username}添加你为好友`, data: user });
            }
        } else {
            this.server.to(data.userId).emit('addFriend', { code: HttpStatus.UNAUTHORIZED, msg: '你没资格加好友' });
        }
    }


    // 加入私聊的socket连接
    @SubscribeMessage('joinFriendSocket')
    async joinFriend(@ConnectedSocket() client: Socket, @MessageBody() data: FriendShip): Promise<any> {
        if (data.friendId && data.userId) {
            const relation = await this.friendRepository.findOne({ where: { userId: data.userId, friendId: data.friendId } });
            const roomId = data.userId > data.friendId ? data.userId + data.friendId : data.friendId + data.userId;
            if (relation) {
                client.join(roomId);
                this.server.to(data.userId).emit('joinFriendSocket', { code: HttpStatus.OK, msg: '进入私聊socket成功', data: relation });
            }
        }
    }

    // 发送私聊消息
    @SubscribeMessage('friendMessage')
    async friendMessage(@ConnectedSocket() client: Socket, @MessageBody() data: FriendMessageDto): Promise<any> {
        const isUser = await this.userRepository.findOne({ where: { userId: data.userId } });
        if (isUser) {
            if (data.userId && data.friendId) {
                const roomId = data.userId > data.friendId ? data.userId + data.friendId : data.friendId + data.userId;
                data.time = new Date().valueOf();
                await this.friendMessageRepository.save(data);
                this.server.to(roomId).emit('friendMessage', { code: HttpStatus.OK, msg: '', data });
            }
        } else {
            this.server.to(data.userId).emit('friendMessage', { code: HttpStatus.NOT_ACCEPTABLE, msg: '你没资格发消息', data });
        }
    }

    // 获取所有群和好友数据
    @SubscribeMessage('chatData')
    async getAllData(@ConnectedSocket() client: Socket, @MessageBody() user: User): Promise<any> {
        const isUser = await this.userRepository.findOne({ where: { userId: user.userId, password: user.password } });
        if (isUser) {
            let groupArr: GroupDto[] = [];
            let friendArr: FriendDto[] = [];
            const userGather: { [key: string]: User } = {};
            let userArr: FriendDto[] = [];

            const groupMap: GroupShip[] = await this.groupUserRepository.find({ where: { userId: user.userId } });
            const friendMap: FriendShip[] = await this.friendRepository.find({ where: { userId: user.userId } });
            const groupPromise = groupMap.map(async (item) => {
                return await this.groupRepository.findOne({ where: { groupId: item.groupId } });
            });
            const groupMessagePromise = groupMap.map(async (item) => {
                let groupMessage = await this.groupMessageRepository
                    .createQueryBuilder("groupMessage")
                    .orderBy("groupMessage.time", "DESC")
                    .where("groupMessage.groupId = :id", { id: item.groupId })
                    .take(30)
                    .getMany();
                groupMessage = groupMessage.reverse();
                // 这里获取一下发消息的用户的用户信息
                for (const message of groupMessage) {
                    if (!userGather[message.userId]) {
                        userGather[message.userId] = await this.userRepository.findOne({ where: { userId: message.userId } });
                    }
                }
                return groupMessage;
            });

            const friendPromise = friendMap.map(async (item) => {
                return await this.userRepository.findOne({
                    where: { userId: item.friendId }
                });
            });
            const friendMessagePromise = friendMap.map(async (item) => {
                const messages = await this.friendMessageRepository
                    .createQueryBuilder("friendMessage")
                    .orderBy("friendMessage.time", "DESC")
                    .where("friendMessage.userId = :userId AND friendMessage.friendId = :friendId", { userId: item.userId, friendId: item.friendId })
                    .orWhere("friendMessage.userId = :friendId AND friendMessage.friendId = :userId", { userId: item.userId, friendId: item.friendId })
                    .take(30)
                    .getMany();
                return messages.reverse();
            });

            const groups: GroupDto[] = await Promise.all(groupPromise);
            const groupsMessage: Array<GroupMessageDto[]> = await Promise.all(groupMessagePromise);
            groups.map((group, index) => {
                if (groupsMessage[index] && groupsMessage[index].length) {
                    group.messages = groupsMessage[index];
                }
            });
            groupArr = groups;

            const friends: FriendDto[] = await Promise.all(friendPromise);
            const friendsMessage: Array<FriendMessageDto[]> = await Promise.all(friendMessagePromise);
            friends.map((friend, index) => {
                if (friendsMessage[index] && friendsMessage[index].length) {
                    friend.messages = friendsMessage[index];
                }
            });
            friendArr = friends;
            userArr = [...Object.values(userGather), ...friendArr];
            this.server.to(user.userId).emit('chatData', {
                code: HttpStatus.OK, msg: '获取聊天数据成功', data: {
                    groupData: groupArr,
                    friendData: friendArr,
                    userData: userArr,
                }
            });
        }
    }

    // 退群
    @SubscribeMessage('exitGroup')
    async exitGroup(@ConnectedSocket() client: Socket, @MessageBody() groupMap: GroupShip): Promise<any> {
        if (groupMap.groupId === this.defaultGroup) {
            return this.server.to(groupMap.userId).emit('exitGroup', { code: HttpStatus.NOT_ACCEPTABLE, msg: '默认群不可退' });
        }
        const user = await this.userRepository.findOne({ where: { userId: groupMap.userId } });
        const group = await this.groupRepository.findOne({ where: { groupId: groupMap.groupId } });
        const map = await this.groupUserRepository.findOne({ where: { userId: groupMap.userId, groupId: groupMap.groupId } });
        if (user && group && map) {
            await this.groupUserRepository.remove(map);
            this.server.to(groupMap.userId).emit('exitGroup', { code: HttpStatus.OK, msg: '退群成功', data: groupMap });
            return this.getActiveGroupUser();
        }
        this.server.to(groupMap.userId).emit('exitGroup', { code: HttpStatus.INTERNAL_SERVER_ERROR, msg: '退群失败' });
    }

    // 删好友
    @SubscribeMessage('exitFriend')
    async exitFriend(@ConnectedSocket() client: Socket, @MessageBody() userMap: FriendShip): Promise<any> {
        const user = await this.userRepository.findOne({ where: { userId: userMap.userId } });
        const friend = await this.userRepository.findOne({ where: { userId: userMap.friendId } });
        const map1 = await this.friendRepository.findOne({ where: { userId: userMap.userId, friendId: userMap.friendId } });
        const map2 = await this.friendRepository.findOne({ where: { userId: userMap.friendId, friendId: userMap.userId } });
        if (user && friend && map1 && map2) {
            await this.friendRepository.remove(map1);
            await this.friendRepository.remove(map2);
            return this.server.to(userMap.userId).emit('exitFriend', { code: HttpStatus.OK, msg: '删好友成功', data: userMap });
        }
        this.server.to(userMap.userId).emit('exitFriend', { code: HttpStatus.INTERNAL_SERVER_ERROR, msg: '删好友失败' });
    }




    // 获取在线用户
    async getActiveGroupUser() {
        // 从socket中找到连接人数
        // @ts-ignore;

        let userIdArr = Object.values(this.server.engine.clients).map(item => {
            // @ts-ignore;
            return item.request._query.userId;
        });
        // 数组去重
        userIdArr = Array.from(new Set(userIdArr));

        const activeGroupUserGather = {};
        for (const userId of userIdArr) {
            const userGroupArr = await this.groupUserRepository.find({ where: { userId: userId } });
            const user = await this.userRepository.findOne({ where: { userId: userId } });
            if (user && userGroupArr.length) {
                userGroupArr.map(item => {
                    if (!activeGroupUserGather[item.groupId]) {
                        activeGroupUserGather[item.groupId] = {};
                    }
                    activeGroupUserGather[item.groupId][userId] = user;
                });
            }
        }

        this.server.to(this.defaultGroup).emit('activeGroupUser', {
            msg: 'activeGroupUser',
            data: activeGroupUserGather
        });
    }
}