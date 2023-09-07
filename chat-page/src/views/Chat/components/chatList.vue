<script setup lang="ts">
import { useChatStore } from '@/store/chat';
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia'



const chatStore = useChatStore()
const { activeRoom, groupGather, friendGather, unReadGather } = storeToRefs(chatStore)

const chatArr = ref<any>([])

watch(groupGather, () => {
    sortChat()
}, { deep: true })

watch(friendGather, () => {
    sortChat()
}, { deep: true })

const changeActiveRoom = (activeRoom: User & Group) => {
    chatStore.set_active_room(activeRoom)
    chatStore.lose_unread_gather(activeRoom.groupId || activeRoom.userId);
}


const sortChat = () => {
    chatArr.value = [];
    let groups = Object.values(groupGather.value);
    let friends = Object.values(friendGather.value);
    chatArr.value = [...groups, ...friends];
    // 对聊天窗进行排序(根据最新消息时间)
    chatArr.value = chatArr.value.sort((a: Group | Friend, b: Group | Friend) => {
        if (a.messages && b.messages) {
            return b.messages[b.messages.length - 1].time - a.messages[a.messages.length - 1].time;
        }
        if (a.messages) {
            return -1;
        }
        return 1;
    });
}
sortChat()

</script>

<template>
    <div class="base">
        <div class="card" v-for="(chat, index) in chatArr" :key="(chat.userId || chat.groupId) + index"
            :class="{ active: activeRoom && (((activeRoom.groupId && activeRoom.groupId === chat.groupId) || (!activeRoom.groupId && activeRoom.userId === chat.userId))) }"
            @click="changeActiveRoom(chat)">
            <div v-if="chat.groupId">
                <el-space>
                    <el-avatar :size="35" src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"
                        style="display: flex;">
                        <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
                    </el-avatar>
                    <div class="room-card-message">
                        <el-space direction="vertical" alignment="left">
                            <div class="room-name">{{ chat.groupName }}</div>
                            <div class="room-new" v-if="chat.messages">
                                <div class="text" v-text="chat.messages[chat.messages.length - 1].content"
                                    v-if="chat.messages[chat.messages.length - 1].messageType === 'text'"></div>
                                <div class="image" v-if="chat.messages[chat.messages.length - 1].messageType === 'image'">
                                    [图片]</div>
                            </div>
                        </el-space>
                    </div>
                    <el-badge class="room-card-badge" :value="unReadGather[chat.groupId]"
                        v-if="unReadGather[chat.groupId] != 0" />
                </el-space>
            </div>
            <div v-else>
                <el-space>
                    <el-avatar :size="35" :src="friendGather[chat.userId] ? friendGather[chat.userId].avatar : ''">
                        <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
                    </el-avatar>
                    <div class="room-card-message">
                        <el-space direction="vertical" alignment="left">
                            <div class="room-name">{{ chat.username }}</div>
                            <div class="room-new" v-if="chat.messages">
                                <div class="text" v-text="chat.messages[chat.messages.length - 1].content"
                                    v-if="chat.messages[chat.messages.length - 1].messageType === 'text'"></div>
                                <div class="image" v-if="chat.messages[chat.messages.length - 1].messageType === 'image'">
                                    [图片]</div>
                            </div>
                        </el-space>
                    </div>
                    <el-badge class="room-card-badge" :value="unReadGather[chat.groupId]"
                        v-if="unReadGather[chat.groupId] != 0" />
                </el-space>
            </div>
        </div>
    </div>
</template>

<style scoped>
.base::-webkit-scrollbar {
    display: none;
    /* Chrome Safari */
}

.base {
    height: calc(100% - 60px);
    width: 100%;
    overflow: auto;
    scrollbar-width: none;
    /* firefox */
    -ms-overflow-style: none;

    .card {
        /* width: 100%; */
        position: relative;
        min-height: 70px;
        display: flex;
        align-items: left;
        background-color: rgba(0, 0, 0, 0.2);
        padding: 5px 10px;
        text-align: left;
        transition: all 0.2s linear;
        cursor: pointer;

        /* cursor: pointer; */
        &:hover {
            background-color: rgb(0, 0, 0, 0.4);
        }

        &.active {
            background-color: rgb(0, 0, 0, 0.5);
        }


        .room-name {
            width: 100%;
            max-width: 144px;
            color: white;
            font-size: 17px;
            overflow: hidden;
            /* 超出的文本隐藏 */
            text-overflow: ellipsis;
            /*溢出用省略号显示*/
            white-space: nowrap;
            /*溢出不换行*/
        }

        .room-new {

            display: block;
            overflow: hidden;
            /* 超出的文本隐藏 */
            text-overflow: ellipsis;
            /*溢出用省略号显示*/
            white-space: nowrap;
            /*溢出不换行*/

            width: 100%;
            max-width: 140px;
            color: rgb(255, 255, 255, 0.6);
            font-size: 14px;
        }
    }
}
</style>