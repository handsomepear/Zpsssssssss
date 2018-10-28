const { request } = require('../utils/request')
let fetch = request.fetch.bind(request)
let getServerUrl = request.getServerUrl.bind(request)
module.exports = {
    // 获取配置
    getConfig() {
        console.log(request.clientEnv.openId);
        return fetch({
            url: getServerUrl('/getConfig'),
            data: { openId: request.clientEnv.openId },
            method: 'GET'
        })
    },
    // 用户注册
    register({ nickName, avatar, channel, gender }) {
        return fetch({
            url: getServerUrl('/user/register'),
            data: {
                openid: request.clientEnv.openId,
                nickName,
                avatar,
                channel,
                gender
            }
        })
    },
    // 获取用户信息（游戏相关）
    getUserInfo() {
        return fetch({
            url: getServerUrl('/user/getUserInfo'),
        })
    },
    getWaterBills() {
        return fetch({
            url: getServerUrl('/user/getWaterBills'),
            data: {
                openId: request.clientEnv.openId,
                nickName,
                avatar,
                channel,
                gender
            }
        })
    },
    // 发橘子
    startRound(amount) {
        return fetch({
            url: getServerUrl('/game/startRound'),
            data: { amount }
        })
    },
    // 领取橘子
    pullFromRound(rid) {
        return fetch({
            url: getServerUrl('/game/pullFromRound'),
            data: { rid } // 某一局的id
        })
    },
    // 获取某一局游戏点信息
    getRound() {
        return fetch({
            url: getServerUrl('/game/getRound'),
            data: { rid }
        })
    }
}
