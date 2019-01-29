const app = getApp()
const { navigateTo, random } = require('../../utils/utils.js')
const { startRound, pullFromRound, getRound, getMyRounds, register } = require('../../server/api')
const { getConfigHandle, getGameUserInfo, saveFormId } = require('../../server/common')
// 事件函数（属性值只能为function）
let eventFunctions = {
  navigateTo: navigateTo,
  getSendOrangeNum(e) {
    let sendOrangeNum = e.detail.value
    this.setData({
      sendOrangeNum: sendOrangeNum
    })
  },
  showNumInput() {
    this.setData({ isShowNumInput: true })
  },
  hideNumInput(e) {
    this.setData({ isShowNumInput: false })
  },
  stopPropagation() {},
  toVideoPage() {
    let path = '/pages/videoPage/videoPage'
    if (this.data.source === 'share') {
      path = '/pages/videoPage/videoPage?fatherName=' + this.data.gameData.fatherName + '&sonName=' + this.data.getList[0].nickName
    }
    wx.navigateTo({ url: path })
  },
  // 关闭分享弹窗
  closeShareModal() {
    this.setData({ isShowShareModal: false })
  },
  // 发橘子
  startRoundHandle() {
    const that = this
    if (!this.data.orangeTotal) {
      wx.showToastWithoutIcon('您没有橘子')
      return
    } else if (!this.data.sendOrangeNum || this.data.sendOrangeNum === '0') {
      wx.showToastWithoutIcon('请至少发送一个橘子')
      return
    } else if (this.data.sendOrangeNum > this.data.orangeTotal) {
      wx.showToastWithoutIcon('您发送橘子数量超过了您橘子的个数')
      return
    }
    // 节流
    if (!this.data.canSend) {
      return
    } else {
      this.setData({ canSend: false })
    }
    // 服务端请求 开启游戏
    startRound(this.data.sendOrangeNum).then(res => {
      const userInfo = wx.getStorageSync('userInfo')
      const openId = wx.getStorageSync('openId')
      that.setData({
        canSend: true,
        isShowShareModal: true,
        gameId: res.data.id,
        gameData: {
          fatherName: userInfo.nickName,
          fatherAvatarUrl: userInfo.avatarUrl,
          currentGameOrange: res.data.orange
        },
        orangeTotal: this.data.orangeTotal - parseInt(this.data.sendOrangeNum),
        getList: [],
        gameSponsorOpenId: openId
      })
    })
  },
  viewHistory() {
    wx.navigateTo({
      url: '/pages/mine/mine'
    })
  },
  closeGetOrangeModal() {
    this.setData({ showGetOrangeModal: false })
  },
  next() {
    if (this.data.getIndex < this.data.getList.length - 1) {
      const getIndex = ++this.data.getIndex
      this.setData({
        getIndex
      })
    }
  },
  pre() {
    if (this.data.getIndex > 0) {
      const getIndex = --this.data.getIndex
      this.setData({
        getIndex
      })
    }
  }
}

// 生命周期函数（属性值只能为function）
let lifeCycleFunctions = {
  onLoad(opts) {
    const that = this
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({
      userInfo: userInfo
    })
    this.pageLandHandle(opts)
    getConfigHandle(() => {
      that.setData({
        videoEnable: app.globalData.videoEnable,
        gifUrl: app.globalData.gifUrl,
        bannerUrl: app.globalData.bannerUrl
      })
    })
  },
  onShow() {
    let that = this
    this.setData({ isAuthorized: app.globalData.isAuthorized })
    getGameUserInfo(
      () => {
        // 老用户
        that.setData({ orangeTotal: app.globalData.gameUserInfo.orangeTotal })
      },
      () => {
        // 新用户
        that.setData({ orangeTotal: 2 })
      }
    )
  },
  onHide() {}
}

// 开放能力 & 组件相关（属性值只能为function）
let wxRelevantFunctions = {
  onShareAppMessage(obj) {
    let that = this
    let path = '/pages/index/index'
    if (obj.from === 'button') {
      path = '/pages/index/index?gameSponsorOpenId=' + that.data.gameSponsorOpenId + '&gameId=' + that.data.gameId + '&source=share'
    }
    return {
      title: '我买几个橘子去，你就在此地，不要走动~',
      imageUrl: random(app.globalData.shareImgList),
      path: path
    }
  },
  // 授权之后触发
  handleAuthorize(e) {
    const that = this
    that.setData({ isAuthorized: true })
    const userInfo = wx.getStorageSync('userInfo')
    this.setData({
      gameData: {
        fatherAvatarUrl: userInfo.avatarUrl,
        fatherName: userInfo.nickname
      }
    })
    if (e.detail) {
      wx.navigateTo({ url: e.detail })
    } else {
      //// 发橘子按钮
      //getGameUserInfo(() => {
      //    that.setData({ orangeTotal: app.globalData.gameUserInfo.orangeTotal })
      //})
      that.startRoundHandle()
    }
  },
  // 点击播放按钮获取橘子
  handleGetUserInfo(e) {
    let that = this
    if (!this.data.isAuthorized) {
      let userInfo = e.detail.userInfo
      if (userInfo) {
        wx.setStorageSync('userInfo', userInfo)
        app.globalData.isAuthorized = true
        that.setData({
          gameData: {
            fatherAvatarUrl: userInfo.avatarUrl,
            fatherName: userInfo.nickName
          }
        })
        register({
          nickName: userInfo.nickName,
          avatar: userInfo.avatarUrl,
          channel: app.globalData.channel,
          gender: userInfo.gender
        }).then(res => {
          console.log(res.msg)
          that.setData({ showAuthModal: false })
          that.pullFromRoundHandle()
        })
      } else {
        wx.showToastWithoutIcon('拒绝授权')
        return
      }
    }
  },
  saveFormId
}

Page({
  ...eventFunctions, // 放到上面 避免覆盖Page里面的内容
  ...lifeCycleFunctions,
  ...wxRelevantFunctions,
  name: 'index',
  data: {
    canSend: true,
    bannerUrl: '',
    isAuthorized: false,
    orangeTotal: 0, // 账户橘子个数
    sendOrangeNum: null, // 发橘子个数
    gameId: null,
    isShowNumInput: false, // 显示真正的输入框
    isShowShareModal: false,
    videoEnable: true,
    gifUrl: '',
    showGetOrangeModal: false, // 是否获得橘子
    userInfo: null,
    showAuthModal: false, // 是否显示授权末班
    source: '',
    getList: [], // 当局游戏的领取列表
    getIndex: 0,
    currentGameOrange: null, // 当局游戏共发的橘子个数
    pullState: null, // 领取橘子状态  0 表示领取到 1表示未领取到
    gameState: 0,
    gameSponsorOpenId: null, // 橘子游戏的所有者
    fatherAvatarUrl: null, // 橘子游戏的所有者
    // fatherName: null, // 橘子游戏的所有者
    // sonName: null, // 领橘子的人
    gameData: null // 底部列表数据
    // demo: {
    //   fatherAvatarUrl: '',
    //   fatherName: '',
    //   currentGameOrange: ''
    // }
  },
  pageLandHandle(opts) {
    if (opts && opts.source === 'share') {
      this.setData({
        gameId: opts.gameId,
        source: 'share'
      })
      const userInfo = wx.getStorageSync('userInfo')
      if (!userInfo) {
        this.setData({
          showAuthModal: true
        })
      }else {
        this.pullFromRoundHandle()
      }
    } else {
      this.getRecentGame()
    }
  },
  // 获取用户最近一次游戏数据
  getRecentGame() {
    const that = this
    getMyRounds().then(res => {
      if(res.data.length){
        that.setData({
          gameId: res.data[0].id
        })
        that.getRoundByGameId()
      }
    })
  },
  // 领橘子
  pullFromRoundHandle() {
    let that = this
    // 根据gif图时长确定领橘子时机
    pullFromRound({
      gameId: that.data.gameId,
      call: random(app.globalData.calls)
    })
      .then(() => {
        that.getRoundByGameId()
        // 领到橘子
        that.setData({
          pullState: 0,
          showGetOrangeModal: true,
          orangeTotal: that.data.orangeTotal + 1
        })
      })
      .catch(err => {
        that.getRoundByGameId()
        // 未领取到橘子
        if(err.result === -6) {
          wx.showToastWithoutIcon('不能领取自己的橘子', 2000)
        }else {
          wx.showToastWithoutIcon('橘子已领完', 2000)
        }
        
        that.setData({ pullState: 1 })
      })
  },

  getRoundByGameId() {
    const that = this
    getRound(this.data.gameId).then(res => {
      that.setData({
        getList: res.data.getList,
        gameData: {
          fatherAvatarUrl: res.data.owner_avatar,
          fatherName: res.data.owner_name,
          currentGameOrange: res.data.orange_total
        },
        gameState: res.data.state
      })
    })
  }
})
