<script setup lang="ts">
import chatTool from "./components/chatTool.vue"
import chatSearch from "./components/chatSearch.vue";
import chatList from "./components/chatList.vue";
import chatMessage from "./components/chatMessage.vue";
import { useUserStore } from "@/store/user";
import { useChatStore } from "@/store/chat";
import { useRouter } from "vue-router";
import { watch } from "vue";

const router=useRouter()

const useStore = useUserStore()
const chatStore = useChatStore()
const handleJoin = async () => {
    chatStore.connectSocket()
}
const init = () => {
    useStore.getUser
    handleJoin()
}
init()

watch(router.currentRoute,()=>{
    init()
})

const addGroup = (groupName: string) => {
    chatStore.socket.emit('addGroup', {
        userId: useStore.user.userId,
        groupName: groupName,
        createTime: new Date().valueOf(),
    });
}
// 加入群组
const joinGroup = (groupId: string) => {
    chatStore.socket.emit('joinGroup', {
        userId: useStore.user.userId,
        groupId: groupId,
    });
}

// 添加好友
const addFriend = (friendId: string) => {
    chatStore.socket.emit('addFriend', {
        userId: useStore.user.userId,
        friendId: friendId,
        createTime: new Date().valueOf(),
    });
}

// 设置当前聊天窗
const setActiveRoom = (room: Friend & Group) => {
    chatStore.set_active_room(room)
}


</script>

<template>
    <div class="chat">
        <div class="chat-part1">
            <chatTool></chatTool>
        </div>
        <div class="chat-part2">
            <chatSearch @addGroup="addGroup" @joinGroup="joinGroup" @addFriend="addFriend" @setActiveRoom="setActiveRoom">
            </chatSearch>
            <chatList></chatList>
        </div>
        <div class="chat-part3">
            <chatMessage></chatMessage>
        </div>
    </div>
</template>

<style lang="less" scoped>
.chat {
    height: 90%;
    width: 80%;
    max-height: 900px;
    min-height: 470px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.chat-part1 {
    height: 100%;
    min-width: 74px;
    // opacity: 0.2;
}

.chat-part2 {
    height: 100%;
    width: 230px;
    overflow: hidden;
    // background-color: rgba(0, 0, 0, 0.845);

}

.chat-part3 {
    flex: 1;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.06);
    overflow-y: hidden;
    position: relative;
}
</style>