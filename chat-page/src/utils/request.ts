import axios from 'axios';
import Cookies from 'js-cookie';

import type {
    AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError,
    InternalAxiosRequestConfig
} from 'axios';
import { ElMessage } from 'element-plus';


export interface ResponseData<T> {
    statusCode: number;
    // time: string;
    data?: T;
    msg?: string;
    total?: number
}

class Request {
    instance: AxiosInstance;
    baseConfig: AxiosRequestConfig = {
        baseURL: 'http://localhost:3000',
        timeout: 4000,
        //  withCredentials: true
    };

    constructor(config: AxiosRequestConfig) {
        //使用axios.create创建axios实例
        this.instance = axios.create(Object.assign(this.baseConfig, config));
        this.init();
    }

    private init() {
        this.interceptors();
    }
    //拦截器
    private interceptors() {
        this.instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
            const token = Cookies.get('token');
            config.headers.token = token
            config.headers.Authorization="Bearer "+token
            return config;
        }, (err: AxiosError) => {
            return Promise.reject(err.response?.data);
        });

        this.instance.interceptors.response.use((res: AxiosResponse) => {
            if (res.data.code == 401) {
                ElMessage.error(res.data.msg)
                // Cookies.remove("user")
                // Cookies.remove("token")
                // location.href = "/"
            }
            return res.data;
        }, (err: AxiosError) => {
            // 可以在此处处理各种错误状态码
            // if (err.response?.status === 401) {
            //     location.href='/';
            //     window.localStorage.removeItem(LocalStorageKey.User_Info);
            // }
            return Promise.resolve(err.response?.data);
        });
    }

    //get请求
    public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ResponseData<T>> {
        return this.instance.get(url, config);
    }
    //post请求
    public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ResponseData<T>> {
        return this.instance.post(url, data, config);
    }
    //delete请求
    public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ResponseData<T>> {
        return this.instance.delete(url, config);
    }
    //patch请求
    public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ResponseData<T>> {
        return this.instance.patch(url, data, config);
    }
}

export const request = new Request({});