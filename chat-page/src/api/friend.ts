import { request } from "../utils/request"


export const getFriends=(data:any)=>request.get("/friend",{params:{userId:data}})

export const getFriendMessageById=(data:any)=>request.get("/friend/friendMessages",{params:data})