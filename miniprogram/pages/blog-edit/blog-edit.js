const MAX_WORDS_NUM = 140  // 输入文字最大的个数
const MAX_IMG_NUM = 9 // 当前最大上传图片数量
const db = wx.cloud.database() // 初始化数据库
let content = ''   //当前输入的文字内容
let userInfo = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum:0,   //输入的文字个数
    footerBottom:0,   // 脚距离底部的距离
    images:[],   //存放已经选择的图片
    selectPhote:true,  //添加图片的元素是否显示
  },
  onInput(event){
    // console.log(event)
    
    let wordsNum = event.detail.value.length
    if(wordsNum >= MAX_WORDS_NUM){
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = event.detail.value
  },
  onFocus(event){
    // console.log(event)
    this.setData({
      footerBottom:event.detail.height
    })
  },
  onBlur(){
    this.setData({
      footerBottom:0
    })
  },
  onChooseImage(){
    // 还能再选几张图片
    let max = MAX_IMG_NUM - this.data.images.length
    wx.chooseImage({
      count: max,
      sourceType:['album','camera'],
      sizeType:['compressed','original'],
      success:(res) => {
        // console.log(res)
        this.setData({
          images:this.data.images.concat(res.tempFilePaths)
        })
        // 还能再选几张图片
        max = MAX_IMG_NUM - this.data.images.length
        this.setData({
          selectPhote:max <= 0 ? false : true
        })
      }
    })
  },
  // 删除图片
  onDelImage(event){
    // console.log(event.target.dataset.index)
    this.data.images.splice(event.target.dataset.index,1)
    this.setData({
      images:this.data.images
    })
    if(this.data.images.length === MAX_IMG_NUM - 1){
      this.setData({
        selectPhote:true
      })
    }
  },
  // 预览图片
  onPreviewImage(event){
    // console.log(event)
    // 6/9  ios
    wx.previewImage({
      urls: this.data.images,
      current:event.target.dataset.imgsrc
    })
  },
  send(){
    // 2. 数据 -> 云数据库
    // 数据库：输入内容、图片fileID、openid、昵称、头像、时间
    // 1. 图片 -> 云存储 云存储返回 fileID

    // 发布的时候，首先要判断驶入内容是否为空字符串，或者是只输入了空格，如果是，那就不能发布
    if(content.trim() === ''){
      wx.showModal({
        title: '请输入内容',
        content:'',
      })
      return
    }

    wx.showLoading({
      title: '发布中',
      mask:true
    })
    // 因为每次把图片上传到云存储是异步的，所以要等到所有都上传成功了，才可以存入数据库
    // 所以我们把每次上传云存储的过程作为一个promise对象，把所有的promise对象放入数组。
    // 然后我们就可以借助Promise.all去等到都上传成功的时刻
    let  promiseArr = []
    let fileIds = []
    // 图片上传(之所以选择在发布的时候上传图片到云存储，是因为用户很可能会有删除图片或者不再发布的行为)
    // 云存储的上传API只支持单文件上传，所以要遍历图片列表，一张一张去上传
    for(let i = 0,len = this.data.images.length; i < len; i++){
      let p = new Promise((resolve,reject)=>{
        let item = this.data.images[i]
        // 文件扩展名
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          // cloudPath 之所以要这样设置，是为了保持路径的唯一性，如果路径相同，那么后边上传的文件会覆盖前边上传的文件
          cloudPath:'blog/'+Date.now()+'-' + Math.random() * 10000000 + suffix,  // 上传至云端的路径
          filePath:item,   // 小程序临时文件路径
          success:(res)=>{
            // console.log(res)
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail:(err)=>{
            console.error(err)
            reject()
          }
        })
      })
      promiseArr.push(p)
    }

    // 存入云数据库
    Promise.all(promiseArr).then((res) => {
      db.collection('blog').add({
        data:{
          ...userInfo,  // userInfo 是一个对象，我想把对象每个属性都插入到数据库，可用扩展运算符
          content,
          img:fileIds,
          createTime:db.serverDate(),  // 发布时间应该取服务端时间，而不是客户端时间，因为客户端时间可能不准确
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })

        // 返回blog页面，并且刷新
        wx.navigateBack()
        const pages = getCurrentPages()
        // console.log(pages)
        // 取到上一个界面
        const prePage = pages[pages.length -2]
        prePage.onPullDownRefresh()
      })
    }).catch((err)=>{
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    userInfo = options
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