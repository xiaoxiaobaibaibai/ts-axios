const express = require('express')
const bodyParser = require('body-parser')
const portfinder = require('portfinder')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const WebpackConfig = require('./webpack.config')
const app = express()
const compiler = webpack(WebpackConfig)
const router = express.Router()
const cookieParser = require('cookie-parser')
const multipart = require('connect-multiparty')
const atob = require('atob')
const path = require('path')
app.use(webpackDevMiddleware(compiler, {
  publicPath: '/__build__/',
  stats: {
    colors: true,
    chunks: false
  }
}))
app.use(multipart({
  uploadDir: path.resolve(__dirname, 'upload-file')
}))
app.use(webpackHotMiddleware(compiler))
app.use(express.static(__dirname, {
  setHeaders (res) {
    res.cookie('XSRF-TOKEN-D', 'free919981942')
  }
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
router.get('/simple/get', function(req, res) {
  res.json({
    msg: `hello world`
  })
})
app.post('/post', function (req, res) {
  res.json({code: 0, data: req.body})
})
router.post('/base/post', function(req, res) {
  res.json({code: 0, data: typeof req})
})

router.post('/base/buffer', function(req, res) {
  let msg = []
  req.on('data', (chunk) => {
    if (chunk) {
      msg.push(chunk)
    }
  })
  req.on('end', () => {
    let buf = Buffer.concat(msg)
    res.json(buf.toJSON())
  })
})
router.get('/base/get', function(req, res) {
  res.json({
    code: 0,
    msg: 'success'
  })
})
router.get('/error/get', function(req, res) {
  if (Math.random() > 0.5) {
    res.json({
      msg: `hello world`
    })
  } else {
    res.status(500)
    res.end()
  }
})

router.get('/error/timeout', function(req, res) {
  setTimeout(() => {
    res.json({
      msg: `hello world`
    })
  }, 3000)
})
let extendPath = '/extend/'
const methods = ['get', 'head', 'options', 'delete', 'post', 'put', 'patch']
methods.forEach(method => {
  router[method](extendPath + method, (req, res) => {
    res.json({
      code: 0,
      req: req.method
    })
  })
})
router.get(extendPath + 'user', (req, res) => {
  setTimeout(() => {
    res.json({
      code: 0,
      message: 'ok',
      result: {
        name: '张大彪',
        age: 35
      }
    })
  })
})
router.get('/interceptor/get', (req, res) => {
  res.json('interceptor')
})
router.get('/more/get', (req, res) => {
  res.json({
    data: req.query
  })
})

router.post('/more/upload', function(req, res) {
  console.log(req.body, req.files)
  res.end('upload success!')
})
router.post('/more/post', function(req, res) {
  const auth = req.headers.authorization
  console.log(auth)
  const [type, credentials] = auth.split(' ')
  console.log(atob(credentials))
  const [username, password] = atob(credentials).split(':')
  if (type === 'Basic' && username === 'zlj' && password === '123456') {
    res.json(req.body)
  } else {
    res.status = 401
    res.end('UnAuthorization')
  }
})
router.get('/more/304', function(req, res) {
  res.status(304)
  res.end()
})
app.use(router)
module.exports = new Promise(resolve => {
  portfinder.basePort = process.env.PORT || 8080
  portfinder.getPort(function (err, port) {
    //
    // `port` is guaranteed to be a free port
    // in this scope.
    //
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}, Ctrl+C to stop`)
    })
    resolve(app)
  })
})
