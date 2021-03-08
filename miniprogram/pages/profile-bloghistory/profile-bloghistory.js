// pages/profile-bloghistory/profile-bloghistory.js
const MAX_LIMIT = 10
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blogList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this._getListByCloudFn()
    this._getListByWXProgram()
  },
  _getListByCloudFn(){
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name:'blog',
      data:{
        $url:'getListByOpenId',
        start:this.data.blogList.length,
        count:MAX_LIMIT
      }
    }).then((res) => {
      this.setData({
        blogList:this.data.blogList.concat(res.result)
      })
      wx.hideLoading()
    })
  },
  _getListByWXProgram(){
    wx.showLoading({
      title: '加载中',
    })
    db.collection('blog').skip(this.data.blogList.length).limit(MAX_LIMIT).orderBy('createTime','desc')
    .get().then((res) => {
      // console.log(res)
      let bloglist = res.data
      for(let i=0,len = bloglist.length;i<len;i++){
        bloglist[i].createTime = bloglist[i].createTime.toString()
      }
      this.setData({
        blogList:this.data.blogList.concat(bloglist)
      })
      wx.hideLoading()
    })
  },
  goComment(event){
    wx.navigateTo({
      url: `../blog-comment/blog-comment?blogId=${event.target.dataset.blogid}`,
    })
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
    // this._getListByCloudFn()
    this._getListByWXProgram()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    console.log(event)
    let blogObj = event.target.dataset.blog
    return {
      title:blogObj.content,
      path:`/pages/blog-comment/blog-comment?blogId=${blogObj._id}`,
      // imageUrl:''
    }
  }
})