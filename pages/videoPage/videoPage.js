const app = getApp()
const { navigateTo } = require('../../utils/utils')

// 事件函数
let eventFunctions = {
    navigateTo: navigateTo
}

// 生命周期函数（属性值只能为function）
let lifeCycleFunctions = {
    onLoad() {
        this.setData({
            videoContext: wx.createVideoContext('video'),
            videoUrl: app.globalData.videoUrl
        })
    },
    onShow() {},
    onHide() {
        this.data.videoContext.pause()
        this.setData({ isShowPlayBtn: true })
    }
}
// 开放能力 & 组件相关（属性值只能为function）
let wxRelevantFunctions = {
    onShareMessage(obj) {
        let path = '/pages/videoPage/videoPage'
        if (obj.from == 'button') {
            ;(path = '/pages/videoPage/videoPage?shareOpenId=' + app), globalData.openId
        }
        return {
            title: '领橘子了～',
            path: path
        }
    },
    // 授权之后触发
    handleAuthorize(e) {
        this.setData({ isAuth: true })
        wx.navigateTo({ url: e.detail })
    },
    // 播放按钮授权
    handleGetuserinfo(e) {
        if (!app.globalData.isAuthorized) {
            let userInfo = e.detail.userInfo
            if (userInfo) {
                wx.setStorageSync('userInfo', userInfo)
                app.globalData.isAuthorized = true
            } else {
                wx.showToastWithoutIcon('拒绝授权')
                return
            }
        }
        this.playVideo()
    }
}
Page({
    ...eventFunctions,
    ...lifeCycleFunctions,
    ...wxRelevantFunctions,
    data: {
        isShowPlayBtn: true,
        videoUrl: '',
        videoContext: null,
        isSelf: true
    },
    playVideo() {
        this.setData({ isShowPlayBtn: false })
        this.data.videoContext.play()
    }
})
