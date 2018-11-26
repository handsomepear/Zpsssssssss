const app = getApp()
const { updateUserAddr, withdraw, getUserInfo } = require('../../server/api')
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
        var money = 0 // 默认包邮
        var type = 0 // 默认包邮
        var withdrawNum = data.withdrawNum
        var realReceiveNum = 0
        const orangeMin = data.orangeMin
        const orangeTotal = data.orangeTotal
        wx.showLoading()
        // 方案1 包邮提现
        if (data.withdrawType == 0) {
            if (withdrawNum >= orangeMin) {
                realReceiveNum = withdrawNum
            } else {
                // 提现个数 = 余额 < 包邮个数 & // 提现个数  < 余额 < 包邮个数
                if (withdrawNum <= orangeTotal && orangeTotal < orangeMin) {
                    type = 1
                }
                if (withdrawNum <= orangeTotal && orangeTotal >= orangeMin) {
                    type = 0
                }
                money = data.withdrawData.noPostagePrice * 100
                realReceiveNum = orangeMin
            }
        }
        // 方案2  自付邮费提现
        if (data.withdrawType == 1) {
            money = data.withdrawData.postagePrice * 100
            type = 2
            realReceiveNum = withdrawNum
        }
        // 提现接口
        if (data.canWithdraw) {
            data.canWithdraw = false
            withdraw({
                withdrawNum: realReceiveNum, // 实际到手的数量
                addr: data.addrInfo.detailInfo,
                tel: data.addrInfo.telNumber,
                consignee: data.addrInfo.userName,
                money: money,
                orangeAccount: data.orangeTotal,
                type: type
            })
                .then(res => {
                    // 不用补费用
                    getUserInfo()
                        .then(res => {
                            app.globalData.gameUserInfo.orangeTotal = res.data.orange
                            app.globalData.gameUserInfo.addr = res.data.addr
                            that.setData({
                                orangeTotal: app.globalData.gameUserInfo.orangeTotal,
                                isShowWithdrawModal: false,
                                withdrawNum: null,
                                canWithdraw: true
                            })
                            wx.hideLoading()
                            wx.showToastWithoutIcon('提现成功')
                        })
                        .catch(err => {
                            that.setData({
                                canWithdraw: true
                            })
                            console.log(err)
                        })
                })
                .catch(res => {
                    if (res.result == 200) {
                        // 须支付
                        wx.hideLoading()
                        wx.requestPayment({
                            timeStamp: String(res.data.timeStamp),
                            nonceStr: res.data.nonceStr,
                            package: res.data.package,
                            signType: 'MD5',
                            paySign: res.data.paySign,
                            success() {
                                getUserInfo()
                                    .then(res => {
                                        app.globalData.gameUserInfo.orangeTotal = res.data.orange
                                        app.globalData.gameUserInfo.addr = res.data.addr
                                        that.setData({
                                            orangeTotal: app.globalData.gameUserInfo.orangeTotal,
                                            isShowWithdrawModal: false,
                                            withdrawNum: null,
                                            canWithdraw: true
                                        })
                                    })
                                    .catch(err => {
                                        that.setData({
                                            canWithdraw: true
                                        })
                                        console.log(err)
                                    })
                            },
                            fail() {
                                that.setData({
                                    canWithdraw: true
                                })
                                wx.showToastWithoutIcon('取消支付')
                            }
                        })
                    } else {
                        that.setData({
                            isShowWithdrawModal: false,
                            canWithdraw: true
                        })
                        wx.hideLoading()
                        wx.showToastWithoutIcon('好像出了点问题，请稍后重试')
                    }
                })
        }
    },
    // 根据用户输入的橘子个数生成方案数据
    count() {
        const that = this
        const data = that.data
        if (data.withdrawNum === null || data.withdrawNum.trim() === '') {
            return wx.showToastWithoutIcon('请至少提现一个橘子')
        }
        if (data.withdrawNum > data.orangeTotal) {
            return wx.showToastWithoutIcon('您没有这么多橘子')
        }
        if (!data.addrInfo) {
            // 如果没有地址 直接使用微信地址
            return this.getWxAddress()
        }

        var diff = data.orangeMin - data.withdrawNum
        
        if (diff > 0 && data.orangeTotal < data.orangeMin) {
            // 提现 <= 余额 < 包邮数量
            diff = data.orangeMin - data.orangeTotal
            data.withdrawData.noPostagePrice = this.reckonMoneyByOrange(data.orangeMin - data.orangeTotal) / 100
        }
        data.withdrawData.diff = diff
        data.withdrawData.postagePrice = this.rekonPostageByOrange(data.withdrawNum)
        data.isShowWithdrawModal = true
        data.withdrawType = 0
        that.setData(data)
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
        isShowWithdrawModal: false, // 提现方案弹窗
        withdrawData: {
            diff: 0, // 距离包邮还差多少个橘子
            noPostagePrice: 0, // 达到包邮标准的邮费
            postagePrice: 0 // 不包邮的邮费
        },
        canWithdraw: true // 能否点击提现按钮
    },
    /**
     * 根据橘子数量计算邮费
     * @param orange 橘子个数
     */
    rekonPostageByOrange(orange) {
        if (orange <= 20) {
            return 15
        } else {
            if ((orange - 20) % 5 == 0) {
                return ((orange - 20) * 2) / 5 + 15
            } else {
                return Math.ceil((orange - 20) / 5) * 2 + 15
            }
        }
    },

    /**
     * 根据橘子数量计算金额
     */
    reckonMoneyByOrange(diffOrange) {
        var orange = diffOrange
        var money = 0
        var priceList = app.globalData.priceList
        while (orange > 0) {
            for (var i = priceList.length - 1; i >= 0; i--) {
                var priceItem = priceList[i]
                if (orange >= priceItem.amonut) {
                    money += priceItem.price
                    orange -= priceItem.amonut
                    break
                }
            }
            if (orange < priceList[0].amonut) {
                money += (priceList[0].price / priceList[0].amonut) * orange
                orange = 0
            }
        }
        console.log(money)
        return money
    },
    updateUserAddr(addr) {
        updateUserAddr(addr).then(res => {})
    },
    saveFormId
})
