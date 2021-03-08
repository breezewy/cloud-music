// pages/demo/demo.js
const db = wx.cloud.database()
const userDbCollection = db.collection('user')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    arr:['wxml','wxss','json','js'],
    arrObj:[{
      id:1,
      name:'a'
    },{
      id:2,
      name:'b'
    },{
      id:3,
      name:'c'
    }],
    testData:0,
    testObj:{
      name:'lilei',
      age:32
    }
  },
  changeAge(){
    this.setData({
      ['testObj.age']:33
    })
  },
  sort(){
    const length = this.data.arr.length
    for(let i=0;i<length;i++){
      const x = Math.floor(Math.random()*length)
      const y = Math.floor(Math.random()*length)
      const temp = this.data.arr[x]
      this.data.arr[x] = this.data.arr[y]
      this.data.arr[y] = temp
    }
    this.setData({
      arr:this.data.arr
    })
  },
  sortObj(){
    const length = this.data.arrObj.length
    for(let i=0;i<length;i++){
      const x = Math.floor(Math.random()*length)
      const y = Math.floor(Math.random()*length)
      const temp = this.data.arrObj[x]
      this.data.arrObj[x] = this.data.arrObj[y]
      this.data.arrObj[y] = temp
    }
    this.setData({
      arrObj:this.data.arrObj
    })
  },
  getMusicInfo(){
    wx.cloud.callFunction({
      name:'tcbRouter',
      data:{
        $url:'music'
      }
    }).then((res) => {
      console.log(res)
    })
  },
  getMovieInfo(){
    wx.cloud.callFunction({
      name:'tcbRouter',
      data:{
        $url:'movie'
      }
    }).then((res) => {
      console.log(res)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // new Promise((resolve,reject) => {
    //   setTimeout(()=>{
    //     console.log(1)
    //     resolve()
    //   },1000)
    // }).then((res)=>{
    //   setTimeout(()=>{
    //     console.log(2)
    //   },2000)
    // })

    // let p1 = new Promise((resolve,reject) => {
    //   setTimeout(()=>{
    //     console.log('p1')
    //     resolve('p1')
    //   },2000)
    // })
    // let p2 = new Promise((resolve,reject) => {
    //   setTimeout(()=>{
    //     console.log('p2')
    //     resolve('p2')
    //   },1000)
    // })
    // let p3 = new Promise((resolve,reject) => {
    //   setTimeout(()=>{
    //     console.log('p3')
    //     resolve('p3')
    //   },3000)
    // })

    // Promise.all([p1,p2,p3]).then((res) => {
    //   console.log('完成')
    //   console.log(res)
    // }).catch((err) =>{
    //   console.log('失败')
    //   console.log(err)
    // })

    // Promise.race([p1,p2,p3]).then((res) => {
    //   console.log('完成')
    //   console.log(res)
    // }).catch((err) =>{
    //   console.log('失败')
    //   console.log(err)
    // })

    // wx.getUserInfo({
    //   success:(res)=>{
    //     console.log(res.userInfo)
    //   }
    // })
    this.foo()
    
    console.log('setData 一开始的值：'+this.data.testData)
    this.setData({
      testData:1
    },()=>{
      console.log('回调执行')
    })
    console.log('setData 设置后的值：'+this.data.testData)

    for(let i=0;i<10000;i++){
      for(let j=0;j<10000;j++){

      }
    }
    console.log('setData 长耗时后的值：'+this.data.testData)
  },
  onGetUserInfo(event){
    console.log(event.detail.userInfo)
  },
  async foo(){
    console.log('foo')
    let res = await this.timeout()
    console.log(res)
  },
  timeout(){
    return new Promise((resolve,reject) => {
      setTimeout(()=>{
        console.log('timeout')
        resolve('resolved')
      },1000)
    })
  },
  getOpenID(){
    wx.cloud.callFunction({
      name:'login'
    }).then((res) => {
      console.log(res)
    })
  },
  getRes(){
    this.asyncFun(10,20).then((res) => {
      console.log(res)
    })
  },
  async asyncFun(a,b){
    const res1 = await this.fn1(a,b)
    console.log(res1)
    const res2 = await this.fn2(res1)
    console.log(res2)
    return res1+res2
  },
  fn1(x,y){
    return new Promise((resolve,reject)=>{
      setTimeout(()=>{
        let total = x+y
        resolve(total)
      },2000)
    })
  },
  fn2(res){
    return new Promise((resolve,reject) => {
      setTimeout(()=>{
        let total = res*2
        resolve(total)
      },1000)
    })
  },
  async insertData(){
    const res = await userDbCollection.add({
      data:{
        name:'张三',
        age:20
      }
    })
  },
  async getData(){
    const res = await userDbCollection.get()
    console.log(res)
  },
  async deleteData(){
    const res = await userDbCollection.where({
      _id:'9f2a34705fe59917009b93d967f012a2'
    }).remove()
    console.log(res)
  },
  async readDate20(){
    const res = await userDbCollection.where({
      age:db.command.gt(19)
    }).get()
    console.log(res)
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