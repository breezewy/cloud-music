// components/progress-bar/progress-bar.js
let movableAreaWidth = 0
let movableViewWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
let currentSec = -1  // 当前的秒数
let duration = 0 // 当前歌曲的总时长，以秒为单位用于计算
let isMoving = false  // 表示当前进度条是否在拖拽，解决：当进度条拖动的时候，和onTimeUpdate冲突的问题
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime:{
      currentTime:'00:00',
      totalTime:'00:00',
    },
    movableDis:0,
    progress:0,
  },
  // 组件的的生命周期也可以在 lifetimes 字段内进行声明
  lifetimes:{
    // ready在组件在视图层布局完成后执行
    ready(){
      if(this.properties.isSame && this.data.showTime.totalTime == '00:00'){
        this._setTime()
      }
      this._getMovableDis()
      this._bindBGMEvent()
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 事件处理函数放上边
    onChange(event){
      // console.log(event)
      if(event.detail.source == 'touch'){
        // 这种方式给data属性赋值，并不会导致页面上的变化，只是起到存储作用
        this.data.progress = event.detail.x /(movableAreaWidth-movableViewWidth) * 100
        this.data.movableDis = event.detail.x
        isMoving = true
        // console.log('change',isMoving)
      }
    },
    onTouchEnd(){
      const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress:this.data.progress,
        movableDis:this.data.movableDis,
        ['showTime.currentTime']:currentTimeFmt.min+':'+currentTimeFmt.sec
      })
      // console.log(duration,'aaa',this.data.progress)
      // console.log(duration*this.data.progress)
      backgroundAudioManager.seek(duration*this.data.progress / 100)
      isMoving = false
      // console.log('end',isMoving)
    },
    // 一般带下划线的方法我们当坐私有方法，放下边
    _getMovableDis(){
      // 获取SelectorQuery实例对象
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      //exec 方法会按照上边的请求顺序执行请求，然后把结果通过一个数组的形式传入回调函数的参数。
      query.exec((rect) => {
        movableAreaWidth = rect[0].width 
        movableViewWidth = rect[1].width 
        console.log(movableAreaWidth,movableViewWidth)
      })
    },
    _bindBGMEvent(){
      //监听背景音频播放事件
      backgroundAudioManager.onPlay(() => {
        console.log('onPlay')
        isMoving = false
        this.triggerEvent('musicPlay')
      })
      //监听背景音频停止事件
      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })
      // 监听背景音频暂停事件
      backgroundAudioManager.onPause(() => {
        console.log('Pause')
        this.triggerEvent('musicPause')        
      })
      // 监听音频加载中事件。当音频因为数据不足，需要停下来加载时会触发
      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      })
      // 监听背景音频进入可播放状态事件。 但不保证后面可以流畅播放
      backgroundAudioManager.onCanplay(() => {
        console.log('onCanplay')
        console.log(backgroundAudioManager.duration)
        if(typeof backgroundAudioManager.duration != 'undefined'){
          this._setTime()
        }else{
          setTimeout(() => {
            this._setTime()
          },1000)
        }
      })
      // 监听背景音频播放进度更新事件，只有小程序在前台时会回调。
      backgroundAudioManager.onTimeUpdate(() => {
        // console.log('onTimeUpdate')
        if(!isMoving){
          const currentTime = backgroundAudioManager.currentTime
          const duration = backgroundAudioManager.duration
          const sec = currentTime.toString().split('.')[0]
          if(sec != currentSec){
            console.log(currentTime)
            const currentTimeFormat = this._dateFormat(currentTime)
            this.setData({
              movableDis:(movableAreaWidth-movableViewWidth)*(currentTime/duration),
              progress:(currentTime / duration)*100,
              ['showTime.currentTime']:`${currentTimeFormat.min}:${currentTimeFormat.sec}`
            })
            currentSec = sec
            this.triggerEvent('timeUpdate',{
              currentTime
            })
          }
        }
      })
      // 监听背景音频自然播放结束事件
      backgroundAudioManager.onEnded(() => {
        console.log("onEnded")
        this.triggerEvent('musicEnd')
      })
      // 监听背景音频播放错误事件
      backgroundAudioManager.onError((res) => {
        console.error(res.errMsg)
        console.error(res.errCode)
        wx.showToast({
          title: '错误:' + res.errCode,
        })
      })
    },
    _setTime(){
      duration = backgroundAudioManager.duration
      console.log(duration)
      const durationFormat = this._dateFormat(duration)
      console.log(durationFormat)
      this.setData({
        ['showTime.totalTime']:`${durationFormat.min}:${durationFormat.sec}`
      })
    },
    //格式化时间
    _dateFormat(sec){
      // 分钟
      const min = Math.floor(sec/60)
      sec = Math.floor(sec%60)
      return {
        'min':this._parse0(min),
        'sec':this._parse0(sec)
      }
    },
    // 补0
    _parse0(num){
      return num < 10 ? '0' + num : num
    }
  }
})
