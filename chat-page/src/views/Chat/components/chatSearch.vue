<script setup lang="ts">
import { ref } from 'vue';
import { getUserByName } from '@/api/user';
import { getGroupsByName } from '@/api/group';

const searchInput = ref("")
const dialogSearch = ref(false)
const dialogAddGroup = ref(false)
const searchUser = ref<any>([])
const searchGroup = ref<any>([])
const groupName = ref("")
const emit=defineEmits(['addGroup','joinGroup','addFriend','setActiveRoom'])

const onSearch = async () => {
    if (!searchInput.value) {
        return;
    }
    let resUser = await getUserByName(searchInput.value)
    let resGroup = await getGroupsByName(searchInput.value)
    searchUser.value = resUser.data
    searchGroup.value = resGroup.data
    dialogSearch.value = true
}
const addGroupByName = () => {
    emit("addGroup",groupName.value)
}

const addFriend=(friend:any)=>{
    emit("addFriend",friend.userId)
}
const joinGroup=(group:any)=>{
    emit("joinGroup",group.groupId)
}


</script>

<template>
    <div class="base">
        <el-input v-model="searchInput" @keyup.enter.native="onSearch">
            <template #append>
                <el-dropdown>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
                        <path fill="currentColor"
                            d="M11 17h2v-4h4v-2h-4V7h-2v4H7v2h4v4Zm1 5q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Zm0-2q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20Zm0-8Z">
                        </path>
                    </svg>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="dialogAddGroup = !dialogAddGroup">创建群组</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </template>
        </el-input>


        <el-dialog v-model="dialogSearch">
            <div class="search_re">
                <div class="list">
                    <span style="text-align: center;display:block;">用户名搜索结果</span>
                    <ul>
                        <li v-for="i in searchUser" :key="i" class="list_item">
                            <el-avatar :size="30"></el-avatar>
                            <div>{{ i.username }}</div>
                            <el-button type="primary" link @click="addFriend(i)">添加</el-button>
                        </li>
                    </ul>
                </div>
                <div class="list">
                    <span style="text-align: center;display:block;">群名搜索</span>
                    <ul>
                        <li v-for="i in searchGroup" :key="i" class="list_item">
                            <div>{{ i.groupName }}</div>
                            <el-button type="primary" link @click="joinGroup(i)">添加</el-button>
                        </li>
                    </ul>
                </div>
            </div>

        </el-dialog>
        <el-dialog v-model="dialogAddGroup" style="display: flex;justify-content: center; " width="30%">
            <el-space>
                <el-input v-model="groupName" placeholder="请输入群组名字"/>
                <el-button @click="addGroupByName">创建群组</el-button>
            </el-space>
        </el-dialog>
    </div>
</template>

<style lang="less" scoped>
.base {
    display: flex;
    justify-content: center;
    // width: 100%;
    height: 40px;
    padding: 10px;
    border-color: white;

    // background-color: white;
    :deep(.el-input-group__append) {
        padding: 0 10px;
    }
}

.search_re {
    display: flex;
    justify-content: space-between;
    width: 100%;

    .list {
        width: 300px;
        // max-height: 400px;

        ul {
            height: 380px;
            overflow: auto;
        }

        ::-webkit-scrollbar {
            width: 10px;
        }

        ::-webkit-scrollbar-thumb {
            background: #ccc; // 滑块颜色
            border-radius: 5px; // 滑块圆角
        }

        .list_item {
            height: 30px;
            display: flex;
            justify-content: space-between;
            align-content: center;
        }
    }
}
</style>