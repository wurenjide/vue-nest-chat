<script setup lang="ts">
import { Operation, User } from "@element-plus/icons-vue"
import { computed, ref } from "vue";
import { useChatStore } from "@/store/chat";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/store/user";
import { ElMessage } from "element-plus";
const chatStore = useChatStore()
const userStore = useUserStore()
const { activeGroupUser, activeRoom, } = storeToRefs(chatStore)
const { user } = storeToRefs(userStore)

const props = defineProps(["type"])
const popoverRef = ref()
const groupdrawer = ref<boolean>(false)

const activeNum = computed(() => {
    if (activeRoom.value&&activeGroupUser.value) {
        return Object.keys(activeGroupUser.value[activeRoom.value.groupId]).length;
    }
    return 0
})

const kickOutUser = (userId: string) => {
    if (userId == user.value.userId) {
        ElMessage.error("你不能踢出你自己")
        return;
    }
    chatStore.socket.emit('exitGroup', {
        userId: userId,
        groupId: activeRoom.value.groupId,
    })
}

const exitGroup = () => {
    chatStore.socket.emit('exitGroup', {
        userId: user.value.userId,
        groupId: activeRoom.value.groupId,
    })
}
const exitFriend = () => {
    chatStore.socket.emit('exitFriend', {
        userId: user.value.userId,
        friendId: activeRoom.value.userId,
    });
}

const mangerGroup = () => {
    groupdrawer.value = !groupdrawer.value
}

</script>
<template>
    <div class="active">
        <div v-if="props.type == 'group'" class="group">
            <el-icon class="icon" :size="30" @click="mangerGroup">
                <Operation />
            </el-icon>
        </div>
        <div v-else class="friend">
            <el-popover trigger="click" ref="popoverRef">
                <div style="width: 100%;display:flex ;justify-content: center;">
                    <el-button @click="exitFriend">删除好友</el-button>
                </div>
                <template #reference>
                    <el-icon class="icon" :size="30">
                        <User />
                    </el-icon>
                </template>
            </el-popover>
        </div>
    </div>
    <div class="drawer">
        <el-drawer v-model="groupdrawer" :append-to-body="false" title="群管理" class="drawer-style">
            <div>在线人数：{{ activeNum }}</div>
            <div>
                <div v-for="data in activeGroupUser[activeRoom.groupId]" :key="data.userId">
                    <div class="user-list-item">
                        <el-avatar :size="35" :src="data.avatar" style="display: flex;">
                            <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
                        </el-avatar>
                        <div>{{ data.username }}</div>
                        <el-button v-if="activeRoom.userId == user.userId"
                            @click="kickOutUser(data.userId)">踢出群聊</el-button>
                    </div>
                </div>
            </div>
            <el-button @click="exitGroup">退出群</el-button>
        </el-drawer>
    </div>
</template>
<style lang="less" scoped>
.active {
    .group {
        display: flex;
        align-items: center;
        overflow: hidden;

        .icon:hover {
            color: var(--el-color-primary);
            cursor: pointer;
        }


    }

    .friend {
        display: flex;
        align-items: center;
        overflow: hidden;

        .icon:hover {
            color: var(--el-color-primary);
            cursor: pointer;
        }
    }
}

.drawer {
    overflow: hidden;

    :deep(.el-overlay) {
        position: absolute;
    }

    color: black;

    :deep(.el-drawer__header) {
        margin-bottom: 0;
    }

    :deep(.el-drawer__body) {
        padding-top: 0;
    }

    .drawer-style {
        .user-list-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    }
}
</style>

