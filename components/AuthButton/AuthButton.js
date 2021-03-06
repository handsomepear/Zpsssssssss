const app = getApp()
const { register } = require('../../server/api')
Component({
    externalClasses: ['auth-btn-init'],
    properties: {
        pageUrl: String
    },
    data: {},
    onReady() {},
    methods: {
        // 授权回调
        handleGetuserinfo(e) {
            const that = this
            console.log(app.globalData.isAuthorized);
            if (!app.globalData.isAuthorized) {
                let userInfo = e.detail.userInfo
                if (userInfo) {
                    wx.setStorageSync('userInfo', userInfo)
                    app.globalData.isAuthorized = true
                    register({
                        nickName: userInfo.nickName,
                        avatar: userInfo.avatarUrl,
                        channel: app.globalData.channel,
                        gender: userInfo.gender
                    }).then(res => {
                        that.triggerEvent('handleAuthorize', that.data.pageUrl)
                        console.log(res.msg);
                    })
                } else {
                    wx.showToastWithoutIcon('拒绝授权')
                    return
                }
            }
            
        },
        saveFormId(e) {
            let formId = e.detail.formId
            console.log(formId)
        }
    }
})
