const app = getApp()
const { navigateTo } = require('../../utils/utils')
const { pullFromRound, register } = require('../../server/api')
const { getConfigHandle, getGameUserInfo, saveFormId } = require('../../server/common')
// 事件函数
let eventFunctions = {
    navigateTo: navigateTo,
    // 领橘子（视频播放完毕之后触发）
    pullFromRound() {
        let that = this
        pullFromRound(this.data.gameId)
            .then(res => {
                var timer = setTimeout(() => {
                    that.setData({ isShowPullResult: true })
                }, 2000)
                that.setData({ timer })
            })
            .catch(err => {
                wx.navigateTo({
                    url: '/pages/result/result?gameId=' + that.data.gameId + '&openId=' + app.globalData.openId + '&shareOpenId=' + that.data.shareOpenId 
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
        let currentTime = Math.round(e.detail.currentTime)
        let d = this.data
        console.log(currentTime)
        switch (currentTime) {
            case 0:
                d.sonName = {
                    left: 220,
                    top: 150
                }
                d.isShowFaterName = false
                d.isShowSonName = true
                break
            case 1:
                d.fatherName = {
                    left: 400,
                    top: 100
                }
                d.isShowFaterName = true
                d.isShowSonName = false
                break
            case 2 || 3:
                d.fatherName = {
                    left: 300,
                    top: 200
                }
                d.sonName = {
                    left: 0,
                    top: 40
                }
                d.isShowFaterName = true
                d.isShowSonName = true
                break
            case 4 || 5 || 6 || 7 || 8 || 9 || 10:
                d.fatherName = {
                    left: 400,
                    top: 50
                }
                d.isShowFaterName = true
                d.isShowSonName = false
                break
            case 11 || 12 || 13:
                d.sonName = {
                    left: 400,
                    top: 0
                }
                d.isShowFaterName = false
                d.isShowSonName = true
                break
            case 14 || 15 || 16 || 17 || 18 || 19 || 20:
                d.sonName = {
                    left: 200,
                    top: 0
                }
                d.isShowFaterName = true
                d.isShowSonName = false
                break

            case 21 || 22:
                d.fatherName = {
                    left: 100,
                    top: 200
                }
                d.sonName = {
                    left: 300,
                    top: 200
                }
                d.isShowFaterName = true
                d.isShowSonName = true
                break
            case 23 || 24:
                d.fatherName = {
                    left: 50,
                    top: 100
                }
                d.sonName = {
                    left: 450,
                    top: 0
                }
                d.isShowFaterName = true
                d.isShowSonName = true
                break
            case 25 || 26:
                d.sonName = {
                    left: 450,
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

// 生命周期函数（属性值只能为function）
let lifeCycleFunctions = {
    onLoad(opts) {
        if (opts.from == 'index') {
            this.setData({
                isShowShareModal: true
            })
        } else {
            this.setData({
                // FIXME: 测试完分享面板之后 改成 false
                isShowShareModal: false
            })
        }
        this.setData({
            shareOpenId: opts.shareOpenId
        })
        getConfigHandle(() => {
            this.setData({
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
        this.setData({ isShowPlayBtn: true, isShowShareModal: false })
    }
}
// 开放能力 & 组件相关（属性值只能为function）
let wxRelevantFunctions = {
    onShareAppMessage(obj) {
        let that = this
        let path = '/pages/videoPage/videoPage'
        if (obj.from == 'button') {
            path = '/pages/videoPage/videoPage?shareOpenId=' + app.globalData.openId + '&gameId=' + that.data.gameId
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
        let that = this
        if (!app.globalData.isAuthorized) {
            let userInfo = e.detail.userInfo
            if (userInfo) {
                wx.setStorageSync('userInfo', userInfo)
                app.globalData.isAuthorized = true
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
        isSelf: true,
        gameId: null,
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
        timer: null
    },
    playVideo() {
        this.setData({ isShowPlayBtn: false })
        this.data.videoContext.play()
    },
    saveFormId
})
