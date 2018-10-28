// 不带icon的Toast
wx.showToastWithoutIcon = function(title) {
    wx.showToast({
        title: title,
        icon: 'none'
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
