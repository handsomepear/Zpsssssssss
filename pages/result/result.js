const app = getApp()
const { navigateTo, random } = require('../../utils/utils.js')
const { getRound } = require('../../server/api')
const { saveFormId } = require('../../server/common')
// 事件函数（属性值只能为function）
const eventFunctions = {
  navigateTo: navigateTo,
  sendOrangeHandle() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  }
}

// 生命周期函数（属性值只能为function）
const lifeCycleFunctions = {
  onLoad(opts) {
    const userInfo = wx.getStorageSync('userInfo')
    let that = this
    let gameId = opts.gameId
    let pullState = opts.pullState
    let shareOpenId = opts.shareOpenId
    let shareUsername = opts.shareUsername // 当前游戏的创建者
    let openId = app.globalData.openId
    let pages = getCurrentPages()
    if ((pages[pages.length - 2] && pages[pages.length - 2].name === 'mine') || opts.source === 'template') {
      this.setData({
        showResultState: false,
        shareUsername: userInfo.nickName,
        shareOpenId: app.globalData.openId
      })
    } else {
      this.setData({ pullState: pullState, shareUsername: shareUsername, shareOpenId: shareOpenId })
    }
    // 判断是不是自己
    if (shareOpenId) {
      this.setData({ isSelf: shareOpenId === openId })
    } else {
      this.setData({ isSelf: true })
    }
    this.setData({
      calls: app.globalData.calls,
      isx: app.globalData.isx
    })
    // 获取某局游戏记录
    getRound(gameId).then(res => {
      that.setData({
        getList: res.data.getList,
        avatar: res.data.owner_avatar,
        nickName: res.data.owner_name,
        currentGameOrange: res.data.orange_total,
        gameId: gameId,
        gameState: res.data.state
      })
    })
  },
  onShow() {},
  onHide() {}
}

// 开放能力 & 组件相关（属性值只能为function）
const wxRelevantFunctions = {
  onShareAppMessage(obj) {
    let that = this
    let path = '/pages/index/index'
    if (obj.from === 'button') {
      path = '/pages/index/index?gameSponsorOpenId=' + that.data.shareOpenId + '&gameId=' + that.data.gameId + '&source=share'
    }
    console.log(path)
    return {
      title: '我买几个橘子去，你就在此地，不要走动~',
      imageUrl: random(app.globalData.shareImgList),
      path: path
    }
  }
}

Page({
  ...eventFunctions,
  ...lifeCycleFunctions,
  ...wxRelevantFunctions,
  data: {
    shareUsername: '',
    pullState: 0,
    isx: false,
    showResultState: true,
    calls: [],
    getList: [],
    avatar: '',
    nickName: '',
    currentGameOrange: '',
    isSelf: false,
    hasOrange: true, // 是否已被领取完
    gameId: null,
    gameState: 3 // 3 表示已被领完或者超时 0 表示可分享
  },
  saveFormId
})
