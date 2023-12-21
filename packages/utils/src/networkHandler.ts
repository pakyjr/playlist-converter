import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

export class NetworkHandler {

  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      headers: {
        'Content-Type': 'application/json'
      },
    });
  }

  private async request(method: string, url: string, body?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
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