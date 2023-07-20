const util=require("../../utils/util");
const app = getApp()

Page({
  data: {
    
  },
  
  
  onLoad(options) {
    console.log('接收到的用户openid',options.openid)
    this.setData({
      userOpenid:options.openid
    })
    // 绑定用户id
    //云存储访问权限已修改为自定义权限（注）
    var that =this;
    setTimeout(function(){
      that.setData({
        myOpenid:app.globalData.openid
      })
    },2000)
    this.getActionsList()
  },
  //刷新主页的方法
  getActionsList(){
    var that = this
    wx.cloud.database().collection('actions').where({_openid: this.data.openid}).get({
      success(res){
        //console.log(res)
        //格式化时间
        var list =  res.data
        for(var l in list){
          list[l].time = util.formatTime(new Date(list[l].time))
        }
        for(var l in list){      
            for(var j in list[l].commentlist){
              list[l].commentlist[l].time=util.formatTime(new Date(list[l].commentlist[l].time))
            }   
          
        }

        that.setData({
          actionsList : list
        })
      }
    })
  },
  toPublish(){
    //跳转到授权信息页面
    if(app.globalData.userInfo == null){
      wx.navigateTo({
        url: '/pages/auth/auth',
      })
    }else{
      wx.navigateTo({
        url: '/pages/publish/publish',
      })
    }
    wx.navigateTo({
      url: '/pages/publish/publish'
    })
  },
  //进入详情界面
  toDetail(event){
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + event.currentTarget.dataset.id,
    })
  },
  //删除
  deletedAction(event){
    console.log(event.currentTarget.dataset.id)
    var that=this;
    wx.cloud.database().collection('actions').doc(event.currentTarget.dataset.id).remove({
      success(res){
        console.log(res)
        wx.showToast({
          title: '删除成功！',
        })
        that.getActionsList()
      }
    })
},
//下拉刷新
onPullDownRefresh(){
  this.getActionsList()
},
//点赞
prizeAction(event){
  //判断是否授权，否则跳转至授权页面
  if(app.globalData.userInfo == null){
    wx.navigateTo({
      url:'/pages/auth/auth',
    })
  }else{
    console.log(event.currentTarget.dataset.id)
    var that=this;
    wx.cloud.database().collection('actions').doc(event.currentTarget.dataset.id).get({
      success(res){
        console.log(res)
        var action =res.data
        var tag=false
        var index
        for(var l in action.prizeList){//判断该用户是否已经点赞过
          if(action.prizeList[l].openid==app.globalData.openid){
            tag=true
            index=l
            break
          }
        }
        if(tag){//点赞的取消点赞
          action.prizeList.splice(index,1)
          wx.cloud.database().collection('actions').doc(event.currentTarget.dataset.id).update({
            data:{
              prizeList:action.prizeList
            },
            success(res){
              
              console.log(res)
              that.getActionsList()
            }
          })
        }else{//未点赞的点赞
          var user={}
          user.nickName=app.globalData.userInfo.nickName//(点赞时的)昵称
          user.faceImg=app.globalData.userInfo.avatarUrl//头像
          user.openid=app.globalData.openid//openid
          action.prizeList.push(user)
        
          wx.cloud.database().collection('actions').doc(event.currentTarget.dataset.id).update({
            data:{
            prizeList:action.prizeList
            },
            success(res){
              wx.showToast({
                title: '点赞成功',
              })
              that.getActionsList()
            }
          })
        }
        
      }
    })
  }



},
  deleteComment(event){
    var that=this;
    console.log(event.currentTarget.dataset.id)
    console.log(event.currentTarget.dataset.index)
    wx.showModal({
      title: '提示',
      content: '确定要删除此评论吗？',
      success(res){
        if(res.confirm){
          var index=event.currentTarget.dataset.index
          wx.cloud.database().collection('actions').doc(event.currentTarget.dataset.id).get({
            success(res){
              console.log(res)
              var action =res.data
              action.commentList.splice(index,1)
              wx.cloud.database().collection('actions').doc(event.currentTarget.dataset.id).update({
                data:{
                  commentList:action.commentList
                },
                success(res){
                  console.log(res)
                  wx.showToast({
                    title: '删除成功',
                  })
                  that.getActionsList()
                }
              })
            }
          })
        }else if(res.cancel){

        }
      }
    })
    
  },
  onShareAppMessage(event){
    console.log(event.target.dataset.index)
    var index = event.target.dataset.index
    return{
      title:this.data.actionsList[index].text,
      imageUrl :this.data.actionsList[index].images[0],
      path : 'pages/detail/detail?id=' + this.data.actionsList[index]._id
    }
  }
})
