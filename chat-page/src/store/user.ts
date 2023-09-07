import { defineStore } from 'pinia'
import { login, register } from '@/api/user'
import { processReturn } from '@/utils/common';
import cookie from 'js-cookie';

export const useUserStore = defineStore("user", {

    state: () => ({
        user: {
            userId: "",
            username: "",
            password: "",
            avatar: "",
            role: "",
            discription: "",
            createTime: "",
        },
        token: "",
    }),
    getters: {
        getUser: (state: any) => {
            let user = cookie.get('user');
            if (!user) {
                return {};
            }
            state.user = JSON.parse(user);
            return state.user;
        }
    },

    actions: {
        async register(data: any) {
            let res = await register(data)
            let flag = processReturn(res)
            if (flag) {
                return true
            } else {
                return false
            }
        },
        async loginUser(user: any) {
            let res = await login(user)
            let data = processReturn(res)
            if (data) {
                this.set_user(res.data.user)
                this.set_token(res.data.token)
                return true
            }
            return false
        },
        logout() {
            this.delete_user()
            this.delete_token()
        },

        set_user(payload: any) {
            this.user = payload
            let str=JSON.stringify(payload)
            // 数据持久化
            cookie.set('user', str, { expires: 3650 });
        },
        clear_user() {
            this.user = {
                userId: "",
                username: "",
                password: "",
                avatar: "",
                role: "",
                discription: "",
                createTime: "",
            };
            cookie.set('user', '');
        },
        set_token(payload: any) {
            this.token = payload
            cookie.set("token", this.token, { expires: 27 })
        },
        delete_user() {
            cookie.remove("user")
        },
        delete_token() {
            cookie.remove("token")
        }
    }
})