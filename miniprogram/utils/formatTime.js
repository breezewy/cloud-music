module.exports = (date)=>{
 let fmt = 'yyyy-MM-dd hh:mm:ss'
 const o = {
   'M+':date.getMonth() + 1,  // 月份
   'd+':date.getDate(),  //日
   'h+':date.getHours(),  //小时
   'm+':date.getMinutes(),  //分钟
   's+':date.getSeconds(),  //秒
 }

 if(/(y+)/.test(fmt)){
   fmt = fmt.replace(RegExp.$1,date.getFullYear())
  //  console.log(fmt)
 }

 for(let key in o){
   if(new RegExp('('+key+')').test(fmt)){
    fmt = fmt.replace(RegExp.$1,o[key].toString().length == 1 ? '0'+o[key] : o[key])
   }
 }

 return fmt
}