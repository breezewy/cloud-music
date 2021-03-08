// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const templateId = 'FKpyuvXfuY8BbHPKv7jYyNWAfUGCqscMTdLe7Q0CPHc'
    
    const result = await cloud.openapi.subscribeMessage.send({
      touser:wxContext.OPENID,  //接收者的openid
      page:`/pages/blog-comment/blog-comment?blogId=${event.blogId}`,  //点击模板卡片后的跳转页面，仅限本小程序内的页面。支持带参数,
      lang:'zh-CN',  // 进入小程序查看”的语言类型
      data:{  // 模板内容
        phrase1:{
          value:'评论成功'
        },
        thing2:{
          value:event.content
        }
      },
      templateId:templateId, // 所需下发的订阅模板id
      miniprogramState: 'developer'  //跳转小程序类型
    })
    return result
  } catch (err) {
    console.log(err)
    return err
  }  
}