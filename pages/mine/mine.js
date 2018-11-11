const app = getApp()
const { navigateTo } = require('../../utils/utils.js')
const { getWaterBills } = require('../../server/api')

const { saveFormId } = require('../../server/common')

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
    onShow() {
        let that = this
        let getIncomeList = getWaterBills({ type: 5, page: this.data.page, size: this.data.size })
        let getExpenseList = getWaterBills({ type: 2, page: this.data.page, size: this.data.size })
        // 获取收入支出列表
        Promise.all([getIncomeList, getExpenseList]).then(res => {
            that.setData({
                incomeList: res[0].data,
                expenseList: res[1].data
            })
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
    },
    
}

Page({
    ...eventFunctions, // 放到上面 避免覆盖Page里面的内容
    ...lifeCycleFunctions,
    ...wxRelevantFunctions,
    data: {
        currentTab: 0,
        winHeight: 0,
        page: 0,
        size: 10,
        incomeList: [], // 收入列表
        expenseList: [] // 支出列表
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
    },
    // 获取用户支出/消费列表
    getWaterBills(type) {
        return
    },
    saveFormId
})
