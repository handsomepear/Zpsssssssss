const app = getApp()
const { navigateTo, randomShareImg } = require('../../utils/utils')
const { pullFromRound, register } = require('../../server/api')
const { getConfigHandle, saveFormId } = require('../../server/common')

// 事件函数
let eventFunctions = {
    navigateTo: navigateTo,
    // 领橘子（视频播放完毕之后触发）
    pullFromRound() {
        let that = this
        pullFromRound(this.data.gameId)
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
    },
    // 视频中根据人物位置添加对应的用户昵称
    addNickName(e) {
        if (!this.data.isSelf) {
            let currentTime = Math.round(e.detail.currentTime)
            let d = this.data
            console.log(currentTime)
            switch (currentTime) {
                case 0 || 1 || 2 || 3:
                    d.isShowFaterName = false
                    d.isShowSonName = false
                    break
                case 4 || 5:
                    d.fatherName = {
                        left: 400,
                        top: 50
                    }
                    d.isShowFaterName = true
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
                    d.isShowFaterName = false
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
                    d.isShowFaterName = true
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
                    d.isShowFaterName = true
                    d.isShowSonName = true
                    break
                case 24 || 25 || 26:
                    d.sonName = {
                        left: 430,
                        top: 0
                    }
                    d.isShowFaterName = false
                    d.isShowSonName = true
                    break
                default:
                    break
            }
            this.setData(d)
        }
    }
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
                shareUsername: userInfo.nickName,
                isShowFaterName: false,
                isShowSonName: false
            })
        } else {
            var userInfo = wx.getStorageSync('userInfo') // 被分享者用户信息
            var openId = wx.getStorageSync('openId')
            this.setData({
                isShowShareModal: false,
                shareOpenId: opts.shareOpenId,
                shareUsername: opts.shareUsername,
                father: opts.shareUsername,
                isShowFaterName: false,
                isShowSonName: false
            })
            if (openId && openId == this.data.shareOpenId) {
                this.setData({ isSelf: true })
            }
            if (userInfo) {
                this.setData({ son: userInfo.nickName })
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
            that.setData({
                videoContext: wx.createVideoContext('video'),
                videoUrl: app.globalData.videoUrl,
                gameId: opts.gameId
            })
        })
    },
    onShow() {},
    onHide() {
        this.data.videoContext.pause()
        // 显示播放按钮 去除分享框
        this.setData({
            isShowPlayBtn: true,
            isShowShareModal: false,
            isShowFaterName: false,
            isShowSonName: false,
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
                that.data.gameId +
                '&shareUsername=' +
                this.data.shareUsername
        }
        return {
            title: '我买几个橘子去。你就在此地，不要走动。',
            imageUrl: randomShareImg(app.globalData.shareImgList),
            path: path
        }
    },
    // 授权之后触发
    handleAuthorize(e) {
        const userInfo = wx.getStorageSync('userInfo')
        this.setData({ son: userInfo.nickName })
        wx.navigateTo({ url: e.detail })
    },
    // 播放按钮授权
    handleGetuserinfo(e) {
        let that = this
        if (!app.globalData.isAuthorized) {
            let userInfo = e.detail.userInfo
            if (userInfo) {
                wx.setStorageSync('userInfo', userInfo)
                app.globalData.isAuthorized = true
                that.setData({ son: userInfo.nickName })
                register({
                    nickName: userInfo.nickName,
                    avatar: userInfo.avatarUrl,
                    channel: app.globalData.channel,
                    gender: userInfo.gender
                }).then(res => {
                    console.log(res.msg)
                })
            } else {
                wx.showToastWithoutIcon('拒绝授权')
                return
            }
        }
        that.playVideo()
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
        isSelf: false,
        gameId: null,
        father: '',
        son: '',
        isShowFaterName: false,
        isShowSonName: false,
        fatherName: {
            left: 0,
            top: 0
        },
        sonName: {
            left: 220,
            top: 150
        },
        isShowPullResult: false, // 领取橘子成功之后通知
        isShowShareModal: false,
        shareOpenId: '', // 分享链接的参数
        shareUsername: ''
    },
    playVideo() {
        this.setData({ isShowPlayBtn: false })
        this.data.videoContext.play()
    },
    saveFormId
})
