import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import xhr from './xhr'
import { buildURL, isAbsoluteURL, combineURL } from '../helpers/url'
// import { transformRequest, transformResponse } from '../helpers/data'
import { flattenHeaders } from '../helpers/headers'
import transform from './transform'

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  throwIfCancellationRequested(config)
  processConfig(config)
  return xhr(config).then(
    res => {
      return transformResponseData(res)
    },
    e => {
      if (e && e.response) {
        e.response = transformResponseData(e.response)
      }
      return Promise.reject(e)
    }
  )
}

// 处理配置文件
function processConfig(config: AxiosRequestConfig): void {
  config.url = transformURL(config)
  config.data = transform(config.data, config.headers, config.transformRequest)
  // config.headers = transformHeaders(config) // 这步操作必须在transformRequestData之前,因为如果先进行了transformRequestData,那么data已经被转为了字符串,则无法进入到本步骤的判断data是否为对象的操作中
  // config.data = transformRequestData(config)
  config.headers = flattenHeaders(config.headers, config.method!)
}

// 处理url
export function transformURL(config: AxiosRequestConfig): string {
  let { url, params, paramsSerializer, baseURL } = config
  if (baseURL && !isAbsoluteURL(url!)) {
    url = combineURL(baseURL, url)
  }
  return buildURL(url!, params, paramsSerializer)
}

// 以下操作移入transform中

// 处理post请求中的data
// function transformRequestData(config: AxiosRequestConfig): any {
//   return transformRequest(config.data)
// }

// 处理当data中含有对象时设置头部Content-Type类型
// function transformHeaders(config: AxiosRequestConfig): any {
//   // 如果没有传headers,则默认空值
//   const { headers = {}, data } = config
//   return processHeaders(headers, data)
// }

// 处理响应的data,如果是字符串类型的话则使用JSON.parse来解析一下
function transformResponseData(res: AxiosResponse): AxiosResponse {
  // res.data = transformResponse(res.data)
  res.data = transform(res.data, res.headers, res.config.transformResponse)
  return res
}

function throwIfCancellationRequested(config: AxiosRequestConfig): void {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested()
  }
}
