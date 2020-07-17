import { AxiosRequestConfig } from '../types'
import { isPlainObject, deepMerge } from '../helpers/util'
const strats = Object.create(null) // 存储config key 和 策略处函数映射
// 默认合并策略
function defaultStrat(va11: any, val2: any): any {
  return typeof val2 !== 'undefined' ? val2 : va11
}
// 只接受自定义配置合并策略 url params data
function fromVal2Strat(va11: any, val2: any) {
  if (typeof val2 !== 'undefined') {
    return val2
  }
}
const stratKeysFromVal2 = ['url', 'params', 'data']
stratKeysFromVal2.forEach(key => {
  strats[key] = fromVal2Strat
})
// 复杂对象合并策略: 如headers
function deepMergeStrat(val1: any, val2: any): any {
  // val1 { auth-token: 'xxx' } val2 {h3c-app: 'xxx'}
  if (isPlainObject(val2)) {
    return deepMerge(val1, val2)
  } else if (typeof val2 !== 'undefined') {
    return val2
  } else if (isPlainObject(val1)) {
    return deepMerge(val1)
  } else {
    return val1
  }
}
const stratKeysDeepMerge = ['headers', 'auth']
stratKeysDeepMerge.forEach(key => {
  strats[key] = deepMergeStrat
})
export function mergeConfig(
  config1: AxiosRequestConfig, // default config
  config2?: AxiosRequestConfig // custom config
) {
  if (!config2) {
    config2 = {}
  }
  const config = Object.create(null)
  for (let key in config2) {
    mergeField(key)
  }
  for (let key in config1) {
    if (!config2[key]) {
      mergeField(key)
    }
  }
  function mergeField(key: string): void {
    const strat = strats[key] || defaultStrat
    config[key] = strat(config1[key], config2![key])
  }
  return config
}
