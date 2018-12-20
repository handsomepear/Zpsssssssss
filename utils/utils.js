// 不带icon的Toast
wx.showToastWithoutIcon = function(title,  duration = 1500) {
    wx.showToast({
        title: title,
        icon: 'none',
        duration,
        success(){

        }
    })
}

function navigateTo(e) {
    wx.navigateTo({
        url: e.currentTarget.dataset.page
    })
}

// 随机出分享图
function random(list) {
    return list[Math.floor(Math.random() * list.length)]
}

module.exports = {
    navigateTo,
    random
}
