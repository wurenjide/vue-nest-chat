import { defineStore, storeToRefs } from 'pinia'
import { useUserStore } from './user';
import { io } from 'socket.io-client';
import { ElMessage } from 'element-plus';
const useStore = useUserStore()
const { user } = storeToRefs(useStore)
export const useChatStore = defineStore("chat", {
    state: () => ({
        socket: <any>null,
        dropped: false,
        activeGroupUser: <any>{},
        activeRoom: <any>null,
        groupGather: <any>{},
        userGather: <any>{},
        friendGather: <any>{},
        unReadGather: <any>{},
    }),
    actions: {
        async connectSocket() {
            const socket = io("http://127.0.0.1:3000", { path: "/chat", query: { userId: user.value.userId } }).connect({ reconnection: true });
            socket.on('connect', async () => {
                console.log('连接成功');

                // 获取聊天室所需所有信息
                socket.emit('chatData', user.value);
                // 先保存好socket对象
                this.socket = socket
            });

            socket.on('activeGroupUser', (data: any) => {
                this.activeGroupUser = data.data
                let user: any = {}
                for (user of Object.values(data.data["聊天室"])) {
                    // 如果当前userGather没有该在线用户, 应该马上存储
                    this.userGather[user.userId] = user
                }
            });


            socket.on('addGroup', (res: ServerRes) => {
                if (res.code != 200) {
                    return ElMessage.error(res.msg)
                }
                ElMessage.success(res.msg)
                this.set_group_gather(res.data)
            });

            socket.on('joinGroup', async (res: ServerRes) => {
                if (res.code != 200) {
                    return ElMessage.error(res.msg);
                }
                let newUser = res.data.user;
                let group = res.data.group;
                if (newUser.userId != user.value.userId) {
                    this.set_user_gather(newUser)
                    return ElMessage.success(`${newUser.username}加入群${group.groupName}`);
                } else {
                    console.log(this.groupGather, group.groupId);
                    // 是用户自己 则加入到某个群
                    if (!this.groupGather[group.groupId]) {
                        this.set_group_gather(group)
                        // 获取群里面所有用户的用户信息
                        socket.emit('chatData', user);
                    }
                    ElMessage.success(`成功加入群${group.groupName}`);
                    this.activeRoom = this.groupGather[group.groupId]
                }
            });

            socket.on('joinGroupSocket', (res: ServerRes) => {
                if (res.code != 200) {
                    return ElMessage.error(res.msg);
                }
                let newUser: Friend = res.data.user;
                let group: Group = res.data.group;
                let friendGather: any = this.friendGather;
                if (newUser.userId != user.value.userId) {
                    this.set_user_gather(newUser)
                    if (friendGather[newUser.userId]) {
                        // 当用户的好友更新了用户信息
                        let messages;
                        if (friendGather[newUser.userId].messages) {
                            messages = friendGather[newUser.userId].messages;
                        }
                        this.set_friend_gather(newUser)
                        this.set_friend_messages(messages)
                    }
                    // @ts-ignore 解决重复进群消息问题
                    if (window.msg === newUser.userId) {
                        return;
                    }
                    // @ts-ignore
                    window.msg = newUser.userId;
                    return ElMessage.info(`${newUser.username}加入群${group.groupName}`);
                } else {
                    if (!this.groupGather[group.groupId]) {
                        this.set_group_gather(group)
                    }
                    this.set_user_gather(newUser)
                }
            });

            socket.on('groupMessage', (res: ServerRes) => {
                console.log('on groupMessage', res);
                if (res.code == 200) {
                    if (this.groupGather[res.data.groupId].messages) {
                        this.groupGather[res.data.groupId].messages!.push(res.data);
                    } else {
                        this.groupGather[res.data.groupId]['messages'] = [res.data]
                    }
                    let activeRoom: any = this.activeRoom;
                    if (activeRoom && activeRoom.groupId !== res.data.groupId) {
                        if (!this.unReadGather[res.data.groupId]) {
                            this.unReadGather[res.data.groupId] = 1
                        } else {
                            ++this.unReadGather[res.data.groupId]
                        }
                    }
                } else {
                    ElMessage.error(res.msg);
                }
            });

            socket.on('addFriend', (res: ServerRes) => {
                console.log('on addFriend', res);
                if (res.code == 200) {
                    this.set_friend_gather(res.data)
                    this.set_user_gather(res.data)
                    ElMessage.info(res.msg);
                    socket.emit('joinFriendSocket', {
                        userId: user.value.userId,
                        friendId: res.data.userId,
                    });
                } else {
                    ElMessage.error(res.msg);
                }
            });

            socket.on('joinFriendSocket', (res: ServerRes) => {
                if (res.code == 200) {
                    console.log('成功加入私聊房间');
                }
            });


            socket.on('friendMessage', (res: ServerRes) => {
                if (res.code == 200) {
                    if (res.data.friendId === user.value.userId || res.data.userId === user.value.userId) {
                        let userId = useStore.getUser.userId
                        if (res.data.friendId === userId) {
                            if (this.friendGather[res.data.userId].messages) {
                                this.friendGather[res.data.userId].messages!.push(res.data);
                            } else {
                                this.friendGather[res.data.userId]['messages'] = [res.data]
                            }
                        } else {
                            if (this.friendGather[res.data.friendId].messages) {
                                this.friendGather[res.data.friendId].messages!.push(res.data);
                            } else {
                                this.friendGather[res.data.friendId]['messages'] = [res.data]
                            }
                        }
                        let activeRoom: any = this.activeRoom;
                        if (activeRoom && activeRoom.userId !== res.data.userId && activeRoom.userId !== res.data.friendId) {
                            if (!this.unReadGather[res.data.userId]) {
                                this.unReadGather[res.data.userId] = 1
                            } else {
                                ++this.unReadGather[res.data.userId];
                            }
                        }
                    }
                } else {
                    ElMessage.error(res.msg);
                }
            });

            socket.on('chatData', (res: ServerRes) => {
                if (res.code != 200) {
                    return ElMessage.error(res.msg);
                }
                this.handleChatData(res.data)
                this.dropped = false
            });

            socket.on('exitGroup', (res: ServerRes) => {
                if (res.code == 200) {
                    delete this.groupGather[res.data.groupId]
                    this.activeRoom = this.groupGather["聊天室"]
                    ElMessage.success(res.msg);
                } else {
                    ElMessage.error(res.msg);
                }
            });

            socket.on('exitFriend', (res: ServerRes) => {
                if (res.code == 200) {
                    delete this.friendGather[res.data.friendId]
                    this.activeRoom = this.groupGather['聊天室']
                    ElMessage.success(res.msg);
                } else {
                    ElMessage.error(res.msg);
                }
            });

        },
        async handleChatData(payload: any) {
            const useStore = useUserStore()
            const { user } = storeToRefs(useStore)
            let socket = this.socket;
            let groupGather = this.groupGather;
            let groupArr = payload.groupData;
            let friendArr = payload.friendData;
            let userArr = payload.userData;


            if (groupArr.length) {
                for (let group of groupArr) {
                    socket.emit('joinGroupSocket', {
                        groupId: group.groupId,
                        userId: user.value.userId,
                    });
                    this.set_group_gather(group)
                }
            }
            if (friendArr.length) {
                for (let friend of friendArr) {
                    socket.emit('joinFriendSocket', {
                        userId: user.value.userId,
                        friendId: friend.userId,
                    });
                    this.set_friend_gather(friend)
                }
            }
            if (userArr.length) {
                for (let user of userArr) {
                    this.set_user_gather(user)
                }
            }

            let activeRoom: any = this.activeRoom;
            let groupGather2 = this.groupGather;
            let friendGather2 = this.friendGather;
            if (!activeRoom) {
                // 更新完数据没有默认activeRoom设置群为'阿童木聊天室'
                return this.activeRoom = groupGather['聊天室']
            }
            this.activeRoom = groupGather2[activeRoom.groupId] || friendGather2[activeRoom.userId]
        },

        set_user_gather(payload: any) {
            this.userGather[payload.userId] = payload
        },
        set_friend_gather(payload: any) {
            this.friendGather[payload.userId] = payload
        },
        set_group_gather(payload: any) {
            this.groupGather[payload.groupId] = payload
        },

        set_group_messages(payload: any) {
            if (payload && payload.length) {
                this.groupGather[payload[0].groupId]['messages'] = payload
            }
        },
        set_friend_messages(payload: any) {
            let userId = useStore.getUser.userId
            if (payload && payload.length) {
                if (payload[0].friendId === userId) {
                    this.friendGather[payload[0].userId]["messages"] = payload
                } else {
                    this.friendGather[payload[0].friendId]["messages"] = payload
                }
            }
        },

        lose_unread_gather(payload: any) {
            this.unReadGather[payload] = 0
        },
        set_active_room(payload: any) {
            this.activeRoom = payload
        },
        clear_chat_store() {
            this.socket.disconnect()
        },

    },
})