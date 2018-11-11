const app = getApp()
const { request } = require('../utils/request.js')
const { getConfig, getUserInfo } = require('./api')
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
                    cb && cb()
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
    getGameUserInfo(cb) {
        if (!app.globalData.gameUserInfo.orangeTotal) {
            getUserInfo().then(res => {
                app.globalData.gameUserInfo.orangeTotal = res.data.orange
                app.globalData.gameUserInfo.addr = res.data.addr
                cb && cb()
            }).catch(err => {
                // console.log(err);
            })
        } else {
            cb && cb()
        }
    },
    // 保存formid
    saveFormId(e) {
        console.log(e.detail.formId);
        if (e.detail.fromId && e.detail.formId != 'the formId is a mock one') {
            // saveFormId({
            //     formIds: [e.detail.formId],
            //     openId: app.globalData.openId,
            //     function(res) {}
            // })
        }
    }
}
