// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env:cloud.DYNAMIC_CURRENT_ENV
})

// 初始化云数据库
const db = cloud.database()   

// 引入axios
const axios = require('axios')

// 歌单api
const URL = 'https://apis.imooc.com/personalized?icode=9B4868FE99440799'

const playlistCollection = db.collection('playlist')

const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {

  // 云函数取云数据库数据一次最多取100条，小程序端取云数据库数据一次最多取20条
  // 想要突破限制，一个方法就是取多次

  // 查询集合的条数，返回的是一个对象，也是异步的
  const countResult = await playlistCollection.count()
  const total = countResult.total
  // 从数据库取的次数
  const batchTimes = Math.ceil(total/MAX_LIMIT)
  // 因为每次从数据库取数据都是异步的，所以提前准备一个tasks数组来承载这些异步任务
  const tasks = [] 
  // skip从第几条开始取，limit一次最多取几条
  for(let i=0;i<batchTimes;i++){
    let promise = playlistCollection.skip(i*MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }

  let list = {
    data: []
  }
  if(tasks.length > 0){
    // reduce方法接收一个函数作为累加器，acc参数是之前的数据，cur是当前数据
    list = (await Promise.all(tasks)).reduce((acc,cur) => {
      return {
        data:acc.data.concat(cur.data)
      }
    })
  }



  const { data } =  await axios.get(URL)
  // 当code码大于1000的时候，表示请求失败了。把失败信息打印在日志里给开发人员
  if(data.code >= 1000){
    console.log(data.msg)
    return 0
  }
  const playlist = data.result

  // 因为需要经常更新歌单，所以要经常请求服务器获取数据，所以要对比数据库数据和服务器获取的数据，去除重复的
  const newData = []
  for(let i=0,len1 = playlist.length;i<len1;i++){
    let flag = true  // 标记变量，初始值true表示不是同一条数据
    for(let j=0,len2 = list.data.length;j<len2;j++){
      if(playlist[i].id === list.data[j].id){
        flag = false
        break
      }
    }
    if(flag){
      let pl = playlist[i]
      pl.createTime = db.serverDate()
      newData.push(pl)
    }
  }

  // 数据要一条一条的插入数据库，所以要遍历

  // 把数据插入数据库的过程，也是异步的，所以可以加await
  if(newData.length > 0){
    await playlistCollection.add({
      data:[...newData]
    }).then((res) => {
      console.log('插入成功')
    }).catch((err) => {
      console.error('插入失败')
    })
  }
  
  return newData.length    
}