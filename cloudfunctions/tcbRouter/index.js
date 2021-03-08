// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})

const TcbRouter = require('tcb-router');

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({event})

  // app.use 表示该中间件会适用于所有的路由
  app.use(async (ctx,next) => {
    console.log('进入全局中间件')
    ctx.data = {}
    ctx.data.openId = event.userInfo.openId
    await next()
    console.log('退出全局中间件')
  })

  app.router('music',async (ctx,next) => {
    console.log('进入音乐名称中间件')
    ctx.data.musicName = '大海'
    await next()
    console.log('退出音乐名称中间件')
  },async (ctx,next) => {
    console.log('进入音乐类型中间件')
    ctx.data.musicType  = '情歌'
    ctx.body = {
      data:ctx.data
    }
    console.log('退出音乐类型中间件')
  })

  app.router('movie',async (ctx,next) => {
    console.log('进入电影名称中间件')
    ctx.data.moviecName = '哪吒'
    await next()
    console.log('退出电影名称中间件')
  },async (ctx,next) => {
    console.log('进入电影类型中间件')
    ctx.data.movieType  = '神话电影'
    ctx.body = {
      data:ctx.data
    }
    console.log('退出电影类型中间件')
  })

  return  app.serve()
}