const {navigateTo} = require('../../utils/utils.js')

// 事件函数（属性值只能为function）
let eventFunctions = {
    navigateTo: navigateTo
}

// 生命周期函数（属性值只能为function）
let lifeCycleFunctions = {
    onLoad() {},
    onShow() {
        
    },
    onHide() {}
}

// 开放能力 & 组件相关（属性值只能为function）
let wxRelevantFunctions = {
    onShareMessage() {},
    handleAuthorize() {
        this.setData({
            isAuth: true
        })
        wx.navigateTo({
            url: '/pages/mine/mine'
        })
    }
}
Page({
    ...eventFunctions,
    ...lifeCycleFunctions,
    ...wxRelevantFunctions,
    data: {}
})