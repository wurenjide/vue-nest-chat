<script setup lang="ts">
import chatActive from "./chatActive.vue"
import chatInput from "./chatInput.vue"
import chatAvatar from "./chatAvatar.vue";
import { useUserStore } from "@/store/user";
import { useChatStore } from "@/store/chat";
import { computed, nextTick, ref, toRaw, watch } from "vue";
import { processReturn, isUrl } from "@/utils/common";
import { getGroupMessagesById } from "@/api/group"
import { getFriendMessageById } from "@/api/friend";
import { storeToRefs } from "pinia";
import { Loading } from "@element-plus/icons-vue"

const userStore = useUserStore()
const chatStore = useChatStore()

const { activeRoom, groupGather, userGather } = storeToRefs(chatStore)


// const text = ref<string>("")
const needScrollToBottom = ref<boolean>(true);
const mes = ref<any>([])
const msg_m = ref<any>(null)
const msg_con = ref<any>(null)
const lastMessagePosition = ref<number>(0)
const spinning = ref<boolean>(false)
const pageSize = ref<number>(30)
const isNoData = ref<boolean>(false)
// const lastTime = ref<number>(0)



const chatName = computed(() => {
    if (activeRoom.value || activeRoom.value) {
        if (toRaw(groupGather.value[activeRoom.value.groupId])) {
            return toRaw(groupGather.value[activeRoom.value.groupId]).groupName;
        } else if (toRaw(userGather.value[activeRoom.value.userId])) {
            return toRaw(userGather.value[activeRoom.value.userId]).username;
        }
    }

})
watch(activeRoom, () => {
    if (needScrollToBottom.value) {
        addMessage();
    }
    if (activeRoom.value)
        mes.value = activeRoom.value.messages
    needScrollToBottom.value = true;
}, { deep: true })

/**
 * 滚动到底部
 */
const scrollToBottom = () => {
    nextTick(() => {
        msg_m.value.scrollTop = msg_m.value.scrollHeight
    })
}
watch(activeRoom, () => {
    isNoData.value = false;
    if (activeRoom.value && activeRoom.value.messages && activeRoom.value.messages.length > 30) {
        activeRoom.value.messages = activeRoom.value.messages.splice(activeRoom.value.messages.length - 30, 30) as GroupMessage[] &
            FriendMessage[];
    }
    scrollToBottom();
}, {})

/**
 * 在分页信息的基础上来了新消息
 */
const addMessage = () => {
    if (activeRoom.value && activeRoom.value.messages) {
        // 新消息来了只有是自己发的消息和消息框本身在底部才会滚动到底部
        let messages = activeRoom.value.messages;
        if (
            messages[messages.length - 1].userId === userStore.user.userId ||
            (msg_m && msg_m.value.scrollTop + msg_m.value.offsetHeight + 100 > msg_m.value.scrollHeight)
        ) {
            scrollToBottom();
        }
    }
}

/**
 * 获取更多消息
 * @params text
 */
const getMoreMessage = async () => {
    console.log(isNoData.value)
    if (isNoData.value) {
        return false;
    }
    console.log(1)
    spinning.value = true;
    if (activeRoom.value.groupId) {
        await getGroupMessages();
    } else {
        await getFriendMessages();
    }
    nextTick(() => {
        msg_m.value.scrollTop = msg_con.value.offsetHeight - lastMessagePosition.value;
        spinning.value = false;
    });
}


/**
 * 获取群聊消息
 */
const getGroupMessages = async () => {
    let groupId = activeRoom.value.groupId;
    let current = activeRoom.value.messages!.length;
    let currentMessage = activeRoom.value.messages ? activeRoom.value.messages : [];
    let data: PagingResponse = processReturn(
        await getGroupMessagesById({
            groupId,
            current,
            pageSize: pageSize.value,
        })
    );
    if (data) {
        if (!data.messageArr.length || data.messageArr.length < pageSize.value) {
            isNoData.value = true;
        }
        needScrollToBottom.value = false;
        chatStore.set_group_messages([...data.messageArr, ...currentMessage]);
        for (let user of data.userArr) {
            if (!userGather.value[user.userId]) {
                chatStore.set_user_gather(user);
            }
        }
    }
}

/**
 * 获取私聊消息
 */
const getFriendMessages = async () => {
    let userId = userStore.user.userId;
    let friendId = activeRoom.value.userId;
    let current = activeRoom.value.messages!.length;
    let currentMessage = activeRoom.value.messages ? activeRoom.value.messages : [];
    let data: PagingResponse = processReturn(
        await getFriendMessageById({
            userId,
            friendId,
            current,
            pageSize: pageSize.value,
        })
    );
    if (data) {
        if (!data.messageArr.length || data.messageArr.length < pageSize.value) {
            isNoData.value = true;
        }
        needScrollToBottom.value = false;
        chatStore.set_friend_messages([...data.messageArr, ...currentMessage]);
    }
}



/**
 * 监听滚动事件
 */
const orderScroll = () => {
    // 只有有消息且滚动到顶部时才进入
    if (msg_m.value.scrollTop === 0) {
        lastMessagePosition.value = msg_con.value.offsetHeight;
        let messages = activeRoom.value.messages;
        if (messages && messages.length >= pageSize.value && !spinning.value) {
            getMoreMessage();
        }
    }
}


</script>
<template>
    <div class="message">
        <div class="message-header">
            <div class="text-center">{{ chatName }}</div>
            <div class="icon-right">
                <chatActive
                    v-if="activeRoom ? (groupGather[activeRoom.groupId] ? groupGather[activeRoom.groupId] : '') : ''"
                    type="group"></chatActive>
                <chatActive v-else type="friend"></chatActive>
            </div>
        </div>
        <div class="loading" v-if="spinning && !isNoData">
            <el-icon class="is-loading" color="#fff" :size="20">
                <Loading />
            </el-icon>
        </div>
        <div class="message-main" :style="{ opacity: 1 }" ref="msg_m" @scroll="orderScroll()">
            <div class="message-content" ref="msg_con">
                <transition name="noData">
                    <div class="noData" v-if="isNoData">没有更多消息了~</div>
                </transition>
                <template v-for="item in mes">
                    <div>
                        <div class="message-content-message"
                            :class="{ 'text-right': item.userId === userStore.user.userId }">
                            <chatAvatar :data="item"></chatAvatar>
                            <div>
                                <div class="message-content-image" v-if="item.messageType === 'image'">
                                    <viewer style="display:flex;align-items:center;">
                                        <img :src="item.content" alt="" />
                                    </viewer>
                                </div>
                                <a class="message-content-text" v-else-if="isUrl(item.content)" :href="item.content"
                                    target="_blank">{{ item.content }}</a>
                                <div class="message-content-text" v-text="item.content"
                                    v-else-if="item.messageType === 'text'"></div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <chatInput></chatInput>
    </div>
</template>
<style lang="less" scoped>
.message {
    overflow: hidden;
    height: 100%;
    position: relative;

    .message-header {
        height: 60px;
        line-height: 60px;
        z-index: 100;
        background-color: rgb(0, 0, 0);
        display: flex;
        align-items: center;
        justify-content: space-between;

        .text-center {
            color: #fff;
            margin: 0 auto;
        }

        .icon-right {
            color: #fff;
            display: flex;
            align-items: center;
        }
    }

    .loading {
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .message-main {
        height: calc(100% - 100px);
        overflow: auto;
        position: relative;
        background-color: rgba(0, 0, 0, 0.4);

        .message-content {
            .noData {
                color: #fff;
                text-align: center;
            }

            .message-content-message {
                text-align: left;
                margin: 10px 20px;

                .message-content-text,
                .message-content-image {
                    max-width: 600px;
                    display: inline-block;
                    overflow: hidden;
                    margin: 4px 40px 0;
                    padding: 6px;
                    // background-color: rgba(0, 0, 0, 0.4);
                    background-color: white;
                    font-size: 14px;
                    border-radius: 5px;
                    text-align: left;
                    word-break: break-word;
                }

                .message-content-image {
                    max-height: 350px;
                    max-width: 350px;

                    img {
                        cursor: pointer;
                        max-width: 335px;
                        max-height: 335px;
                    }
                }
            }

            .text-right {
                text-align: right !important;

                .avatar {
                    justify-content: flex-end;
                }
            }
        }
    }

    .message-input {
        display: flex;
        flex-wrap: nowrap;
        position: absolute;
        width: 100%;
        bottom: 0px;

        input {
            height: 40px;
        }

        .message-input-button {
            width: 30px;
            cursor: pointer;
            position: absolute;
            right: 10px;
            top: 4px;
        }
    }
}

.message-main::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    // background: #ededed;
}

::-webkit-scrollbar-thumb {
    border-radius: 10px;
    // -webkit-box-shadow: inset 0 0 5px rgb(0, 0, 0);
    background: #ccc;
}

// /* 滚动条轨道 */

@keyframes transition {
    0% {
        transform: translateY(-40px);
        opacity: 0;
    }

    60% {
        transform: translateY(10px);
        opacity: 0.6;
    }

    100% {
        transform: translateY(0px);
        opacity: 1;
    }
}
</style>
