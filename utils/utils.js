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

module.exports = {
    navigateTo
}
