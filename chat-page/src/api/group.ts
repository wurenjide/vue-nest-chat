import { request } from "../utils/request"

export const getUserGroups = (data: any) => request.get("/group/userGroup", { params: { userId: data } })

export const getGroupUsers = (data: any) => request.get("/group/groupUser", { params: { groupId: data } })

export const getGroupsByName = (data: any) => request.get("/group/findByName", { params: { groupName: data } })

export const getGroupMessagesById = (data: any) => request.get("/group/groupMessages", { params: { groupId: data.groupId, current: data.current, pageSize: data.pageSize } })


