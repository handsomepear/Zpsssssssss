const utils = require('/utils/utils.js')
const { request } = require('/utils/request.js')
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
        gameUserInfo: {}
    },
    onLaunch() {
        this.checkAuth()
        this.getConfig()
        this.getGameUserInfo()
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
                    console.log(openId);
                })
                .catch(err => {
                    wx.showToastWithoutIcon(err.msg)
                })
        }
    },
    getConfig() {
        let that = this
        fetch({
            url: getServerUrl('/getConfig'),
            method: 'POST'
        })
            .then(res => {
                that.globalData.openId = request.clientEnv.openId
                that.globalData.postage = res.data.postage
                that.globalData.orangeMin = res.data.orange_min
                that.globalData.videoUrl = res.data.video_url
                that.globalData.priceList = res.data.price_list
            })
            .catch(err => {
                // resolve 中代码出错也会进catch语句
                if (err.msg) {
                    wx.showToastWithoutIcon(err.msg)
                } else {
                    console.log(err)
                }
            })
    },
    getGameUserInfo() {
        let that = this
         fetch({
            url: getServerUrl('/user/getUserInfo'),
        }).then(res => {
            that.globalData.gameUserInfo.orange = res.data.orange
        })
    },
})
