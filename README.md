## axios基础功能实现updating
### 请求url参数
```js
axios({
  method: 'get',
  url: '/base/get',
  params: {
    a: 1,
    b: 2
  }
})
```
    希望的最终url是/base/get?a=1&b=2。实际上就是把 params 对象的 key 和 value 拼接到 url 上。下面是几种复杂的情况的处理：
1. 参数值为数组
foo: ['bar', 'baz']


    最终请求的 url 是 /base/get?foo[]=bar&foo[]=baz'

2. 参数值是对象foo: {
      bar: 'baz'
    }

    最终请求的 url 是 /base/get?foo=%7B%22bar%22:%22baz%22%7D，foo 后面拼接的是 {"bar":"baz"} encode 后的结果


3. 参数值是Date

    最终请求的 url 是 /base/get?date=2020-07-17 T05:55:39.030Z，date 后面拼接的是 date.toISOString() 的结果
4. 特殊字符

    对于字符 @、:、$、,、、[、]，我们是允许出现在 url 中的，不希望被 encode。空格会转变为" + "

5. 空值忽略

    对于值为 null 或者 undefined 的属性，我们是不会添加到 url 参数中的
    
6. 丢弃 url 中的哈希标记
7. 保留 url 中已存在的参数

实现一个工具函数把 params 拼接到 url 上
```
function encode (val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

export function bulidURL (url: string, params?: any) {
  if (!params) {
    return url
  }

  const parts: string[] = []

  Object.keys(params).forEach((key) => {
    let val = params[key]
    if (val === null || typeof val === 'undefined') {
      return
    }
    let values: string[]
    if (Array.isArray(val)) {
      values = val
      key += '[]'
    } else {
      values = [val]
    }
    values.forEach((val) => {
      if (isDate(val)) {
        val = val.toISOString()
      } else if (isObject(val)) {
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

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  }

  return url
}
```
### 请求body数据
我们通过执行 XMLHttpRequest 对象实例的 send 方法来发送请求，并通过该方法的参数设置请求 body 数据

当我们传一个普通对象给服务端的时候，data不能直接传给send函数，需要把它转化为JSON字符串
### 请求header
我们做了请求数据的处理，把 data 转换成了 JSON 字符串，但是数据发送到服务端的时候，服务端并不能正常解析我们发送的数据，因为我们并没有给请求 header 设置正确的 Content-Type。

所以我们首先要支持发送请求的时候可以配置headers
```js
function normalizeHeaderName (headers: any, normalizedName: string): void {
  if (!headers) {
    return
  }
  Object.keys(headers).forEach(name => {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = headers[name]
      delete headers[name]
    }
  })
}

export function processHeaders (headers: any, data: any): any {
  normalizeHeaderName(headers, 'Content-Type')
  
  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
  }
  return headers
}
```

这里因为请求header属性是不分大小写的，所以需要事先规范化
