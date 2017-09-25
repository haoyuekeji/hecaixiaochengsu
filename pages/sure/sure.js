const app = getApp();
const localhost = app.localhost.localhost;
const token = app.token.token;
const appid = app.appid.appid;
const getstring = require('../../utils/util.js');
const hexMD5 = require('../../utils/md5.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        priceAll: "0.00"
    },
    address: function () {
        var that = this;
        wx.getSetting({
            success: function (res) {
                if (res.authSetting["scope.address"] === false) {
                    wx.showModal({
                        title: '提示',
                        content: '无法获取你的收货地址，请点击确定进行授权！',
                        success: function (res) {
                            if (res.confirm) {
                                wx.openSetting({

                                })
                            }
                        }
                    })
                } else {
                    wx.chooseAddress({
                        success: function (res) {
                            that.setData({
                                userName: res.userName,
                                telNumber: res.telNumber,
                                address: res.provinceName + res.cityName + res.countyName + res.detailInfo + res.nationalCode,
                            })
                        }
                    })
                }
            }
        })

    },
    pay: function () {
        const that = this;
        const orderlist = [];
        wx.login({
            success: function (res) {
                wx.request({
                    url: localhost + '/customer/getSessionKey',
                    data: {
                        appId: appid,
                        code: res.code,
                        secret: "8bcdb74a9915b5685fa0ec37f6f25b24"
                    },
                    success: function (res) {
                        const session_key = JSON.parse(res.data.data).session_key;
                        const payList = that.data.payList;

                        for (let i = 0; i < payList.length; i++) {
                            wx.request({
                                url: localhost + "/order/save",
                                data: {
                                    proId: payList[i].pid,
                                    proTypeId: payList[i].productId,
                                    amount: payList[i].nums,
                                    openId: that.data.openid,
                                    phone: that.data.telNumber,
                                    receiver: that.data.userName,
                                    address: that.data.address,
                                    leaveMessage: "",
                                    sellerId: token
                                },
                                success: function (res) {

                                    orderlist.push(res.data.data.id);
                                }
                            })

                        }

                        wx.request({
                            url: localhost + '/pay/do',
                            data: {
                                appId: appid,
                                body: "禾才商务-服装",
                                mchId: "1487862802",
                                openId: that.data.openid,
                                ip: that.data.IP,
                                total_fee: that.data.total_fee,
                                session_key: session_key,
                                key1: "hecaishangwu1234hecaishangwu1234",
                                sellerId: token
                            },
                            success: function (res) {
                                const content = res.data[0];
                                wx.requestPayment({
                                    timeStamp: content.timeStamp,
                                    nonceStr: content.nonceStr,
                                    package: content.package,
                                    signType: 'MD5',
                                    paySign: content.paySign,
                                    success: function (res) {
                                        for (let l = 0; l < orderlist.length; l++) {
                                            wx.request({
                                                url: localhost + "/order/changeState",
                                                data: {
                                                    oid: orderlist[l],
                                                    state: "待发货订单",
                                                    sellerId: token
                                                }
                                            })
                                        }
                                    },
                                    fail: function (res) {
                                        if (res.errMsg !== "requestPayment:fail cancel") {
                                            wx.showModal({
                                                title: '提示',
                                                content: res.errMsg.split(':')[1],
                                            })
                                        }
                                        for (let k = 0; k < orderlist.length; k++) {
                                            wx.request({
                                                url: localhost + "/order/changeState",
                                                data: {
                                                    oid: orderlist[k],
                                                    state: "待付款订单",
                                                    sellerId: token
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const paylist = JSON.parse(options.paylist);
        const openid = wx.getStorageSync('openid');
        this.setData({
            paylist: paylist,
            openid: openid
        });
        const that = this;
        wx.getSetting({
            success: function (res) {
                if (res.authSetting["scope.address"] === false) {
                    wx.showModal({
                        title: '提示',
                        content: '无法获取你的收货地址，请点击确定进行授权！',
                        success: function (res) {
                            if (res.confirm) {
                                wx.openSetting({

                                })
                            }
                        }
                    })
                } else {
                    wx.chooseAddress({
                        success: function (res) {
                            that.setData({
                                userName: res.userName,
                                telNumber: res.telNumber,
                                address: res.provinceName + res.cityName + res.countyName + res.detailInfo + res.nationalCode,
                            })
                        }, fail: function () {
                            wx.showModal({
                                title: '提示',
                                content: '无法获取你的收货地址，请点击确定进行授权！',
                                success: function (res) {
                                    if (res.confirm) {
                                        wx.openSetting({
                                        })
                                    }
                                }
                            })
                        }
                    })
                }
            }
        })


        getstring.GetIP(function (ip) {
            that.setData({
                IP: ip
            })
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        wx.showLoading({
            title: '加载中',
        })
        const paylist = this.data.paylist;
        var that = this;
        const payList = [];
        const reslist = [];
        const temlist = [];
        const paytime = [];
        let priceAll = 0;
        for (let i = 0; i < paylist.length; i++) {
            wx.request({
                url: localhost + '/seller/pro/findOne',
                data: {
                    pid: paylist[i].pid,
                    token: token
                },
                success: function (res) {
                    payList.push({ nums: paylist[i].nums, productId: paylist[i].productId, pid: paylist[i].pid });
                    let content = res.data.data;
                    // console.log(content);
                    temlist.push(content);
                    for (let j = 0; j < temlist.length; j++) {
                        let deliverPrice_ = content.deliverPrice - 0;
                        let deliverPrice = deliverPrice_.toFixed(2);
                        payList[j].imgurl = content.indexImages.split(",")[0];
                        payList[j].con = content.pname;
                        payList[j].deliverPrice = deliverPrice;
                        for (let k = 0; k < content.produtsTypes.length; k++) {
                            if (payList[j].productId === content.produtsTypes[k].id) {
                                payList[j].priceNew = content.produtsTypes[k].priceNew;
                                payList[j].priceOld === null ? "" : content.produtsTypes[k].priceOld;
                                paytime.push((payList[j].priceNew - 0) * (paylist[j].nums - 0) + (payList[j].deliverPrice - 0));
                            }
                        }
                    }

                    that.setData({
                        payList: payList,
                        priceAll: priceAll.toFixed(2),
                        total_fee: priceAll * 100
                    })
                    wx.hideLoading();
                }
            })
        }
        console.log(paytime)
        setTimeout(function () {
            wx.hideLoading();
        }, 3000)
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})