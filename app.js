const utils = require('/utils/utils.js')
const {request} = require('/utils/request.js')
let fetch = request.fetch.bind(request)
let getServerUrl = request.getServerUrl.bind(request)
App({
    globalData: {
        channel: 'self', // 来源
        isAuthorized: false,
        openId: '',
        videoUrl: '', // 视频连接
        orangeMin: '', // 最少提现橘子数量
        postage: '', // 邮费
        priceList: [], // 提现个数选择
        gameUserInfo: {},
        shareImgList: [] // 分享图列表
    },
    onLaunch() {
        this.checkAuth()
        
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
