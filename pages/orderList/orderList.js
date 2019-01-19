
const { getMyWithdraw } = require('../../server/api')

Page({
    data: {
        orderList:[]
    },
    onLoad() {
        const that = this
        wx.showLoading()
        getMyWithdraw().then(res => {
            wx.hideLoading()
            that.setData({ orderList: res.data })
        }).catch(err => {
            wx.hideLoading()
            wx.showToastWithoutIcon('网络错误，请稍后重试')
        })
    }
})