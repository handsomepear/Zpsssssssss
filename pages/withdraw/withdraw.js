const app = getApp()
const { navigateTo } = require('../../utils/utils')
const { updateUserAddr, withdraw, getUserInfo, rechargeOrange } = require('../../server/api')
const { saveFormId, getConfigHandle } = require('../../server/common')
// 事件函数（属性值只能为function）
let eventFunctions = {
  navigateTo: navigateTo,
  openAddressPanel(e) {
    if(!(e && e.currentTarget.dataset.from === 'button')) {
      this.setData({
        addressFlag: true
      })
    }
    if (!this.data.addrInfo) {
      // 如果没有地址 直接使用微信地址
      this.getWxAddress()
    }
    this.setData({ isShowAddrPanel: true })
  },
  closeAddressPanel() {
    this.setData({ isShowAddrPanel: false, canWithdraw: true, isConfirmAddress: false, addressFlag: false })
  },
  bindRegionChange(e) {
    var that = this
    that.setData({
      region: e.detail.value,
      regionCode: e.detail.code
    })
  },
  chooseRemainType(e) {
    this.setData({
      remainTypeIndex: e.currentTarget.dataset.index
    })
  },
  stopPropagation() {},
  // 橘子提现
  withdraw() {
    const that = this
    const data = that.data
    if (data.orangeTotal < data.orangeMin) {
      return wx.showToastWithoutIcon('您的橘子余额不足' + data.orangeMin + '个', 3000)
    }
    if (!data.addrInfo) {
      // 如果没有地址 直接使用微信地址
      this.setData({ addressFlag: true })
      return that.getWxAddress()
    }

    if (data.canWithdraw) {
      this.openAddressPanel()
    }
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
        `${addrInfo.userName.replace(/\s+/g, '')} ${addrInfo.telNumber} ${addrInfo.region[0]} ${addrInfo.region[1]} ${
          addrInfo.region[2]
        } ${addrInfo.detailInfo.replace(/\s+/g, '')}`
      ).then(res => {
        that.setData({
          addrInfo: {
            userName: addrInfo.userName,
            telNumber: addrInfo.telNumber,
            detailInfo: addrInfo.detailInfo.replace(/\s+/g, '')
          },
          region: addrInfo.region
        })
        if (data.canWithdraw && data.addressFlag) {
          that.setData({
            canWithdraw: false
          })
          withdraw({
            withdrawNum: data.orangeMin, // 实际到手的数量
            addr: data.addrInfo.detailInfo,
            tel: data.addrInfo.telNumber,
            consignee: data.addrInfo.userName,
            money: 0,
            orangeAccount: data.orangeTotal,
            type: 0
          })
            .then(res => {
              // 不用补费用
              getUserInfo()
                .then(res => {
                  app.globalData.gameUserInfo.orangeTotal = res.data.orange
                  app.globalData.gameUserInfo.addr = res.data.addr
                  that.setData({
                    orangeTotal: app.globalData.gameUserInfo.orangeTotal,
                    canWithdraw: true,
                    showWithdrawSuccessModal: true
                  })
                  that.closeAddressPanel()
                  wx.hideLoading()
                  // wx.showToast({
                  //   title: '提现成功',
                  //   icon: 'success',
                  //   duration: 2000
                  // })
                })
                .catch(err => {
                  wx.showToastWithoutIcon(err.msg)
                  that.setData({
                    canWithdraw: true
                  })
                  console.log(err)
                })
            })
            .catch(err => {
              wx.showToastWithoutIcon(err.msg)
              that.setData({
                canWithdraw: true
              })
            })
        }else {
          this.closeAddressPanel()
        }
      })
      
    }
    if (!flag) {
      wx.showToastWithoutIcon(warn)
    }
  },
  // 充值
  rechargeOrange() {
    const that = this
    const data = that.data
    if (data.canPay) {
      if (data.remainTypeIndex === null) {
        return wx.showToastWithoutIcon('请选择充值类型')
      }
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
  },
  // 关闭提现成功通知弹窗
  closeWithdrawSuccessModal() {
    this.setData({
      showWithdrawSuccessModal: false
    })
  }
}

// 生命周期函数（属性值只能为function）
let lifeCycleFunctions = {
  onLoad() {
    let that = this
    let addrArr = []
    if (app.globalData.gameUserInfo.addr) {
      addrArr = app.globalData.gameUserInfo.addr.split(' ')
      this.setData({
        region: [addrArr[2], addrArr[3], addrArr[4]],
        addrInfo: {
          userName: addrArr[0],
          telNumber: addrArr[1],
          detailInfo: addrArr[5]
        }
      })
    }
    this.setData({
      remainTypeList: app.globalData.priceList, // 价格列表
      orangeMin: app.globalData.orangeMin,
      postage: app.globalData.postage
    })
    if (!(this.data.remainTypeList && this.data.remainTypeList.length)) {
      getConfigHandle(() => {
        that.setData({
          remainTypeList: app.globalData.priceList,
          orangeMin: app.globalData.orangeMin,
          postage: app.globalData.postage
        })
      })
    }
  },
  onShow() {
    this.setData({ orangeTotal: app.globalData.gameUserInfo.orangeTotal })
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
  name: 'withdraw',
  data: {
    orangeTotal: '',
    addressFlag: false, // true 修改地址之后要提现 false 表示仅仅修改地址
    orangeMin: 0,
    isAuth: app.globalData.isAuthorized,
    isShowAddrPanel: false, // 控制地址弹窗是否显示
    withdrawNum: null, // 提现橘子个数
    hasAddrInfo: false,
    isConfirmAddress: false,
    remainTypeList: [], // 充值价格
    remainTypeIndex: 0,
    addrInfo: null,
    region: [],
    canWithdraw: true, // 能否点击提现按钮
    canPay: true,
    showWithdrawSuccessModal: false
  },
  /**
   * 根据橘子数量计算邮费
   * @param orange 橘子个数
   */
  reckonPostageByOrange(orange) {
    if (orange <= 20) {
      return 15
    } else {
      if ((orange - 20) % 5 === 0) {
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
    return money
  },
  saveFormId
})
