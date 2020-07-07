import { isDate, isPlainObject } from "./utils"

function encode(val: string): string {
    return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/ig, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/ig, ',')
    .replace(/%20/g, "+") // space
    .replace(/%5B/ig, "[")
    .replace(/%5D/ig, ']')
}
export function buildURL(url: string, params?: any): string {
    if (!params) {
        return url
    }


const parts: string[] = []

Object.keys(params).forEach((key) => {
    const val = params[key]
    if(val===null || typeof val === 'undefined') {
        return
    }
    let values = [] // 数组类型params
    if (Array.isArray(val)) {
        values = val
        key += '[]'
    } else {
        values = [val]
    }

    values.forEach((val) => {
        if(isDate(val)) {
            val = val.toISOString() 
            // toISOString() 方法返回一个 ISO（ISO 8601 Extended Format）格式的字符串： YYYY-MM-DDTHH:mm:ss.sssZ。时区总是UTC（协调世界时），加一个后缀“Z”标识。
        } else if (isPlainObject(val)) {
            val = JSON.stringify(val)
        }
        parts.push(`${encode(key)}=${encode(val)}`)
    })
})
    let serializedParams = parts.join('&')
     if (serializedParams) {
         const markIndex = url.indexOf('#')
         if (markIndex !== -1) {
             url = url.slice(0, markIndex)
         }
         url += (url.indexOf('?')===-1?'?':'&') + serializedParams
     }
     return url
}