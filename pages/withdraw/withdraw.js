const app = getApp()
const { updateUserAddr, withdraw } = require('../../server/api')
const { saveFormId } = require('../../server/common')
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
    withdraw() {
        // 如果提现个数不满包邮数 直接提示
        let that = this
        let data = that.data
        // 包邮提现
        console.log(data.withdrawNum)
        if (data.withdrawNum == null) {
            return wx.showToastWithoutIcon('请填写提现橘子个数')
        }
        // if (data.withdrawNum > this.data.orangeTotal) {
        //     return wx.showToastWithoutIcon('您没有这么多橘子')
        // }
        // if (this.data.orangeTotal < this.data.orangeMin) {
        //     return wx.showToastWithoutIcon('橘子余额不足，请充值或者领取好友橘子')
        // }
        // 检测是否有地址
        if (!this.data.addrInfo) {
            // 如果没有地址 直接使用微信地址
            return this.getWxAddress()
        }
        this.setData({ isShowWithdrawModal: true })

        // if (this.data.withdrawType == 0) {
        //     // 提现
        //     withdraw({
        //         withdrawNum: data.withdrawNum,
        //         addr: data.addrInfo.detailInfo,
        //         tel: data.addrInfo.telNumber,
        //         consignee: data.addrInfo.userName
        //     })
        //         .then(res => {
        //             wx.showToastWithoutIcon('提现成功')
        //         })
        //         .catch(err => {
        //             wx.showToastWithoutIcon('提现失败')
        //         })
        // } else if (this.data.withdrawType == 1) {
        //     // 自费邮费提现
        //     // 自付邮费的 需要 判断提现橘子 是否超过橘子总额
        //     withdraw({
        //         withdrawNum: data.withdrawNum,
        //         addr: data.addrInfo.detailInfo,
        //         tel: data.addrInfo.telNumber,
        //         consignee: data.addrInfo.userName
        //     })
        //         .then(res => {
        //             wx.showToastWithoutIcon('提现成功')
        //         })
        //         .catch(err => {
        //             wx.showToastWithoutIcon('提现失败')
        //         })
        // }
        // 最后才提现
    },
    toggleConfirmAddress() {
        this.setData({ isConfirmAddress: !this.data.isConfirmAddress })
    },
    setAddress(e) {
        this.saveFormId(e)
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
            // 添加地址到服务端
            updateUserAddr(
                `${addrInfo.userName} ${addrInfo.telNumber} ${addrInfo.region[0]} ${addrInfo.region[1]} ${
                    addrInfo.region[2]
                } ${addrInfo.detailInfo}`
            ).then(res => {
                that.setData({
                    addrInfo: {
                        userName: addrInfo.userName,
                        telNumber: addrInfo.telNumber,
                        detailInfo: addrInfo.detailInfo.replace(/\s+/g, '')
                    },
                    region: addrInfo.region
                })
            })
            this.closeAddressPanel()
        }
        if (!flag) {
            wx.showToastWithoutIcon(warn)
        }
    },
    // 改变提现类型
    chooseWithDrawType(e) {
        this.setData({ withdrawType: e.detail.value })
    },
    // 隐藏提现类型弹窗
    closeWithdrawModal() {
        this.setData({ isShowWithdrawModal: false })
    }
}

// 生命周期函数（属性值只能为function）
let lifeCycleFunctions = {
    onLoad() {
        let addrArr = app.globalData.gameUserInfo.addr.split(' ')
        this.setData({
            region: [addrArr[2], addrArr[3], addrArr[4]],
            addrInfo: {
                userName: addrArr[0],
                telNumber: addrArr[1],
                detailInfo: addrArr[5]
            },
            orangeMin: app.globalData.orangeMin,
            postage: app.globalData.postage
        })
        wx.loadFontFace({
            family: 'xiawucha',
            source: 'url("https://orange.geinigejuzichi.top/font.ttf")',
            success() {
                console.log('字体加载完毕')
            }
        })
    },
    onShow() {
        this.setData({ orangeTotal: app.globalData.gameUserInfo.orangeTotal })
        // 如果橘子总数小于提现个数 直接默认自费包邮
        // if (this.data.orangeTotal < app.globalData.orangeMin) {
        //     this.setData({ withdrawType: '1' })
        // } else {
        //     this.setData({
        //         withdrawType: '0',
        //         withdrawNum: app.globalData.orangeMin
        //     })
        // }
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
    getWxAddress() {
        const that = this
        wx.chooseAddress({
            success(addrInfo) {
                that.setData({
                    isShowAddrPanel: true,
                    hasAddrInfo: true,
                    region: [addrInfo.provinceName, addrInfo.cityName, addrInfo.countyName],
                    addrInfo: {
                        userName: addrInfo.userName,
                        telNumber: addrInfo.telNumber,
                        detailInfo: addrInfo.detailInfo
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
        orangeTotal: '',
        isAuth: app.globalData.isAuthorized,
        orangeMin: app.globalData.orangeMin, // 最少提现橘子个数
        postage: app.globalData.postage,
        isShowAddrPanel: false, // 控制地址弹窗是否显示
        withdrawType: '0', // 提现橘子类型
        withdrawNum: null, // 提现橘子个数
        hasAddrInfo: false,
        isConfirmAddress: false,
        addrInfo: null,
        region: [],
        isShowWithdrawModal: false
    },
    updateUserAddr(addr) {
        updateUserAddr(addr).then(res => {})
    },
    saveFormId
})
