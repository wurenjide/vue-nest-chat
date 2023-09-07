import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import cookies from 'js-cookie'
import { ElMessage } from 'element-plus'
const routes: RouteRecordRaw[] = [
    {
        path: "/login",
        name: "login",
        component: () => import("@/views/Login/login.vue")
    },
    {
        path: "/chat",
        name: "chat",
        component: () => import("@/views/Chat/chat.vue")
    }
]
const router = createRouter({
    routes,
    history: createWebHistory(),
})
router.beforeEach((to, from, next) => {
    //首先，我们先看一看to和from参数，next就是执行的意思，不写页面是不会跳转的
    if (to.name != "login") {
        let token = cookies.get("token")
        if (token) {
            next()
        } else {
            ElMessage.info("你还为登录")
            next("/login")
        }
    } else {
        next()
    }

})

export default router