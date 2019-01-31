const app = getApp()
const { request } = require('../utils/request.js')
const { getConfig, getUserInfo, saveFormId } = require('./api')

module.exports = {
  // 获取配置信息
  getConfigHandle(cb) {
    if (!app.globalData.postage || !app.globalData.orangeMin) {
      getConfig()
        .then(res => {
          app.globalData.openId = request.clientEnv.openId
          app.globalData.postage = res.data.postage
          app.globalData.orangeMin = res.data.orange_min
          app.globalData.videoUrl = res.data.video_url
          app.globalData.priceList = res.data.price_list
          app.globalData.videoEnable = res.data.enable
          app.globalData.gifUrl = res.data.gif.url
          app.globalData.gifDuration = res.data.gif.duration
          app.globalData.calls = res.data.calls
          app.globalData.gifEnable = res.data.gif.enable
          app.globalData.bannerUrl = res.data.banner_url
          app.globalData.shareMsg = res.data.share_msg
          app.globalData.indexSendBtn = res.data.btn1_value
          ;(app.globalData.shareImgList = res.data.share_img_url), cb && cb()
        })
        .catch(err => {
          // resolve 中代码出错也会进catch语句
          if (err.msg) {
            wx.showToastWithoutIcon(err.msg)
          } else {
            console.log(err)
          }
        })
    } else {
      cb && cb()
    }
  },
  // 获取用户橘子信息
  getGameUserInfo(successCb, failCb) {
    getUserInfo()
      .then(res => {
        app.globalData.gameUserInfo.orangeTotal = res.data.orange
        app.globalData.gameUserInfo.addr = res.data.addr
        successCb && successCb()
      })
      .catch(err => {
        if (err.result === -2) {
          failCb && failCb()
        }
      })
  },
  // 保存formId
  saveFormId(e) {
    console.log(e.detail.formId)
    if (e.detail.formId && e.detail.formId != 'the formId is a mock one') {
      saveFormId(e.detail.formId)
        .then(() => {
          console.log('上传formId成功')
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
}
