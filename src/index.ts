import { AxiosRequestConfig } from './types';
import xhr from './xhr'

function axios(config: AxiosRequestConfig) {
  // todo
  xhr(config)
}

export default axios