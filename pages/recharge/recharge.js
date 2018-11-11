const app = getApp()
const { rechargeOrange } = require('../../server/api')
const { getConfigHandle, getGameUserInfo, saveFormId } = require('../../server/common')

// 事件函数（属性值只能为function）
let eventFunctions = {
    // 选择充值个数
    chooseRemainType(e) {
        this.setData({
            remainTypeIndex: e.currentTarget.dataset.index
        })
    },
    // 充值
    rechargeOrange() {
        let that = this
        rechargeOrange({
            amount: that.data.remainTypeList[that.data.remainTypeIndex].price * 100,
            detail: '充值',
            priceId: that.data.remainTypeList[that.data.remainTypeIndex].id
        }).then(res => {
            console.log(res);
            wx.requestPayment({
                timeStamp: res.data.timeStamp,
                nonceStr: res.data.nonce_str,
                signType: 'MD5',
                package: res.data.prepay_id,
                paySign: res.data.sign
            })
        })
    }
}

// 生命周期函数（属性值只能为function）
let lifeCycleFunctions = {
    onLoad() {
        let that = this
        getConfigHandle(() => {
            that.setData({ remainTypeList: app.globalData.priceList })
        })
    },
    onShow() {
        let that = this
        getGameUserInfo(() => {
            that.setData({ orangeTotal: app.globalData.gameUserInfo.orangeTotal })
        })
    },
    onHide() {}
}

// 开放能力 & 组件相关（属性值只能为function）
let wxRelevantFunctions = {
    onShareAppMessage() {},
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
        remainTypeIndex: 0,
        orangeTotal: null
    },
    saveFormId
})
