const utils = require('/utils/utils.js')
const { request } = require('/utils/request.js')
App({
  globalData: {
    channel: 'self', // 来源
    isAuthorized: false, // 是否授权
    openId: '', // openId
    videoUrl: '', // 视频连接
    orangeMin: '', // 最少提现橘子数量
    postage: '', // 邮费
    priceList: [], // 提现个数选择
    gameUserInfo: {}, // 用户信息
    shareImgList: [], // 分享图列表
    videoEnable: true, // 视频页是否激活
    gifUrl: '', // gif图
    gifEnable: false, // 是否需要gif图
    calls: [], // 称呼
    gifDuration: 27000, // gif 时长
    isx: false,
    newUserFlag: false
  },
  onLaunch() {
    const that = this
    this.checkAuth()
    wx.getSystemInfo({
      success: res => {
        let modelmes = res.model.toLowerCase()
        if (
          modelmes.search(/<iphone10,3>/) !== -1 || // @"国行(A1865)、日行(A1902)iPhone X";
          modelmes.search(/<iphone10,6>/) !== -1 || // @"美版(Global/A1901)iPhone X";
          modelmes.search(/<iphone11,2>/) !== -1 || // @"iPhone XS";
          modelmes.search(/<iphone11,4>/) !== -1 || // @"iPhone XS Max";
          modelmes.search(/<iphone11,6>/) !== -1 || // @"iPhone XS Max";
          modelmes.search(/<iphone11,8>/) !== -1 || // @"iPhone XR";
          modelmes.search(/iphone x/) !== -1
        ) {
          that.globalData.isx = true
        }
      }
    })
  },
  checkAuth() {
    let userInfo = wx.getStorageSync('userInfo')
    this.globalData.isAuthorized = !!userInfo
  },
  getOpenId() {
    let that = this
    let openId = wx.getStorageSync('openId')
    if (openId) {
      that.globalData.openId = openId
    } else {
      request
        .getOpenId()
        .then(openId => {
          that.globalData.openId = openId
          console.log(openId)
        })
        .catch(err => {
          wx.showToastWithoutIcon(err.msg)
        })
    }
  }
})
