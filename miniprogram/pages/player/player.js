// pages/player/player.js

let musiclist = []
// 当前在播放的歌曲的索引
let nowPlayingIndex = 0

// 获取全局唯一的背景音频管理器
const backroundAudioManager = wx.getBackgroundAudioManager()

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl:'',
    isPlaying:false,   //表示播放状态，初始值false表示不播放，true表示播放
    isLyricShow:false,   //表示当前歌词是否显示
    lyric:'',    //歌词
    isSame:false,   //表示是否为同一首歌曲
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    nowPlayingIndex = options.index
    musiclist = wx.getStorageSync('musiclist')
    this._loadMusicDetail(options.musicId)
  },
  _loadMusicDetail(musicId){
    if(musicId == app.getPlayingMusicId()){
      this.setData({
        isSame:true
      })
    }else{
      this.setData({
        isSame:false
      })
    }
    if(!this.data.isSame){
      // 加载下一首之前，先把上一首歌曲停止
      backroundAudioManager.stop()
    }
    let music = musiclist[nowPlayingIndex]
    console.log(music)
    wx.setNavigationBarTitle({
      title: music.name,
    })
    this.setData({
      picUrl:music.al.picUrl,
      isPlaying:false,
    })
    console.log(musicId,typeof musicId)
    app.setPlayingMusicId(musicId)
    wx.showLoading({
      title: '歌曲加载中',
    })
    wx.cloud.callFunction({
      name:'music',
      data:{
        musicId,
        $url:'musicUrl'
      }
    }).then((res) => {
      // console.log(res)
      let result = res.result
      if(result.data[0].url == null ){
        wx.showToast({
          title: '无权限播放',
        })
        return
      }
      if(!this.data.isSame){
        backroundAudioManager.src = result.data[0].url
        backroundAudioManager.title = music.name
        backroundAudioManager.epname = music.al.name
        backroundAudioManager.singer = music.ar[0].name
        backroundAudioManager.coverImgUrl = music.al.picUrl

        //保存播放历史
        this.savePlayHistory()
      }
      this.setData({
        isPlaying:true
      }) 
      wx.hideLoading()

      // 加载歌词
      wx.cloud.callFunction({
        name:'music',
        data:{
          musicId,
          $url:'lyric',
        }
      }).then((res) => {
        let lyric  = '暂无歌词'
        const lrc = res.result.lrc
        if(lrc){
          lyric =  lrc.lyric
        }
        this.setData({
          lyric
        })
      })
    })
  },
  togglePlaying(){
    if(this.data.isPlaying){
      backroundAudioManager.pause()
    }else{
      backroundAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },
  onPrev(){
    nowPlayingIndex--
    if(nowPlayingIndex < 0){
      nowPlayingIndex = musiclist.length - 1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  onNext(){
    nowPlayingIndex++
    if(nowPlayingIndex === musiclist.length){
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  onChangeLyricShow(){
    this.setData({
      isLyricShow:!this.data.isLyricShow
    })
  },
  timeUpdate(event){
    // 选取组件
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },
  onPlay(){
    this.setData({
      isPlaying:true
    })
  },
  onPause(){
    this.setData({
      isPlaying:false
    })
  },
  savePlayHistory(){
    // 当前正在播放的歌曲
    const music =  musiclist[nowPlayingIndex]
    const openId = app.globalData.openId
    console.log(openId)
    const history = wx.getStorageSync(openId)
    console.log(history)
    let bHave = false
    for(let i = 0,len = history.length;i < len; i++){
      if(history[i].id === music.id){
        bHave = true
        break
      }
    }
    if(!bHave){
      history.unshift(music)
      wx.setStorage({
        data: history,
        key: openId,
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})