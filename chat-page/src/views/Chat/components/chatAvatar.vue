
<script setup lang="ts">
import { useChatStore } from '@/store/chat';
import { useUserStore } from '@/store/user';

import {
    // processReturn,
    formatTime
} from '@/utils/common';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
const props = defineProps(['data'])
const popoverRef=ref()
const chatStore = useChatStore()
const userStore = useUserStore()

const { userGather, friendGather } = storeToRefs(chatStore)


const addFriend = (friendId: string) => {
    chatStore.socket.emit('addFriend', {
        userId: userStore.user.userId,
        friendId: friendId,
        createTime: new Date().valueOf(),
    });
}

const changeRoom=(data:any)=>{
    chatStore.set_active_room(data)
    popoverRef.value.hide()
}

</script>
<template>
    <div class="avatar" v-if="userGather[data.userId]">
        <el-space>
            <el-popover trigger="click" v-if="!(props.data.userId === userStore.user.userId)" ref="popoverRef">
                <el-space direction="vertical" style="width: 100%;">
                    <el-avatar :size="35" :src="userGather[data.userId].avatar">
                        <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
                    </el-avatar>
                    <div>{{ userGather[data.userId].username }}</div>
                    <div>{{ userGather[data.userId].discription }}</div>
                    <el-button @click="changeRoom(userGather[data.userId])" type="primary"
                        v-if="friendGather[data.userId]">进入私聊</el-button>
                    <el-button @click="addFriend(data.userId)" type="primary" v-else>添加好友</el-button>
                </el-space>
                <template #reference>
                    <el-avatar :size="35" :src="userGather[data.userId].avatar" style="display: flex;" 
                        >
                        <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
                    </el-avatar>
                </template>
            </el-popover>
            <el-space direction="vertical">
                <span class="avatar-time">{{ formatTime(props.data.time) }}</span>
                <span style="color:white;" class="avatar-name">{{ userGather[props.data.userId].username }}</span>
            </el-space>
            <el-avatar :size="35" :src="userGather[data.userId]?userGather[data.userId].avatar:''" style="display: flex;"
                v-if="(props.data.userId === userStore.user.userId)">
                <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
            </el-avatar>
        </el-space>
    </div>
</template>
<style lang="less" scoped>
.avatar {
    display: flex;
    align-items: center;
    height: 37px;

    .avatar-img {
        cursor: pointer;
        width: 35px;
        height: 35px;
    }

    .avatar-name {
        margin-left: 5px;
    }

    .avatar-time {
        font-size: 12px;
        color: rgb(255, 255, 255, 0.75);
        margin-left: 3px;
    }
}

.avatar-card {
    display: flex;
    font-size: 18px;
    flex-direction: column;
    align-items: center;

    >div {
        margin: 4px;
    }
}
</style>
  