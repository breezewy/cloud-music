// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})

const TcbRouter = require('tcb-router')

const db = cloud.database()

const blogCollection = db.collection('blog')

const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({event})

  app.router('list',async(ctx,next)=>{
    const keyWord = event.keyWord
    let w = {}
    if(keyWord.trim() != ''){
      w = {
        // content 是云数据库里要查询的对应的字段
        // 云数据库的模糊查询，可以接用云数据库提供的 RegExp 正则
        content:new db.RegExp({
          // regexp是固定写法后边跟要匹配的字符串
          regexp:keyWord,
          // options:'i' 是忽略大小写，除了i还有其他的修饰符
          options:'i'
        })
      }
    }
    // where 是数据库的查询条件
    let blogList = await blogCollection.where(w).skip(event.start)
                    .limit(event.count)
                    .orderBy('createTime','desc')  // 按照服务器时间，逆序排列，时间最近显示的越靠上
                    .get()
                    .then((res) => {
                      return res.data
                    })
        ctx.body = blogList
  })

  app.router('detail',async(ctx,next) => {
    let blogId = event.blogId
    // 详情查询
    //  let detail = await blogCollection.where({
    //   _id:blogId
    // }).get().then((res) => {
    //   return res.data
    // })

    // 评论查询
    // const countResult = await db.collection('blog-comment').count()
    // const total = countResult.total  // 集合里的数据条数
    // let commentList = {
    //   data:[]
    // }
    // if(total > 0){
    //   // 查询的次数
    //   const batchTimes = Math.ceil(total/MAX_LIMIT)

    //   const tasks = []
    //   for(let i = 0;i < batchTimes; i++){
    //     let promise = db.collection('blog-comment')
    //                   .skip(i*MAX_LIMIT)
    //                   .limit(MAX_LIMIT)
    //                   .where({
    //                     blogId
    //                   })
    //                   .orderBy('createTime','desc')
    //                   .get()
    //     tasks.push(promise)              
    //   }
    //   if(tasks.length > 0){
    //     commentList = (await Promise.all(tasks)).reduce((acc,cur)=>{
    //       return {
    //         data:acc.data.concat(cur.data)
    //       }
    //     })
    //   }
    // }
    // ctx.body = {
    //   commentList,
    //   detail
    // }

    // 聚合查询实现连表查询
    const blog = await blogCollection.aggregate().match({
      _id:blogId
    }).lookup({
      from:'blog-comment',
      localField:'_id',
      foreignField:'blogId',
      as:'commentList'
    })
    .end()
    ctx.body = blog
  })

  const wxContext = cloud.getWXContext()
  app.router('getListByOpenId',async(ctx,next) =>{
    ctx.body = await blogCollection.where({
      _openid:wxContext.OPENID
    }).skip(event.start).limit(event.count)
    .get().then((res) => {
      return res.data
    })
  })
  return app.serve()
}