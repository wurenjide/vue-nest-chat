<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "@/store/user"
import { ElDialog, ElMessage } from "element-plus";
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'
import { storeToRefs } from "pinia";

import { processReturn } from "@/utils/common"
import { updateUserInfo, getUserById } from "@/api/user"
import { useChatStore } from "@/store/chat";

const userStore = useUserStore()
const chatStore = useChatStore()
const userdialog = ref(false)
let color = ref('white')
const imageUrl = ref('')
const { user } = storeToRefs(userStore)

const form = ref({
    userId: user.value.userId,
    username: user.value.username,
    avatar: user.value.avatar,
    discription: user.value.discription,
    password: user.value.password,
    role: user.value.role,
    createTime: user.value.createTime
})

const colorChange = () => {
    if (color.value == 'white') {
        color.value = 'black'
    } else {
        color.value = 'white'
    }
}
const router = useRouter()
const loginOut = () => {
    userStore.logout()
    userStore.$reset()
    chatStore.clear_chat_store()
    chatStore.$reset()
    router.push("/login")
}

const updateUser = async () => {
    let res = await updateUserInfo(form.value)
    let data = processReturn(res)
    if (data) {
        userStore.set_user(data)
        chatStore.set_user_gather(data)
        chatStore.socket.emit('joinGroupSocket', {
            groupId: "聊天室",
            userId: data.userId,
        });
    }
}

const opendialog = async () => {
    let res = await getUserById(userStore.user.userId)
    form.value = res.data
    imageUrl.value = form.value.avatar
    userdialog.value = true
}
const closedialog = () => {
    userdialog.value = false
}



const handleAvatarSuccess: UploadProps['onSuccess'] = (
    response,
    uploadFile
) => {
    imageUrl.value = URL.createObjectURL(uploadFile.raw!)
    ElMessage.success(response.msg)
    form.value.avatar = response.data
}


</script>

<template>
    <div class="base" :style="{ backgroundColor: color == 'white' ? 'black' : 'white' }">
        <div class="avatar" @click="opendialog">
            <div class="demo-type">
                <el-avatar :size="60" :src="user.avatar">
                    <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
                </el-avatar>
            </div>
            <span class="username" :style="{ color: color }">{{ userStore.user.username }}</span>
        </div>
        <div class="tool">
            <el-space direction="vertical" size="large">
                <div class="tool_svg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 24 24"
                        @click="colorChange">
                        <path :fill="color"
                            d="M12 22q-.825 0-1.413-.588T10 20h4q0 .825-.588 1.413T12 22Zm-3-3q-.425 0-.713-.288T8 18q0-.425.288-.713T9 17h6q.425 0 .713.288T16 18q0 .425-.288.713T15 19H9Zm-.75-3q-1.725-1.025-2.738-2.75T4.5 9.5q0-3.125 2.188-5.313T12 2q3.125 0 5.313 2.188T19.5 9.5q0 2.025-1.012 3.75T15.75 16h-7.5Zm.6-2h6.3q1.125-.8 1.738-1.975T17.5 9.5q0-2.3-1.6-3.9T12 4Q9.7 4 8.1 5.6T6.5 9.5q0 1.35.613 2.525T8.85 14ZM12 14Z">
                        </path>
                    </svg>

                </div>
                <div class="tool_svg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 14 14">
                        <path :fill="color" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                            d="m10.5 1.5l3 3l-2 2l-1-1v6a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-6l-1 1l-2-2l3-3Z"></path>
                    </svg>

                </div>
                <div class="tool_svg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 64 64">
                        <path :fill="color"
                            d="M32 0C14 0 0 14 0 32c0 21 19 30 22 30c2 0 2-1 2-2v-5c-7 2-10-2-11-5c0 0 0-1-2-3c-1-1-5-3-1-3c3 0 5 4 5 4c3 4 7 3 9 2c0-2 2-4 2-4c-8-1-14-4-14-15c0-4 1-7 3-9c0 0-2-4 0-9c0 0 5 0 9 4c3-2 13-2 16 0c4-4 9-4 9-4c2 7 0 9 0 9c2 2 3 5 3 9c0 11-7 14-14 15c1 1 2 3 2 6v8c0 1 0 2 2 2c3 0 22-9 22-30C64 14 50 0 32 0Z">
                        </path>
                    </svg>
                </div>
                <div class="tool_svg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 1024 1024"
                        @click="loginOut">
                        <path :fill="color"
                            d="M352 159.872V230.4a352 352 0 1 0 320 0v-70.528A416.128 416.128 0 0 1 512 960a416 416 0 0 1-160-800.128z">
                        </path>
                        <path :fill="color" d="M512 64q32 0 32 32v320q0 32-32 32t-32-32V96q0-32 32-32z"></path>
                    </svg>
                </div>
            </el-space>
        </div>

        <el-dialog v-model="userdialog" title="用户信息">
            <div class="userInfo">
                <el-upload class="avatar-uploader" action="http://127.0.0.1:3000/user/avatar" name="avatar"
                    :show-file-list="false" :on-success="handleAvatarSuccess">
                    <!-- <img v-if="imageUrl" :src="imageUrl" class="avatar-img" /> -->
                    <el-avatar v-if="imageUrl" shape="circle" :size="178" fit="cover" :src="imageUrl" />
                    <el-icon v-else class="avatar-uploader-icon" :size="36">
                        <Plus />
                    </el-icon>
                </el-upload>
                <el-form :model="form">
                    <el-form-item label="用户头像" label-width="60px" v-show="false">
                        <el-input v-model="form.avatar"></el-input>
                    </el-form-item>
                    <el-form-item label="用户名" label-width="60px">
                        <el-input v-model="form.username"></el-input>
                    </el-form-item>
                    <el-form-item label="描述" label-width="60px">
                        <el-input v-model="form.discription" type="textarea"></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="closedialog">取消</el-button>
                    <el-button type="primary" @click="updateUser">
                        提交
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>



<style lang="less" scoped>
.base {
    width: 100%;
    height: 100%;
    min-height: 400px;
    max-width: 100px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
}

.tool_svg {
    cursor: pointer;

    svg:hover {
        path {
            fill: #409eff;
        }
    }
}

.avatar {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 5px;
    cursor: pointer;

    .username {
        font-size: 10px;
        display: block;
        overflow: hidden;
        /* 超出的文本隐藏 */
        text-overflow: ellipsis;
        /*溢出用省略号显示*/
        white-space: nowrap;
        /*溢出不换行*/
    }
}

.userInfo {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .avatar-uploader {
        width: 178px;
        height: 178px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px dashed var(--el-border-color);
        border-radius: 50%;
        cursor: pointer;
        margin: 20px;
        transition: var(--el-transition-duration-fast);
    }

    .avatar-uploader:hover {
        border-color: var(--el-color-primary);

        .avatar-uploader-icon {
            color: var(--el-color-primary);
        }
    }
}
</style>