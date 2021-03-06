const app = getApp()
const { navigateTo, randomShareImg } = require('../../utils/utils')
const { pullFromRound, register, getRound } = require('../../server/api')
const { getConfigHandle, saveFormId } = require('../../server/common')

/**
 * 事件函数
 */
let eventFunctions = {
    // 发橘子
    navigateTo: navigateTo,
    sendOrange() {
        this.setData({ isShowPullResult: false })
        clearTimeout(this.data.timer)
        wx.navigateTo({
            url: '/pages/index/index'
        })
    },
    stopPropagation() {},
    // 关闭分享弹窗
    closeShareModal() {
        this.setData({ isShowShareModal: false })
    }
}
/**
 * 生命周期
 */
let lifeCycleFunctions = {
    onLoad(opts) {
        const that = this
        this.setData({
            gameId: opts.gameId
        })
        if (opts.from == 'index') {
            this.setData({
                isShowShareModal: true,
                shareOpenId: app.globalData.openId,
                isSelf: true
            })
            that.getRound()
        } else {
            var userInfo = wx.getStorageSync('userInfo') // 被分享者用户信息
            var openId = wx.getStorageSync('openId')
            this.setData({
                isShowShareModal: false,
                shareOpenId: opts.shareOpenId
            })
            if (!userInfo) {
                this.setData({ showAuthPanel: true })
                that.getRound()
            } else {
                this.setData({ showAuthPanel: false })
                that.pullFromRound(() => {
                    that.getRound()
                })
            }

            if (openId && openId == this.data.shareOpenId) {
                this.setData({ isSelf: true })
            }
        }
        getConfigHandle(() => {
            var openId = wx.getStorageSync('openId')
            if (openId == this.shareOpenId) {
                // 表示是自己
                that.setData({
                    isSelf: true
                })
            }
        })
    },
    onHide() {
        this.setData({ isShowPullResult: false })
    }
}

/**
 * 开放能力
 */
let wxRelevantFunctions = {
    handleAuthorize(e) {
        const userInfo = wx.getStorageSync('userInfo')
        this.setData({ son: userInfo.nickName })
        wx.navigateTo({ url: e.detail })
    },
    // 按钮授权
    handleGetuserinfo(e) {
        let that = this
        if (!app.globalData.isAuthorized) {
            let userInfo = e.detail.userInfo
            if (userInfo) {
                that.setData({ showAuthPanel: false })
                wx.setStorageSync('userInfo', userInfo)
                app.globalData.isAuthorized = true
                register({
                    nickName: userInfo.nickName,
                    avatar: userInfo.avatarUrl,
                    channel: app.globalData.channel,
                    gender: userInfo.gender
                }).then(res => {
                    that.pullFromRound(() => {
                        that.getRound()
                    })
                })
            }
        }
    },

    onShareAppMessage(obj) {
        let userInfo = wx.getStorageSync('userInfo')
        let that = this
        let path = '/pages/sharePage/sharePage'
        if (obj.from == 'button') {
            path = '/pages/sharePage/sharePage?shareOpenId=' + this.data.shareOpenId + '&gameId=' + that.data.gameId
        }
        console.log(path)
        return {
            title: '我买几个橘子去。你就在此地，不要走动。',
            imageUrl: randomShareImg(app.globalData.shareImgList),
            path: path
        }
    }
}

Page({
    ...eventFunctions,
    ...lifeCycleFunctions,
    ...wxRelevantFunctions,
    data: {
        shareOpenId: '',
        showAuthPanel: false,
        isSelf: false,
        gameId: null,
        isShowPullResult: false, // 领取橘子成功之后通知
        isShowShareModal: false,
        getList: [],
        avatar: '',
        nickName: '',
        currentGameOrange: '',
        gameState: 3
    },
    getRound() {
        const that = this
        getRound(this.data.gameId).then(res => {
            that.setData({
                getList: res.data.getList,
                avatar: res.data.owner_avatar,
                nickName: res.data.owner_name,
                currentGameOrange: res.data.orange_total,
                gameState: res.data.state
            })
        })
    },
    // 领橘子（视频播放完毕之后触发）
    pullFromRound(cb) {
        const that = this
        pullFromRound(this.data.gameId)
            .then(res => {
                cb && cb()
                that.setData({ isShowPullResult: true })
            })
            .catch(err => {
                cb && cb()
                wx.showToastWithoutIcon(err.msg)
            })
    },
    saveFormId
})
