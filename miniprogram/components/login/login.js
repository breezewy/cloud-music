// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGotUserInfo(event){
      const userInfo = event.detail.userInfo
      console.log(event)
      //允许授权
      if(userInfo){
        this.setData({
          modalShow:false
        })
        // 当授权成功之后，把用户信息传递给blog组件
        this.triggerEvent('loginSuccess',userInfo)
      }else{
        this.triggerEvent('loginFail')
      }
    }
  }
})
