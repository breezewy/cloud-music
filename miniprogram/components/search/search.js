// components/search/search.js
let keyWord = ''
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder:{
      type:String,
      value:"请输入关键字"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  externalClasses:[
    'iconfont',
    'icon-sousuo'
  ],
  /**
   * 组件的方法列表
   */
  methods: {
    onInput(event){
      keyWord = event.detail.value
    },
    onSearch(){
      // console.log(keyWord)
      this.triggerEvent('search',{
        keyWord
      })
    }
  }
})
