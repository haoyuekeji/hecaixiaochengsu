//app.js
App({
    onLaunch: function () {
        //调用API从本地缓存中获取数据
        var logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)
    },

    getUserInfo: function (cb) {
        var that = this
        //店铺浏览量
        wx.request({
            url: that.localhost.localhost + '/dictionary/addViews',
            data: {
                sellerId: that.token.token
            },
            fail: function (res) {
                wx.showModal({
                    title: '提示',
                    content: '网络信号弱，请稍后再试！',
                })
            }
        });
        wx.login({
            success: function (res) {
                wx.request({
                    url: that.localhost.localhost + '/customer/getSessionKey',
                    data: {
                        appId: that.appid.appid,
                        code: res.code,
                        secret: "8bcdb74a9915b5685fa0ec37f6f25b24"
                    },
                    success: function (res) {
                        const openid = JSON.parse(res.data.data).openid;
                        //店铺访客数
                        wx.request({
                            url: that.localhost.localhost + '/dictionary/addVisitors',
                            data: {
                                openId: openid,
                                sellerId: that.token.token
                            }
                        })
                        wx.setStorageSync("openid", openid)

                        if (that.globalData.userInfo) {
                            typeof cb == "function" && cb(that.globalData.userInfo)
                        } else {
                            //调用登录接口
                            wx.getUserInfo({
                                withCredentials: false,
                                success: function (res) {
                                    const nickName = res.userInfo.nickName
                                    const wxpic = res.userInfo.avatarUrl
                                    //客户首次访问店铺
                                    wx.request({
                                        url: that.localhost.localhost + '/customer/loginOrReg',
                                        data: {
                                            openId: openid,
                                            sellerId: that.token.token,
                                            wxname: nickName,
                                            wxpic: wxpic
                                        }
                                    })
                                    wx.setStorageSync("nickName", nickName)
                                    that.globalData.userInfo = res.userInfo
                                    typeof cb == "function" && cb(that.globalData.userInfo)
                                }
                            })
                        }
                    }
                })
            }
        })
    },
    globalData: {
        userInfo: null,
    },
    localhost: {
        localhost: 'https://www.cslapp.com'
    },
    token: {
        token: 3
    },
    appid: {
        appid: 'wxe46b9aa1b768e5fe'
    }
})
