const app = getApp()
const { navigateTo , randomShareImg} = require('../../utils/utils.js')
const { getRound } = require('../../server/api')
const { saveFormId } = require('../../server/common')
// 事件函数（属性值只能为function）
let eventFunctions = {
    navigateTo: navigateTo
}

// 生命周期函数（属性值只能为function）
let lifeCycleFunctions = {
    onLoad(opts) {
        let that = this
        let gameId = opts.gameId
        let shareOpenId = opts.shareOpenId
        let openId = app.globalData.openId
        // 判断是不是自己
        if (shareOpenId) {
            if (shareOpenId == openId) {
                this.setData({ isSelf: true })
            } else {
                this.setData({ isSelf: false })
            }
        } else {
            this.setData({ isSelf: true })
        }
        // // 如果橘子没有被领完
        // if (this.data.isSelf && opts.result == 1) {
        //     this.setData({ hasOrange: false })
        // }
        // 获取某局游戏记录
        getRound(gameId).then(res => {
            that.setData({
                getList: res.data.getList,
                avatar: res.data.owner_avatar,
                nickName: res.data.owner_name,
                currentGameOrange: res.data.orange_total,
                gameId: gameId,
                gameState: res.data.state
            })
        })
    },
    onShow() {},
    onHide() {
       
    },
}

// 开放能力 & 组件相关（属性值只能为function）
let wxRelevantFunctions = {
    onShareAppMessage(e) {
        const that = this
        if(e.from == 'button') {
            return {
                title: '我买几个橘子去。你就在此地，不要走动。',
                imageUrl: randomShareImg(app.globalData.shareImgList),
                path: '/pages/videoPage/videoPage?gameId=' + that.gameId + '&shareOpenId=' + app.globalData.openId
            }
        }
    },
    handleAuthorize() {
        this.setData({
            isAuth: true
        })
        wx.navigateTo({
            url: '/pages/mine/mine'
        })
    }
}
Page({
    ...eventFunctions,
    ...lifeCycleFunctions,
    ...wxRelevantFunctions,
    data: {
        getList: [],
        avatar: '',
        nickName: '',
        currentGameOrange: '',
        isSelf: false,
        hasOrange: true, // 是否已被领取完
        gameId: null,
        gameState: 3, // 3 表示已被领完或者超时 0 表示可分享
    },
    saveFormId
})
