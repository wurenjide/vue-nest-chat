import { request } from "../utils/request"

export const login = (data: any) => request.post("/auth/login", data)

export const register = (data: any) => request.post("/auth/register", data)

export const getUserById=(data:string)=>request.get("/user/userId",{params:{userId:data}})

export const patchPassword = (data: User, password: string) => request.patch("/user/password", { ...data, newPassword: password })

export const getUserByName = (username: string) => request.get("/user/findByName", { params: { username: username } })

export const setUserAvatar = (data: FormData) => request.post("/user/avatar", data, { headers: { 'Content-Type': 'multipart/form-data' } })

export const deleteUserById = (params: any) => request.delete("/user", params)

export const updateUserInfo = (data: any) => request.patch("/user/username", data)