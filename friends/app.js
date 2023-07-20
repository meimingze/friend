// app.js
App({
  onLaunch: function() {
    //云开发环境的初始化
    wx.cloud.init({
      env:"class-1g3brl7r0ce893fb"
    })
    var that =this;
    wx.cloud.callFunction({
      name:'getUserOpenid',
      success(res){
        console.log(res)
        that.globalData.openid=res.result.openid
        }
    })
  },
  globalData: {
    userInfo: null,
    openid: null
  }
})
