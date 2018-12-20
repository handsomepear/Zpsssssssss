const app = getApp()
const { rechargeOrange, getUserInfo } = require('../../server/api')
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
        const that = this
        const data = that.data
        if (data.canPay) {
            that.setData({ canPay: false })
            rechargeOrange({
                amount: that.data.remainTypeList[that.data.remainTypeIndex].price,
                detail: '充值',
                priceId: that.data.remainTypeList[that.data.remainTypeIndex].id
            })
                .then(res => {
                    console.log(res)
                    wx.requestPayment({
                        timeStamp: res.data.timeStamp + '',
                        nonceStr: res.data.nonceStr,
                        signType: res.data.signType,
                        package: res.data.package,
                        paySign: res.data.paySign,
                        success() {
                            setTimeout(() => {
                                getUserInfo()
                                    .then(res => {
                                        app.globalData.gameUserInfo.orangeTotal = res.data.orange
                                        app.globalData.gameUserInfo.addr = res.data.addr
                                        that.setData({ orangeTotal: app.globalData.gameUserInfo.orangeTotal })
                                        wx.navigateBack() // 返回首页
                                    })
                                    .catch(err => {
                                        // console.log(err);
                                    })
                            }, 1000)
                        },
                        fail() {
                            wx.showToastWithoutIcon('充值失败')
                        },
                        complete() {
                            that.setData({ canPay: true })
                        }
                    })
                })
                .catch(err => {
                    wx.showToastWithoutIcon(err.msg)
                    that.setData({ canPay: true })
                })
        }
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
    onHide() {
    }
}

// 开放能力 & 组件相关（属性值只能为function）
let wxRelevantFunctions = {
    onShareAppMessage() {
    },
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
        orangeTotal: null,
        canPay: true
    },
    saveFormId
})
