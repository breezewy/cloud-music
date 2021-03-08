// components/musiclist/musiclist.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist:Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingid:-1
  },
  pageLifetimes:{
    show(){
      this.setData({
        playingid: parseInt(app.getPlayingMusicId())
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event){
      const ds = event.currentTarget.dataset
      const musicId = ds.playingid
      this.setData({
        playingid:musicId
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicId=${musicId}&index=${ds.index}`,
      })
    }
  }
})
