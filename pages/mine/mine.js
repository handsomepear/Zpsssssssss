const app = getApp()
const { navigateTo } = require('../../utils/utils.js')

// 事件函数
let eventFunctions = {
    chooseTab(e) {
        let currentTab = e.currentTarget.dataset.current
        this.setData({ currentTab })
    },
    swiperChange(e) {
        this.setData({ currentTab: e.detail.current })
    },
    navigateTo: navigateTo
}

// 生命周期函数（属性值只能为function）
let lifeCycleFunctions = {
    onLoad() {
        this.getSystemHeight()
    },
    onShow() {},
    onHide() {}
}

// 开放能力 & 组件相关（属性值只能为function）
let wxRelevantFunctions = {
    onShareMessage() {},
    handleAuthorize() {
        this.setData({
            isAuth: true
        })
    }
}

Page({
    ...eventFunctions, // 放到上面 避免覆盖Page里面的内容
    ...lifeCycleFunctions,
    ...wxRelevantFunctions,
    data: {
        currentTab: 0,
        winHeight: 0
    },
    // 计算设备高度
    getSystemHeight() {
        let that = this
        wx.getSystemInfo({
            success: function(res) {
                var clientHeight = res.windowHeight
                var topHeight = 42
                that.setData({
                    winHeight: clientHeight - topHeight
                })
            }
        })
    }
})
