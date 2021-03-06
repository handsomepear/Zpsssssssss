const app = getApp()
const { navigateTo } = require('../../utils/utils.js')
const { getIncome, getOutcome } = require('../../server/api')

const { saveFormId } = require('../../server/common')

// 事件函数
let eventFunctions = {
    chooseTab(e) {
        const currentTab = e.currentTarget.dataset.current
        this.setData({ currentTab })
    },
    swiperChange(e) {
        const data = this.data
        this.setData({ currentTab: e.detail.current })
        if (data.currentTab == 0 && data.incomeList.length == 0) {
            this.getIncomeList()
        }
        if (data.currentTab == 1 && data.outcomeList.length == 0) {
            this.getOutcomeList()
        }
    },
    navigateTo: navigateTo
}

// 生命周期函数（属性值只能为function）
let lifeCycleFunctions = {
    onLoad() {
        this.getSystemHeight()
    },
    onShow() {
        this.setData({
            currentTab: 0,
            incomePage: 0,
            outcomePage: 0
        })
        this.getIncomeList()
        // let getIncomeList = getIncome({ page: this.data.page, size: this.data.size })
        // let getOutComeList = getOutcome({ page: this.data.page, size: this.data.size })
        // // 获取收入支出列表
        // Promise.all([getIncomeList, getOutComeList]).then(res => {
        //     console.log(res)
        //     that.setData({
        //         incomeTotal: res[0].data.total,
        //         incomeList: res[0].data.getList,
        //         outcomeTotal: res[1].data.total,
        //         outcomeList: res[1].data.getList
        //     })
        // })
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
    onReachBottom() {
        if (this.data.currentTab == 0) {
            this.getIncomeList()
        } else if (this.data.currentTab == 1) {
            this.getOutcomeList()
        }
    }
}

Page({
    ...eventFunctions, // 放到上面 避免覆盖Page里面的内容
    ...lifeCycleFunctions,
    ...wxRelevantFunctions,
    data: {
        currentTab: 0,
        winHeight: 0,
        incomePage: 0,
        outcomePage: 0,
        size: 10,
        incomeList: [], // 收入列表
        outcomeList: [], // 支出列表
        incomeTotal: 0,
        outcomeTotal: 0,
        hasMoreOutcome: true,
        hasMoreIncome: true
    },
    // 计算设备高度
    getSystemHeight() {
        const that = this
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
    getIncomeList() {
        const that = this
        const data = that.data
        if (data.hasMoreIncome) {
            getIncome({ page: data.incomePage, size: data.size })
                .then(res => {
                    data.incomeTotal = res.data.total
                    if (data.incomePage == 0) {
                        data.incomeList = res.data.getList
                    } else {
                        data.incomeList = data.incomeList.concat(res.data.getList)
                    }
                    if (res.data.getList && res.data.getList.length < data.size) {
                        data.hasMoreIncome = false
                    }
                    data.incomePage = ++data.incomePage
                    that.setData(data)
                })
                .catch(err => {
                    wx.showToastWithoutIcon(err)
                })
        }
    },
    getOutcomeList() {
        const that = this
        const data = that.data
        if (data.hasMoreOutcome) {
            getOutcome({ page: data.outcomePage, size: data.size })
                .then(res => {
                    data.outcomeTotal = res.data.total
                    if (data.outcomePage == 0) {
                        data.outcomeList = res.data.getList
                    } else {
                        data.outcomeList = data.outcomeList.concat(res.data.getList)
                    }
                    if (res.data.getList && res.data.getList.length < data.size) {
                        data.hasMoreOutcome  = false
                    }
                    data.outcomePage = ++data.outcomePage
                    that.setData(data)
                })
                .catch(err => {
                    wx.showToastWithoutIcon(err)
                })
        }
    },
    saveFormId
})
