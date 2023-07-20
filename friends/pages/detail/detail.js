// pages/detail/detail.js
const util=require("../../utils/util");
const app=getApp()
Page({

  data: {
    plcaceHolder:'评论'
  },

//请求动态详情
  onLoad(options) {
    //获得当前用户的openid
    this.setData({
      openid : app.globalData.openid
    })

    this.data.id=options.id
    this.getDetail()
  },
  getDetail(){
    var that=this;
    wx.cloud.database().collection('actions').doc(this.data.id).get({
      success(res){
        console.log(res)
        var action=res.data
        action.time=util.formatTime(new Date(action.time))

        //格式化时间
        for(var l in action .commentList){
          action.commentList[l].time=util.formatTime(new Date(action.commentList[l].time))
        }

        that.setData({
          action:res.data
        })
      }
    })
  },
  delete(){
    console.log(this.data.id)

    var that=this;
    wx.cloud.database().collection('actions').doc(this.data.id).remove({
      success(res){
        console.log(res)
        wx.showToast({
          title: '删除成功！',
        })
        wx.navigateBack({
          success(res){
            wx.showToast({
              title: '删除成功',
            })
          }
        })
      }
    })
  },
  //点赞
  prizeAction(event){
    var that=this;
    //判断是否授权，否则跳转至授权页面
    if(app.globalData.userInfo == null){
      wx.navigateTo({
        url:'/pages/auth/auth',
      })
    }else{
      console.log(that.data.id)
      var that=this;
      wx.cloud.database().collection('actions').doc(that.data.id).get({
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
            wx.cloud.database().collection('actions').doc(that.data.id).update({
              data:{
                prizeList:action.prizeList
              },
              success(res){
                
                console.log(res)
                that.getDetail()
              }
            })
          }else{//未点赞的点赞
            var user={}
            user.nickName=app.globalData.userInfo.nickName//(点赞时的)昵称
            user.faceImg=app.globalData.userInfo.avatarUrl//头像
            user.openid=app.globalData.openid//openid
            action.prizeList.push(user)
          
            wx.cloud.database().collection('actions').doc(that.data.id).update({
              data:{
              prizeList:action.prizeList
              },
              success(res){
                wx.showToast({
                  title: '点赞成功',
                })
                that.getDetail()
              }
            })
          }
          
        }
      })
    }
  
  },
  getInputValue(event){
   console.log(event.detail.value)
   
   this.data.inputValue=event.detail.value
   
  },
  publishComment(){
    var that =this;
    if(app.globalData.userInfo == null){
      wx.navigateTo({
        url:'/pages/auth/auth',
      })
    }else{
      console.log(that.data.id)
      var that=this;
      wx.cloud.database().collection('actions').doc(that.data.id).get({
        success(res){
          console.log(res)
          var action =res.data
          var comment={}
          comment.nickName=app.globalData.userInfo.nickName//(评论时的)昵称
          comment.faceImg=app.globalData.userInfo.avatarUrl//头像
          comment.openid=app.globalData.openid//openid
          comment.text=that.data.inputValue//发布的评论内容
          comment.time=Date.now()//评论的时间
          comment.toOpenid=''//回复对象的openid
          comment.toNickname=''//回复对象的姓名
          action.commentList.push(comment)
          
          wx.cloud.database().collection('actions').doc(that.data.id).update({
            
            data:{
            commentList:action.commentList
            },
            success(res){
              console.log(res)
              wx.showToast({
                title: '评论成功',
              })
              that.getDetail()
            }
          })


        }
      }) 
    }
  },
  deleteCom(event){
    var that=this;
    console.log(event.currentTarget.dataset.index)
    wx.showModal({
      title: '提示',
      content: '确定要删除此评论吗？',
      success(res){
        if(res.confirm){
          var index=event.currentTarget.dataset.index
          wx.cloud.database().collection('actions').doc(that.data.id).get({
            success(res){
              console.log(res)
              var action =res.data
              action.commentList.splice(index,1)
              wx.cloud.database().collection('actions').doc(that.data.id).update({
                data:{
                  commentList:action.commentList
                },
                success(res){
                  console.log(res)
                  wx.showToast({
                    title: '删除成功',
                  })
                  that.getDetail()
                }
              })
            }
          })
        }else if(res.cancel){

        }
      }
    })
  },
  huifuComment(event){
    console.log(event.currentTarget.dataset.index)
    var index = event.currentTarget.dataset.index
    this.setData({
      plcaceHolder :'回复' + '程序员：'
    })
  },
  onShareTimeline(){
    return{
      title: this.data.action.text,
      imageUrl:this.action.image[0],
      query:'pages/detail/detail?id' + this.data.id
    }
  }

})