const app = getApp()
const { navigateTo, random } = require('../../utils/utils')
const { pullFromRound, register } = require('../../server/api')
const { getConfigHandle, saveFormId } = require('../../server/common')

// 事件函数
let eventFunctions = {
    navigateTo: navigateTo,
    sendOrange() {
        this.setData({ isShowPullResult: false })
        clearTimeout(this.data.pullTimer)
        wx.navigateTo({
            url: '/pages/index/index'
        })
    },
    stopPropagation() {
    },
    // 关闭分享弹窗
    closeShareModal() {
        this.setData({ isShowShareModal: false })
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
                if(currentTime === d.gifDuration / 1000) {
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
        }
    },
    // gif 图加载成功
    onImageLoad(){
        wx.hideLoading()
        this.setData({
            showPoster: false
        })
        this.addNickName()
    },
    // 开始加载gif 播放gif
    startLoadGif(){
        wx.showLoading()
        this.setData({
            showPlayBtn: false,
            //showPoster: false
            showGif : true
        })
        const pages = getCurrentPages()
        if(pages[0]['name'] !== 'index') {
            // 点击播放按钮领取橘子
            this.pullFromRound()
        }
    }
}

// 生命周期函数（属性值只能为function）
let lifeCycleFunctions = {
    onLoad(opts) {
        const that = this
        if (opts.from === 'index') {
            var userInfo = wx.getStorageSync('userInfo') // 分享者的用户信息
            this.setData({
                isShowShareModal: true,
                shareOpenId: app.globalData.openId,
                shareUsername: userInfo.nickName,
                isShowFatherName: false,
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
                isShowFatherName: false,
                isShowSonName: false
            })
            if (openId && openId === this.data.shareOpenId) {
                this.setData({ isSelf: true })
            }
            if (userInfo) {
                this.setData({ son: userInfo.nickName })
            }
        }
        getConfigHandle(() => {
            var openId = wx.getStorageSync('openId')
            if (openId === this.shareOpenId) {
                // 表示是自己
                that.setData({
                    isSelf: true,
                })
            }
            that.setData({
                gameId: opts.gameId,
                gifUrl: app.globalData.gifUrl,
                gifDuration: app.globalData.gifDuration
            })
        })
    },
    onShow() {
    },
    onHide() {
        // 显示播放按钮 去除分享框
        this.setData({
            isShowPlayBtn: true,
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
        if (obj.from === 'button') {
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
            imageUrl: random(app.globalData.shareImgList),
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
        that.startLoadGif()
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
        isShowPullResult: false, // 领取橘子成功之后通知
        isShowShareModal: false,
        shareOpenId: '', // 分享链接的参数
        shareUsername: '',
        pullTimer: null, // 领橘子定时器 时长根据gif图时长来计算
        nameInterval: null,
        showGif: false, // gif图显示
        showPlayBtn: true, // 播放按钮显示
        gifUrl: '',
        gifDuration: 0,
        showPoster: true // 显示封面图
    },
    // 领橘子（视频播放完毕之后触发）
    pullFromRound() {
        let that = this
        // 根据gif图时长确定领橘子时机
        let pullTimer = setTimeout(() => {
            pullFromRound({
                gameId: that.data.gameId,
                call: random(app.globalData.calls)
            })
                .then(res => {
                    that.setData({ isShowPullResult: true })
                })
                .catch(err => {
                    //wx.showToastWithoutIcon(err.msg)
                })
        }, 5000)
        this.setData({ pullTimer: pullTimer })
    },
    playVideo() {
        this.setData({ isShowPlayBtn: false })
        this.data.videoContext.play()
    },
    saveFormId
})
