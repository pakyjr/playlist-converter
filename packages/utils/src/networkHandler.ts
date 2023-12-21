import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { HTTPMethods } from '@iuly/iuly-models'

export class NetworkHandler {

  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      headers: {
        'Content-Type': 'application/json'
      },
    });
  }

  async get(url: string, config?: AxiosRequestConfig) {
    return this.request(HTTPMethods.GET, url, undefined, config);
  }

  async post(url: string, body: any, config?: AxiosRequestConfig) {
    return this.request(HTTPMethods.POST, url, body, config);
  }

  async patch(url: string, body: any, config?: AxiosRequestConfig) {
    return this.request(HTTPMethods.PATCH, url, body, config);
  }

  async delete(url: string, config?: AxiosRequestConfig) {
    return this.request(HTTPMethods.DELETE, url, undefined, config);
  }

  private async request(method: HTTPMethods, url: string, body?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    try {
      return await this.axiosInstance.request({
        method,
        url,
        data: body,
        ...config,
      });
    } catch (error) {
      console.error(`NETWORK HANDLER: ${method} request to ${url} failed!`, error);
      throw error;
    }
  }
}