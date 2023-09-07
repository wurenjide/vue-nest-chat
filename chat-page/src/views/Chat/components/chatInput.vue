<script setup lang="ts">
import { useChatStore } from '@/store/chat';
import { useUserStore } from '@/store/user';
import { ElMessage, UploadProps } from 'element-plus';
import { Plus } from "@element-plus/icons-vue"
import { ref } from 'vue';

const useStore = useUserStore()
const chatStore = useChatStore()

const uploadDialog = ref<boolean>(false)
const text = ref<string>("")
const lastTime = ref<number>(0)
const imageUrl = ref<string>('')

const throttle = (fn: Function, file?: File) => {
  let nowTime = +new Date();
  if (nowTime - lastTime.value < 500) {
    return ElMessage.error('消息发送太频繁！');
  }
  fn(file);
  lastTime.value = nowTime;
}

/**
 * 消息发送前校验
 */
const preSendMessage = () => {
  if (!text.value.trim()) {
    ElMessage.error('不能发送空消息!');
    return;
  }
  if (text.value.length > 220) {
    ElMessage.error('消息太长!');
    return;
  }
  if (chatStore.activeRoom.groupId) {
    sendMessage({ type: 'group', message: text.value, messageType: 'text' });
  } else {
    sendMessage({ type: 'friend', message: text.value, messageType: 'text' });
  }
  text.value = '';
}

/**
* 消息发送
*/
const sendMessage = (data: any) => {
  if (data.type === 'group') {
    chatStore.socket.emit('groupMessage', {
      userId: useStore.user.userId,
      groupId: chatStore.activeRoom.groupId,
      content: data.message,
      messageType: data.messageType,
    });
  } else {
    chatStore.socket.emit('friendMessage', {
      userId: useStore.user.userId,
      friendId: chatStore.activeRoom.userId,
      content: data.message,
      messageType: data.messageType,
    });
  }
}
const handleImageSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw!)
  ElMessage.success(response.msg)
}
const inputImage = () => {
  if (chatStore.activeRoom.groupId) {
    sendMessage({ type: 'group', message: imageUrl.value, messageType: 'image' });
  } else {
    sendMessage({ type: 'friend', message: imageUrl.value, messageType: 'image' });
  }
  imageUrl.value=""
  uploadDialog.value=false
}

</script>
<template>
  <div class="message-input">
    <el-input autocomplete="off" type="text" placeholder="say hello..." v-model="text" :autofocus="true" ref="input">
      <template #prepend>
        <el-button @click="uploadDialog = true">
          <el-icon>
            <Plus />
          </el-icon>
        </el-button>
      </template>
      <template #append>
        <el-button @click="throttle(preSendMessage)" @keyup.enter.native="throttle(preSendMessage)">发送</el-button>
      </template>
    </el-input>
  </div>
  <el-dialog v-model="uploadDialog" title="上传图片" width="40%">
    <div class="upload">
      <el-upload class="image-uploader" action="http://127.0.0.1:3000/user/image" name="image" :show-file-list="false"
        :on-success="handleImageSuccess">
        <el-image v-if="imageUrl" :src="imageUrl" class="image" fit="cover" />
        <el-icon v-else class="image-uploader-icon" :size="36">
          <Plus />
        </el-icon>
      </el-upload>
      <el-button @click="throttle(inputImage)">发送</el-button>
    </div>
  </el-dialog>
</template>

<style lang="less" scoped>
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

//输入框样式
el-input {
  padding: 0 50px 0 50px;
}

// 消息工具样式
.messagte-tool-icon {
  position: absolute;
  left: 0;
  top: 0;
  width: 50px;
  height: 40px;
  text-align: center;
  line-height: 42px;
  font-size: 16px;
  cursor: pointer;
  z-index: 99;
}

.message-tool-item {
  width: 0px;
  height: 240px;
  cursor: pointer;

  .message-tool-contant {
    width: 50px;
    padding: 5px;
    border-radius: 5px;
    transition: all linear 0.2s;

    .message-tool-item-img {
      width: 40px;
    }

    .message-tool-item-text {
      text-align: center;
      font-size: 10px;
    }

    &:hover {
      background: rgba(135, 206, 235, 0.6);
    }
  }

}

.upload {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .image-uploader {
    width: 178px;
    height: 178px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px dashed var(--el-border-color);
    border-radius: 5px;
    cursor: pointer;
    margin: 20px;
    transition: var(--el-transition-duration-fast);
  }

  .image-uploader:hover {
    border-color: var(--el-color-primary);

    .image-uploader-icon {
      color: var(--el-color-primary);
    }
  }
}
</style>
