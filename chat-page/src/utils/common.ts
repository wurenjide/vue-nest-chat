import { ElMessage } from "element-plus";
import moment from 'moment'
// 处理所有后端返回的数据
export function processReturn(res: any) {
    // code 0:成功 1:错误 2:后端报错
    let { code, msg, data } = res;
    if (code != 200) {
        ElMessage.error(msg)
        return;
    }
    if (msg) {
        ElMessage.success(msg)
    }
    return data;
}

/**
 * 判断是否URL
 * @param text 文本
 */
export function isUrl(text: string) {
    // 解析网址
    const UrlReg = new RegExp(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/);
    return UrlReg.test(text);
}
/**
 * 消息时间格式化
 * @param time
 */
export function formatTime(time: number) {
    // 大于昨天
    if (Number(moment().add(-1, 'days').startOf('day')) > time) {
        return moment(time).format('M/D HH:mm');
    }
    // 昨天
    if (Number(moment().startOf('day')) > time) {
        return '昨天 ' + moment(time).format('HH:mm');
    }
    // 大于五分钟不显示秒
    if (new Date().valueOf() > time + 300000) {
        return moment(time).format('HH:mm');
    }
    return moment(time).format('HH:mm:ss');
}