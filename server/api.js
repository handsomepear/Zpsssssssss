const { request } = require('../utils/request')
let fetch = request.fetch.bind(request)
let getServerUrl = request.getServerUrl.bind(request)
module.exports = {
  // 获取配置
  getConfig() {
    return fetch({
      url: getServerUrl('/getConfig'),
      data: { version: '1.0.0' }
    })
  },
  // 用户注册
  register({ nickName, avatar, channel, gender }) {
    return fetch({
      url: getServerUrl('/user/register'),
      data: {
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
      url: getServerUrl('/user/getUserInfo')
    })
  },

  // 更新用户地址
  updateUserAddr(addr) {
    return fetch({
      url: getServerUrl('/user/updateUserAddr'),
      data: { addr }
    })
  },

  // 获取用户收入记录
  getIncome({ page, size = 10 }) {
    return fetch({
      url: getServerUrl('/record/getIncome'),
      data: { page, size }
    })
  },
  // 获取用户支出记录
  getOutcome({ page, size = 10 }) {
    return fetch({
      url: getServerUrl('/record/getOutcome'),
      data: { page, size }
    })
  },
  // 获取当前用户所有发橘子记录
  getMyRounds() {
    return fetch({
      url: getServerUrl('/game/getMyRounds')
    })
  },
  // 发橘子
  startRound(amount) {
    return fetch({
      url: getServerUrl('/game/startRound'),
      data: { amount, slogen: '爸爸给你买了橘子' }
    })
  },
  // 领取橘子
  pullFromRound({ gameId, call }) {
    return fetch({
      url: getServerUrl('/partake/pullFromRound'),
      data: { rid: gameId, call: call || '' } // 某一局的id 和 称呼
    })
  },
  // 获取某一局游戏点信息
  getRound(rid) {
    return fetch({
      url: getServerUrl('/game/getRoundById'),
      data: { rid }
    })
  },
  // 充值 type : 1:买橘子, 2:提现邮费, 3: 凑包邮橘子费用
  rechargeOrange({ amount, priceId, detail }) {
    return fetch({
      url: getServerUrl('/money/pay'),
      data: { amount, detail, priceId, type: 1 }
    })
  },
  // 提现
  withdraw({ withdrawNum, addr, tel, consignee, money, orangeAccount, type }) {
    return fetch({
      url: getServerUrl('/money/withDraw'),
      data: { orange_number: withdrawNum, addr, tel, consignee, money, orange_account: orangeAccount, type }
    })
  },
  // 获取提现列表
  getMyWithdraw() {
    return fetch({
      url: getServerUrl('/withdraw/getMyWithDraw')
    })
  },
  // 上传formid
  saveFormId(formId) {
    return fetch({
      url: getServerUrl('/user/getFormId'),
      data: { formid: formId }
    })
  }
}
