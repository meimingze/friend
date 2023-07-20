// pages/auth/auth.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  getInfo(e){
    console.log(e)
    console.log(e.detail.userInfo);
    app.globalData.userInfo = e.detail.userInfo;
    wx.navigateBack({
      success(res){
        wx.showToast({
          title: '授权成功',
        })
      }
    })
  },
  toManage(){
    wx.navigateTo({
      url: '/pages/manage/manage',
    })
  }
})