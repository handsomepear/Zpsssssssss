const app = getApp()

// 事件函数（属性值只能为function）
let eventFunctions = {
    openAddressPanel() {
        this.setData({ isShowAddrPanel: true })
    },
    closeAddressPanel() {
        this.setData({ isShowAddrPanel: false })
    },
    bindRegionChange(e) {
        var that = this
        that.setData({
            region: e.detail.value,
            regionCode: e.detail.code
        })
    },
    setWithdrawNum(e) {
        this.setData({ withdrawNum: e.detail.value })
    },
    stopPropagation() {},
    // 橘子提现
    // TODO: 检测提现类型 和 提现个数
    widthDraw() {
        if (!this.data.addrInfo) {
            this.getWxAddress()
        }
    },
    toggleConfirmAddress() {
        this.setData({ isConfirmAddress: !this.data.isConfirmAddress })
    },
    setAddress(e) {
        let that = this
        let data = that.data
        let addrInfo = e.detail.value
        let warn = ''
        let flag = false
        let ph = /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/
        let mb = /^(0[0-9]{2,3}\-)([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/
        if (addrInfo.userName == '') {
            warn = '请填写收货人姓名'
        } else if (addrInfo.telNumber == '') {
            warn = '请填写联系方式'
        } else if (!ph.test(addrInfo.telNumber) && !mb.test(addrInfo.telNumber)) {
            warn = '请填写正确的手机/座机号'
        } else if (addrInfo.region.length == 0) {
            warn = '请选择您的所在区域'
        } else if (addrInfo.detailInfo == '') {
            warn = '请填写具体地址'
        } else if (!data.isConfirmAddress) {
            warn = '请确认收货信息'
        } else {
            flag = true
            // FIXME: 添加收货信息到服务端
            this.setData({
                addrInfo: {
                    userName: addrInfo.userName,
                    telNumber: addrInfo.telNumber,
                    region: addrInfo.region,
                    detailInfo: addrInfo.detailInfo
                }
            })
            this.closeAddressPanel()
        }
        if (!flag) {
            wx.showToastWithoutIcon(warn)
        }
    },
    chooseWithDrawType(e) {
        this.setData({ widthDrawType: e.detail.value})
    }
}

// 生命周期函数（属性值只能为function）
let lifeCycleFunctions = {
    onLoad() {},
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
    },
    getWxAddress() {
        const that = this
        wx.chooseAddress({
            success(addrInfo) {
                that.setData({
                    isShowAddrPanel: true,
                    hasAddrInfo: true,
                    addrInfo: {
                        userName: addrInfo.userName,
                        telNumber: addrInfo.telNumber,
                        detailInfo: addrInfo.detailInfo,
                        region: [addrInfo.provinceName, addrInfo.cityName, addrInfo.countyName]
                    }
                })
            },
            fail() {
                that.setData({ isShowAddrPanel: true })
            }
        })
    }
}

Page({
    ...eventFunctions, // 放到上面 避免覆盖Page里面的内容
    ...lifeCycleFunctions,
    ...wxRelevantFunctions,
    name: 'index',
    data: {
        isAuth: app.globalData.isAuthorized,
        isShowAddrPanel: false, // 控制地址弹窗是否显示
        widthDrawType: '0', // 提现橘子类型
        withdrawNum: null, // 提现橘子个数
        hasAddrInfo: false,
        isConfirmAddress: false,
        addrInfo: null
    }
})
