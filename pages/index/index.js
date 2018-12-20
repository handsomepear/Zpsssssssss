const app = getApp()
const { navigateTo, random } = require('../../utils/utils.js')
const { startRound, getMyRounds } = require('../../server/api')
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
    stopPropagation() {
    },

    toVideoPage() {
        wx.navigateTo({
            url: '/pages/videoPage/videoPage?gameId=' + this.data.gameId
        })
    },
    // 查看某局游戏详情
    viewGameDetail(e) {
        let dataset = e.currentTarget.dataset
        wx.navigateTo({
            // result 0表示已领完，1表示未领完
            url:
                '/pages/result/result?gameId=' +
                dataset.gameId +
                '&openId=' +
                app.globalData.openId +
                '&result=' +
                (dataset.total == dataset.received ? '0' : '1')
        })
    },
    // 发橘子
    startRound() {
        const that = this
        if (!this.data.orangeTotal) {
            wx.showToastWithoutIcon('您没有橘子')
            return
        } else if (!this.data.sendOrangeNum || this.data.sendOrangeNum == 0) {
            wx.showToastWithoutIcon('请至少发送一个橘子')
            return
        } else if (this.data.sendOrangeNum > this.data.orangeTotal) {
            wx.showToastWithoutIcon('您发送橘子数量超过了您橘子的个数')
            return
        }
        // 服务端请求 开启游戏
        startRound(this.data.sendOrangeNum).then(res => {
            if (!app.globalData.gifEnable) {
                wx.navigateTo({
                    url: '/pages/sharePage/sharePage?gameId=' + res.data.id + '&from=index'
                })
            } else {
                // 跳转到视频页
                wx.navigateTo({
                    url: '/pages/videoPage/videoPage?gameId=' + res.data.id + '&from=index'
                })
            }
        })
    }
}

// 生命周期函数（属性值只能为function）
let lifeCycleFunctions = {
    onLoad() {
        const that = this
        getConfigHandle(() => {
            that.setData({
                videoEnable: app.globalData.videoEnable,
                gifUrl: app.globalData.gifUrl
            })
        })
    },
    onShow() {
        let that = this
        this.setData({ isAuthorized: app.globalData.isAuthorized })
        this.getMyRounds()
        getGameUserInfo(() => {
            that.setData({ orangeTotal: app.globalData.gameUserInfo.orangeTotal })
        })
    },
    onHide() {
    }
}

// 开放能力 & 组件相关（属性值只能为function）
let wxRelevantFunctions = {
    onShareAppMessage(e) {
        return {
            title: '我买几个橘子去。你就在此地，不要走动。',
            imageUrl: random(app.globalData.shareImgList),
            path: '/pages/index/index'
        }
    },
    // 授权之后触发
    handleAuthorize(e) {
        this.setData({ isAuthorized: true })
        if (e.detail) {
            wx.navigateTo({ url: e.detail })
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
        isAuthorized: false,
        orangeTotal: 0, // 账户橘子个数
        sendOrangeNum: null, // 发橘子个数
        gameId: null,
        isShowNumInput: false, // 显示真正的输入框
        isShowShareModal: false,
        roundList: [],
        videoEnable: true,
        gifUrl: ''
    },
    // 获取我的游戏记录
    getMyRounds() {
        let that = this
        getMyRounds().then(res => {
            if (that.data.roundList.length === 0) {
                that.setData({ roundList: res.data })
            }
        })
    }
})
