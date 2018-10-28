const app = getApp()

// 事件函数（属性值只能为function）
let eventFunctions = {
    // 选择充值个数
    chooseRemainType(e) {
        this.setData({
            remainTypeIndex: e.currentTarget.dataset.index
        })
    }
}

// 生命周期函数（属性值只能为function）
let lifeCycleFunctions = {
    onLoad() {
        console.log(app.globalData);
        this.setData({remainTypeList: app.globalData.priceList})
    },
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
    }
}

Page({
    ...eventFunctions,
    ...lifeCycleFunctions,
    ...wxRelevantFunctions,
    data: {
        remainTypeList: [],
        remainTypeIndex: 0
    }
})
