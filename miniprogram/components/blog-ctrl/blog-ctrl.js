// components/blog-ctrl/blog-ctrl.js
let userInfo = {}
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId:String,
    blog:Object,
  },
  externalClasses:[
    'iconfont',
    'icon-pinglun',
    'icon-fenxiang'
  ],
  /**
   * 组件的初始数据
   */
  data: {
    // loginShow 表示登录组件是否显示，之所以写到data里是因为，这个是组件内部的，并不是外部传进来的
    loginShow: false,  
    // 底部弹出层是否显示
    modalShow:false, 
    // 评论内容
    content:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onCommont(){
      // 判断用户是否授权
      wx.getSetting({
        success:(res)=>{
          // console.log(res.authSetting)
          if(res.authSetting["scope.userInfo"]){
            wx.getUserInfo({
              success:(res)=>{
                // console.log(res)
                userInfo = res.userInfo
                // 显示评论弹出层
                this.setData({
                  modalShow:true
                })
              }
            })
          }else {
            this.setData({
              loginShow:true
            })
          }
        }
      })
    },
    onLoginSuccess(event){
      console.log(event)
      userInfo = event.detail
      // 授权框消失，评论框显示
      this.setData({
        loginShow:false
      },()=>{
        this.setData({
          modalShow:true
        })
      })
    },
    onLoginFail(){
      wx.showModal({
        title:"授权用户才能进行评价",
        content:""
      })
    },
    onInput(event){
      this.setData({
        content:event.detail.value
      })
    },
    onSend(){
      // 评论信息插入数据库
      let content = this.data.content
      if(content.trim() == ''){
        wx.showModal({
          title:'评论内容不能为空',
          content:''
        })
        return 
      }
      wx.showLoading({
        title: '评论中',
        mask:true
      })
      db.collection('blog-comment').add({
        data:{
          content,
          createTime:db.serverDate(),
          blogId:this.properties.blogId,
          nickName:userInfo.nickName,
          avatarUrl:userInfo.avatarUrl
        }
      }).then((res) => {
        // 评论内容插入数据库成功后调用云函数推送订阅消息
        wx.cloud.callFunction({
          name:'subscribeMsg',
          data:{
            content,
            blogId:this.properties.blogId,
          }
        }).then((res) => {
          console.log(res)
        }).catch((err) => {
          console.error(err)
        })
        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
        this.setData({
          modalShow:false,
          content:''
        })

        // // 父元素刷新评论页面
        this.triggerEvent('refreshCommentList')
      })


      //给用户推送模板消息
    },
    // 调起客户端小程序订阅消息界面
    subscribeMsg(){
      const tmplId = 'FKpyuvXfuY8BbHPKv7jYyNWAfUGCqscMTdLe7Q0CPHc'
      wx.requestSubscribeMessage({
        tmplIds: [tmplId],
        success:(res) => {
          console.log(res)
          if(res[tmplId] == 'accept'){
            // 假设需求是用户同意了订阅，才允许评论
            this.onCommont()
          }else{
            wx.showToast({
              icon:'none',
              title: '订阅失败，无法评论',
            })
          }
        },
        fail:(err) => {
          console.log(err)
        }
      })
    }
  }
})
