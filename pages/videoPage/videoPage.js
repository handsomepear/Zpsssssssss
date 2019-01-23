const app = getApp()
const { navigateTo, random } = require('../../utils/utils')
const { getConfigHandle, saveFormId } = require('../../server/common')

// 事件函数
let eventFunctions = {
  navigateTo: navigateTo,
  sendOrangeHandle() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },
  stopPropagation() {},
  
  // gif 图加载成功
  onImageLoad() {
    wx.hideLoading()
    this.setData({
      showPoster: false,
    })
    if(this.data.isAddName) {
      this.addNickName()
    }
  },
  // 开始加载gif 播放gif
  startLoadGif() {
    wx.showLoading()
    this.setData({
      showPlayBtn: false,
      //showPoster: false
      showGif: true
    })
  }
}

// 生命周期函数（属性值只能为function）
let lifeCycleFunctions = {
  onLoad(opts) {
    const that = this
    if(opts.fatherName) {
      this.setData({
        isAddName: true,
        father: opts.fatherName,
        son: opts.sonName
      })
    }
    getConfigHandle(() => {
      that.setData({
        gifUrl: app.globalData.gifUrl,
        gifDuration: app.globalData.gifDuration
      })
    })
  },
  onShow() {},
  onHide() {
    // 显示播放按钮 去除分享框
    this.setData({
      isShowPlayBtn: true,
      // isShowPullResult: false,
      showPlayBtn: true,
      showGif: false,
      showPoster: true,
      isShowFatherName: false,
      isShowSonName: false
    })
  }
}
// 开放能力 & 组件相关（属性值只能为function）
let wxRelevantFunctions = {
  onShareAppMessage(obj) {
    let userInfo = wx.getStorageSync('userInfo')
    let that = this
    let path = '/pages/videoPage/videoPage'
    if (obj.from === 'button') {
      path =
      '/pages/videoPage/videoPage?fatherName=' + this.data.father + '&sonName=' + this.data.son
    }
    console.log(path)
    return {
      title: '我买几个橘子去，你就在此地，不要走动~',
      imageUrl: random(app.globalData.shareImgList),
      path: path
    }
  },
}
Page({
  ...eventFunctions,
  ...lifeCycleFunctions,
  ...wxRelevantFunctions,
  name: 'videoPage',
  data: {
    isShowPlayBtn: true,
    father: '',
    son: '',
    isAddName: false,
    isShowFatherName: false,
    isShowSonName: false,
    fatherName: {
      left: 0,
      top: 0
    },
    sonName: {
      left: 220,
      top: 150
    },
    // isShowPullResult: false, // 领取橘子成功之后通知
    showGif: false, // gif图显示
    showPlayBtn: true, // 播放按钮显示
    gifUrl: '',
    gifDuration: 0,
    showPoster: true, // 显示封面图
  },
 
  // 视频中根据人物位置添加对应的用户昵称
  addNickName() {
    const that = this
    const d = that.data
    let currentTime = 0
    // 清除定时器
    clearInterval(d.nameInterval)
    if (!d.isSelf) {
      d.nameInterval = setInterval(() => {
        if (currentTime === d.gifDuration / 1000) {
          currentTime = 0
        }
        currentTime += 1
        switch (currentTime) {
          case 0 || 1 || 2 || 3:
            d.isShowFatherName = false
            d.isShowSonName = false
            break
          case 4 || 5:
            d.fatherName = {
              left: 400,
              top: 50
            }
            d.isShowFatherName = true
            d.isShowSonName = false
            break
          case 6 || 7 || 8:
            d.fatherName = {
              left: 260,
              top: 250
            }
            break
          case 9 || 10:
            d.fatherName = {
              left: 260,
              top: 150
            }
            break
          case 11 || 12:
            d.sonName = {
              left: 400,
              top: 0
            }
            d.isShowFatherName = false
            d.isShowSonName = true
            break
          case 13 || 14 || 15 || 16 || 17 || 18 || 19 || 20:
            d.isShowSonName = false
            break

          case 21 || 22:
            d.fatherName = {
              left: 110,
              top: 240
            }
            d.sonName = {
              left: 370,
              top: 200
            }
            d.isShowFatherName = true
            d.isShowSonName = true
            break
          case 23:
            d.fatherName = {
              left: 80,
              top: 100
            }
            d.sonName = {
              left: 430,
              top: 0
            }
            d.isShowFatherName = true
            d.isShowSonName = true
            break
          case 24 || 25 || 26:
            d.sonName = {
              left: 430,
              top: 0
            }
            d.isShowFatherName = false
            d.isShowSonName = true
            break
          default:
            break
        }
        that.setData(d)
      }, 1000)
      that.setData(d)
    }
  },
  saveFormId
})
