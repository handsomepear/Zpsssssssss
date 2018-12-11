const app = getApp()
const { navigateTo, randomShareImg } = require('../../utils/utils')
const { pullFromRound, register } = require('../../server/api')
const { getConfigHandle, saveFormId } = require('../../server/common')

// 事件函数
let eventFunctions = {
    navigateTo: navigateTo,
    // 领橘子（视频播放完毕之后触发）

    sendOrange() {
        this.setData({ isShowPullResult: false })
        wx.navigateTo({
            url: '/pages/index/index'
        })
    },
    stopPropagation() {},
    // 关闭分享弹窗
    closeShareModal() {
        this.setData({ isShowShareModal: false })
    },
}

// 生命周期函数（属性值只能为function）
let lifeCycleFunctions = {
    onLoad(opts) {
        const that = this
        if (opts.from == 'index') {
            var userInfo = wx.getStorageSync('userInfo') // 分享者的用户信息
            this.setData({
                isShowShareModal: true,
                shareOpenId: app.globalData.openId,
            })
        } else {
            var userInfo = wx.getStorageSync('userInfo') // 被分享者用户信息
            var openId = wx.getStorageSync('openId')
            this.setData({
                isShowShareModal: false,
                shareOpenId: opts.shareOpenId,
            })
            getConfigHandle(() => {
                this.pullFromRound(opts.gameId)
            })

        }
    },
    onShow() {},
    onHide() {
        // 显示播放按钮 去除分享框
        this.setData({
            isShowShareModal: false,
            isShowPullResult: false
        })
    }
}
// 开放能力 & 组件相关（属性值只能为function）
let wxRelevantFunctions = {
    onShareAppMessage(obj) {
        let userInfo = wx.getStorageSync('userInfo')
        let that = this
        let path = '/pages/videoPage/videoPage'
        if (obj.from == 'button') {
            path =
                '/pages/videoPage/videoPage?shareOpenId=' +
                this.data.shareOpenId +
                '&gameId=' +
                that.data.gameId
        }
        return {
            title: '我买几个橘子去。你就在此地，不要走动。',
            imageUrl: randomShareImg(app.globalData.shareImgList),
            path: path
        }
    },
    // 授权之后触发
    handleAuthorize(e) {
        console.log(e)
        const userInfo = wx.getStorageSync('userInfo')
        wx.navigateTo({ url: e.detail })
    },
}
Page({
    ...eventFunctions,
    ...lifeCycleFunctions,
    ...wxRelevantFunctions,
    data: {
        gameId: null,
        isShowPullResult: false, // 领取橘子成功之后通知
        isShowShareModal: false,
        shareOpenId: '', // 分享链接的参数
    },
    // 领橘子
    pullFromRound(gameId) {
        let that = this
        pullFromRound(gameId)
            .then(res => {
                that.setData({ isShowPullResult: true })
            })
            .catch(err => {
                wx.showToastWithoutIcon(err.msg)
                wx.navigateTo({
                    url:
                        '/pages/result/result?gameId=' +
                        that.data.gameId +
                        '&openId=' +
                        app.globalData.openId +
                        '&shareOpenId=' +
                        that.data.shareOpenId
                })
            })
    },
    saveFormId
})
