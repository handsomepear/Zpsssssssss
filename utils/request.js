let host = 'https://orange.geinigejuzichi.top/wx_api'

let request = {
    host: host,
    clientEnv: {
        openId: wx.getStorageSync('openId'),
        v: '1.0.1'
    }, // 默认参数
    fetch(params) {
        let that = this
        const openId = wx.getStorageSync('openId')
        if (openId) {
            that.clientEnv.openId = openId
            return new Promise((resolve, reject) => {
                wx.request({
                    url: params.url,
                    method: params.method || 'POST',
                    header: { 'content-type': 'application/x-www-form-urlencoded' },
                    data: { openid: openId, ...params.data },
                    dataType: 'json',
                    success(res) {
                        if (res.data.result == 0) {
                            resolve(res.data)
                        } else {
                            // wx.showToastWithoutIcon(res.data.msg)
                            reject(res.data)
                        }
                    },
                    fail(err) {
                        wx.showToastWithoutIcon('网络请求超时，请稍后再试')
                        reject(err)
                    }
                })
            })
        } else {
            return that
                .getOpenId()
                .then(openId => {
                    that.clientEnv.openId = openId
                    wx.setStorageSync('openId', openId)
                    return new Promise((resolve, reject) => {
                        wx.request({
                            url: params.url,
                            method: params.method || 'POST',
                            header: { 'content-type': 'application/x-www-form-urlencoded' },
                            data: { openid: openId, ...params.data },
                            dataType: 'json',
                            success(res) {
                                if (res.data.result == 0) {
                                    resolve(res.data)
                                } else {
                                    // wx.showToastWithoutIcon(res.data.msg)
                                    reject(res.data)
                                }
                            },
                            fail(err) {
                                wx.showToastWithoutIcon('网络请求超时，请稍后再试')
                                reject(err)
                            }
                        })
                    })
                })
        }
    },
    getOpenId() {
        let that = this
        return new Promise((resolve, reject) => {
            wx.login({
                success(res) {
                    const code = res.code
                    wx.request({
                        url: that.getServerUrl('/user/getOpenId'),
                        header: { 'content-type': 'application/x-www-form-urlencoded' },
                        data: {
                            code: code
                        },
                        method: 'POST',
                        success(res) {
                            if (res.data.result == 0) {
                                resolve(res.data.data.openid)
                            } else {
                                console.log(res)
                                reject(res)
                            }
                        },
                        fail(err) {
                            wx.showToastWithoutIcon('网络请求超时，请稍后再试')
                            reject(err)
                        }
                    })
                }
            })
        })
    },
    getServerUrl(path) {
        return this.host + path
    }
}

module.exports = {
    request: request
}
