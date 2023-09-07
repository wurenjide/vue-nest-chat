<script setup lang="ts">
import "animate.css"
import { useRouter } from "vue-router";
import { ElForm } from "element-plus";
import { useUserStore } from "@/store/user";
import { toRaw } from '@vue/reactivity'
import { ref } from "vue"
const isShow = ref(true)
const userStore = useUserStore()

const loginForm = ref({
    username: "",
    password: "",
})

const registeForm = ref({
    username: "",
    password: "",
    apassword: "",
})


const styleObj = ref({ right: '0' })
const showChange = () => {
    isShow.value = !isShow.value
    if (!isShow.value) {
        styleObj.value = { right: '50%' }
    } else {
        styleObj.value = { right: '0' }
    }

}

const router = useRouter()
const loginChat = async () => {
    let flag: boolean = await userStore.loginUser(toRaw(loginForm.value) )
    if (flag) {
        router.push("/chat")
        
    }
}

const registeChat = async () => {
    let flag = await userStore.register(toRaw(registeForm.value))
    if (flag) {
        showChange()
    }
}

</script>

<template>
    <div class="base">
        <div class="loginAndRegister">
            <div class="loginArea">
                <transition name="animate__animated animate__bounce" enter-active-class="animate__fadeInUp"
                    leave-active-class="animate__zoomOut" appear>
                    <div v-show="isShow" class="title">
                        登录
                    </div>
                </transition>
                <transition name="animate__animated animate__bounce" enter-active-class="animate__fadeInUp"
                    leave-active-class="animate__zoomOut" appear>
                    <div v-show="isShow">
                        <el-form class="login-form" size="large">
                            <el-form-item style="flex: 1;">
                                <el-input placeholder="用户名" v-model="loginForm.username" />
                            </el-form-item>
                            <el-form-item style="flex: 1;">
                                <el-input placeholder="密码" show-password v-model="loginForm.password"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button style="border-radius: 20px;" @click="loginChat">登录</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </transition>
            </div>
            <div class="registArea">
                <transition name="animate__animated animate__bounce" enter-active-class="animate__fadeInUp"
                    leave-active-class="animate__zoomOut" appear>
                    <div v-show="!isShow" class="title">
                        注册
                    </div>
                </transition>
                <transition name="animate__animated animate__bounce" enter-active-class="animate__fadeInUp"
                    leave-active-class="animate__zoomOut" appear>
                    <div v-show="!isShow">
                        <el-form class="registe-form" size="large" :model="registeForm">
                            <el-form-item>
                                <el-input placeholder="用户名" v-model="registeForm.username" />
                            </el-form-item>
                            <el-form-item style="flex: 1;">
                                <el-input placeholder="密码" show-password v-model="registeForm.password"></el-input>
                            </el-form-item>
                            <el-form-item style="flex: 1;">
                                <el-input placeholder="确认密码" show-password v-model="registeForm.apassword"></el-input>
                            </el-form-item>
                            <!-- 暂时没有手机验证 -->
                            <!-- <el-form-item style="flex: 1;">
                                <el-input placeholder="手机号" />
                            </el-form-item>
                            <el-form-item style="flex: 1;">
                                <el-input placeholder="验证码" class="code">
                                    <template #append>
                                        <el-button style="border-r ">获取验证码</el-button>
                                    </template>
                                </el-input>
                            </el-form-item> -->
                            <el-form-item>
                                <el-button style="border-radius: 20px;" @click="registeChat">注册</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </transition>
            </div>
            <div class="showInfo" :style="{ right: styleObj.right }">
                <transition name="animate__animated animate__bounce" enter-active-class="animate__fadeInUp"
                    leave-active-class="animate__zoomOut" appear>
                    <div v-show="isShow" class="infoCon">
                        <div
                            style="flex: 2;display: flex;align-items: center;font-size: 22px;color: #FFFFFF;font-weight: bold">
                            欢迎登录
                        </div>
                        <div style="flex:2">
                            <el-button round @click="showChange">还没有账户？点击注册</el-button>
                        </div>
                    </div>
                </transition>
                <transition name="animate__animated animate__bounce" enter-active-class="animate__fadeInUp"
                    leave-active-class="animate__zoomOut" appear>
                    <div v-show="!isShow" class="infoCon">
                        <div
                            style="flex: 2;display: flex;align-items: center;font-size: 22px;color: #FFFFFF;font-weight: bold">
                            欢迎注册
                        </div>
                        <div style="flex:2">
                            <el-button round @click="showChange">已有有账户？点击登录</el-button>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
.base {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    // background-image: url("../../assets/background/d.png");
    // background-repeat: no-repeat;
    // background-size: cover;
}

.loginAndRegister {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    width: 70%;
    height: 70%;
    border-radius: 40px;
    min-height: 500px;
    min-width: 600px;
    // box-shadow: 10px 5px 5px rgba(0, 0, 0, 0.142);
}

.loginArea {
    background-color: rgba(255, 255, 255, 0.8);
    height: 100%;
    width: 50%;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.registArea {
    background-color: rgba(255, 255, 255, 0.8);
    height: 100%;
    width: 50%;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.showInfo {
    position: absolute;
    height: 100%;
    width: 50%;
    z-index: 2;
    top: 0;
    right: 0;
    background-image: url("../../assets/background/d.png");
    background-size: cover;
    transition: all 1s;
}

.showInfo:hover {
    background-size: cover;
    transform: scale(1.2);

}

.infoCon {
    display: flex;
    color: white;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.login-form {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-top: 40px;
    min-width: 300px;

    :deep(.el-input__wrapper) {
        border-radius: 40px;
    }
}

.registe-form {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-top: 40px;
    min-width: 300px;

    .code {
        :deep(.el-input__wrapper) {
            border-top-left-radius: 40px;
            border-bottom-left-radius: 40px;
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }

        :deep(.el-input-group__append) {
            border-top-right-radius: 40px;
            border-bottom-right-radius: 40px;
        }
    }

    :deep(.el-input__wrapper) {
        border-radius: 40px;
    }
}

.title {
    width: 70%;
    flex: 0.3;
    border-bottom: 1px solid black;
    display: flex;
    align-items: center;
    color: black;
    font-weight: bold;
    font-size: 30px;
    display: flex;
    justify-content: center;
}

.el-input {
    width: 255px;
}
</style>