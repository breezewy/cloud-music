//app.js
App({
  onLaunch: function (options) {
    console.log('onLaunch 执行')
    console.log(options)
    this.checkUpdate()
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'development-8gcxm1si2cfdf385',
        traceUser: true,
      })
    }
    this.getOpenId()
    this.globalData = {
      playingMusicId:-1,
      openId:-1
    }
  },
  // 这个生命周期会监听小程序的启动和切前台
  onShow(options){
    console.log('onShow 执行')
    console.log(options)
  },
  setPlayingMusicId(musicId){
    this.globalData.playingMusicId = musicId
  },
  getPlayingMusicId(){
    return this.globalData.playingMusicId
  },
  getOpenId(){
    wx.cloud.callFunction({
      name:'login'
    }).then((res) => {
      console.log(res)
     const openId = res.result.openid
     this.globalData.openId = openId
     if(wx.getStorageSync(openId) == ''){
      wx.setStorageSync(openId, [])
     }
    })
  },
  checkUpdate(){
    //获取全局唯一的版本更新管理器，用于管理小程序更新
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function(res){
      // 请求完新版本信息的回调
      // console.log(res.hasUpdate)
      if(res.hasUpdate){
        updateManager.onUpdateReady(function(){
          wx.showModal({
            title:'更新提示',
            content:'新版本已准备好，是否重启应用?',
            success:function(res){
              if(res.confirm){
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate()
              }
            }
          })
        })
      }
    })
  }
})
