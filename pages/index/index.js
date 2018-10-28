const app = getApp()
const { navigateTo } = require('../../utils/utils.js')
// const { getConfig } = require('../../server/api')
// 事件函数（属性值只能为function）
let eventFunctions = {
    navigateTo: navigateTo
}

// 生命周期函数（属性值只能为function）
let lifeCycleFunctions = {
    onLoad() {
        
    },
    onShow() {
        console.log(app.globalData);
        this.setData({
            orange: app.globalData.gameUserInfo.orange
        })
    },
    onHide() {}
}

// 开放能力 & 组件相关（属性值只能为function）
let wxRelevantFunctions = {
    onShareMessage() {},
    // 授权之后触发
    handleAuthorize(e) {
        this.setData({ isAuth: true })
        if (e.detail) {
            wx.navigateTo({ url: e.detail })
        }
    },
    saveFormId(e) {
        let formId = e.detail.formId
    }
}

Page({
    ...eventFunctions, // 放到上面 避免覆盖Page里面的内容
    ...lifeCycleFunctions,
    ...wxRelevantFunctions,
    name: 'index',
    data: {
        isAuth: app.globalData.isAuthorized,
        orange: 0
    }
})
