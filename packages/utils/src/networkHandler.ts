import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { HTTPMethods } from '@iuly/iuly-models'
import { withRetry, DEFAULT_RETRY_CONFIG, RetryConfig } from './rateLimiting'

export class NetworkHandler {

  private axiosInstance: AxiosInstance;
  private retryConfig: RetryConfig;

  constructor(retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {
    this.axiosInstance = axios.create();
    this.retryConfig = retryConfig;
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
    return withRetry(async () => {
      try {
        return await this.axiosInstance.request({
          method,
          url,
          data: body,
          ...config,
        });
      } catch (error: any) {
        // Log non-rate-limit errors
        if (error.response?.status !== 429 && error.response?.status !== 403) {
          console.error(`NETWORK HANDLER: ${method} request to ${url} failed!\n ERROR LOG:`, error.message);
        }
        throw error;
      }
    }, this.retryConfig);
  }
}