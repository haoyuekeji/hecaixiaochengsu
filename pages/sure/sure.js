const app = getApp();
const localhost = app.localhost.localhost;
const token = app.token.token;
const appid = app.appid.appid;
const getstring = require('../../utils/util.js');
Page({
    /**
     * 页面的初始数据
     */
    data: {
        priceAll: "0.00",
        worder_number: 0,
        deliver_price_hidden: false
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
                                    success: function () {
                                        wx.chooseAddress({
                                            success: function (res) {
                                                that.setData({
                                                    userName: res.userName,
                                                    telNumber: res.telNumber,
                                                    address: res.provinceName + res.cityName + res.countyName + res.detailInfo, nationalCode: res.nationalCode, provinceName: res.provinceName
                                                })
                                            }
                                        })
                                    }
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
                                address: res.provinceName + res.cityName + res.countyName + res.detailInfo, nationalCode: res.nationalCode, provinceName: res.provinceName
                            })
                        }
                    })
                }
            }
        })
    },
    save: function (e) {
        this.setData({
            leaveMessage: e.detail.value
        })
    },
    input: function (e) {
        this.setData({
            worder_number: e.detail.cursor
        })
    },
    pay: function () {
        const that = this;
        const orderlist = [];
        const openid = wx.getStorageSync('openid');
        const total_fee = (that.data.priceAll + that.data.deliver_price) * 100;
        const deliver_price = that.data.deliver_price;
        let leaveMessage = '';
        that.data.leaveMessage === undefined ? leaveMessage = '' : leaveMessage = that.data.leaveMessage;
        if (openid === undefined) {
            wx.showModal({
                title: '提示',
                content: '无法获取去您的个人信息，请到个人中心点击设置按钮进行设置',
            })
            return false
        } else if (total_fee === undefined) {
            wx.showModal({
                title: '提示',
                content: '网络错误，请退出后重试',
            })
            return false
        }
        wx.showLoading({
            title: '加载中',
        })
        wx.request({
            url: 'https://wxapp.edeyun.cn/fujun/ip.php',
            success: function (e) {
                const IP = e.data;
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
                                if (that.data.telNumber === undefined) {
                                    wx.showModal({
                                        title: '提示',
                                        content: '无法获取收货地址，请点击确定进行授权！',
                                        success: function (res) {
                                            if (res.confirm) {
                                                wx.openSetting({
                                                    success: function () {
                                                        wx.chooseAddress({
                                                            success: function (res) {
                                                                that.setData({
                                                                    userName: res.userName,
                                                                    telNumber: res.telNumber,
                                                                    address: res.provinceName + res.cityName + res.countyName + res.detailInfo, nationalCode: res.nationalCode, provinceName: res.provinceName
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            } else if (res.cancel) {
                                                return false
                                            }
                                        }
                                    })
                                    return false
                                }

                                for (let i = 0; i < payList.length; i++) {

                                    wx.request({
                                        url: localhost + "/order/save",
                                        data: {
                                            proId: payList[i].pid,
                                            proTypeId: payList[i].productId,
                                            amount: payList[i].nums,
                                            openId: openid,
                                            phone: that.data.telNumber,
                                            receiver: that.data.userName,
                                            address: that.data.address,
                                            leaveMessage: leaveMessage,
                                            sellerId: token,
                                            deliver_price: deliver_price
                                        },
                                        success: function (res) {
                                            orderlist.push(res.data.data.id);
                                        },
                                        fail: function () {

                                        }
                                    })
                                }

                                wx.request({
                                    url: localhost + '/pay/do',
                                    data: {
                                        appId: appid,
                                        body: "禾才商务-服装",
                                        mchId: "1487862802",
                                        openId: openid,
                                        ip: IP,
                                        total_fee: total_fee,
                                        session_key: session_key,
                                        key1: "hecaishangwu1234hecaishangwu1234",
                                        sellerId: token
                                    },
                                    success: function (res) {
                                        wx.hideLoading();
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
                                                    });
                                                    if (l === orderlist.length - 1) {
                                                        wx.switchTab({
                                                            url: '../order/order'
                                                        })
                                                    }
                                                }
                                            },
                                            fail: function (res) {
                                                if (res.errMsg !== "requestPayment:fail cancel") {
                                                    wx.showModal({
                                                        title: '提示',
                                                        content: res.errMsg.split(':')[1],
                                                    });
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
            fail: function (res) {
                wx.showModal({
                    title: '提示',
                    content: '网络或服务器故障，请稍后再试！',
                })
            }
        })
    },
    deliverPrice: function () {
        const paylist = this.data.paylist;
        const that = this;
        const provinceName = that.data.provinceName;
        let deliverPrice_nums = 0
        let deliverPrice_price = 0
        const deliverPrice_price_all = []
        paylist.forEach(function (val, key) {
            deliverPrice_nums += val.nums
        })
        for (let i = 0; i < paylist.length; i++) {
            if (paylist[i].dname !== null && paylist[i].dname !== '') {
                wx.request({
                    url: localhost + '/deliver/getTemplate',
                    data: {
                        sellerId: token,
                        dname: paylist[i].dname
                    },
                    success: function (res) {
                        if (res.data.message === "信息不存在") {
                            deliverPrice_price_all.push(0)
                            Math.max.apply(null, deliverPrice_price_all) === 0 ?
                                that.setData({
                                    deliver_price: Math.max.apply(null, deliverPrice_price_all),
                                    deliverprice: Math.max.apply(null, deliverPrice_price_all).toFixed(2),
                                    deliver_price_hidden: false
                                }) : that.setData({
                                    deliver_price: Math.max.apply(null, deliverPrice_price_all),
                                    deliverprice: Math.max.apply(null, deliverPrice_price_all).toFixed(2),
                                    deliver_price_hidden: true
                                })
                        } else {
                            const provinceName = that.data.provinceName
                            const content = res.data.data
                            for (let k = 1; k < content.length; k++) {
                                let destination = content[k].destination.split('，');
                                for (let j = 0; j < destination.length; j++) {
                                    if (provinceName === destination[j]) {
                                        content[k].account > deliverPrice_nums ? deliverPrice_price = content[k].price :
                                            deliverPrice_price = content[k].price + (deliverPrice_nums - content[k].account) * (content[k].more_price / content[k].more_account)
                                        deliverPrice_price_all.push(deliverPrice_price)
                                        Math.max.apply(null, deliverPrice_price_all) === 0 ?
                                            that.setData({
                                                deliver_price: Math.max.apply(null, deliverPrice_price_all),
                                                deliverprice: Math.max.apply(null, deliverPrice_price_all).toFixed(2),
                                                deliver_price_hidden: false
                                            }) : that.setData({
                                                deliver_price: Math.max.apply(null, deliverPrice_price_all),
                                                deliverprice: Math.max.apply(null, deliverPrice_price_all).toFixed(2),
                                                deliver_price_hidden: true
                                            })
                                        return false
                                    } else {
                                        content[0].account > deliverPrice_nums ? deliverPrice_price = content[0].price :
                                            deliverPrice_price = content[0].price + (deliverPrice_nums - content[0].account) * (content[0].more_price / content[0].more_account)
                                        deliverPrice_price_all.push(deliverPrice_price)
                                        Math.max.apply(null, deliverPrice_price_all) === 0 ?
                                            that.setData({
                                                deliver_price: Math.max.apply(null, deliverPrice_price_all),
                                                deliverprice: Math.max.apply(null, deliverPrice_price_all).toFixed(2),
                                                deliver_price_hidden: false
                                            }) : that.setData({
                                                deliver_price: Math.max.apply(null, deliverPrice_price_all),
                                                deliverprice: Math.max.apply(null, deliverPrice_price_all).toFixed(2),
                                                deliver_price_hidden: true
                                            })
                                    }
                                }
                            }
                        }
                    }
                })
            } else {
                deliverPrice_price_all.push(0)
                Math.max.apply(null, deliverPrice_price_all) === 0 ?
                    that.setData({
                        deliver_price: Math.max.apply(null, deliverPrice_price_all),
                        deliverprice: Math.max.apply(null, deliverPrice_price_all).toFixed(2),
                        deliver_price_hidden: false
                    }) : that.setData({
                        deliver_price: Math.max.apply(null, deliverPrice_price_all),
                        deliverprice: Math.max.apply(null, deliverPrice_price_all).toFixed(2),
                        deliver_price_hidden: true
                    })
            }
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const paylist = JSON.parse(options.paylist);
        this.setData({
            paylist: paylist,
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
                                    success: function () {
                                        wx.chooseAddress({
                                            success: function (res) {
                                                that.setData({
                                                    userName: res.userName,
                                                    telNumber: res.telNumber,
                                                    address: res.provinceName + res.cityName + res.countyName + res.detailInfo, nationalCode: res.nationalCode, provinceName: res.provinceName
                                                })
                                            }
                                        })
                                    }
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
                                address: res.provinceName + res.cityName + res.countyName + res.detailInfo, nationalCode: res.nationalCode, provinceName: res.provinceName
                            })
                        }, fail: function () {
                            wx.showModal({
                                title: '提示',
                                content: '无法获取你的收货地址，请点击确定进行授权！',
                                success: function (res) {
                                    if (res.confirm) {
                                        wx.openSetting({
                                            success: function () {
                                                wx.chooseAddress({
                                                    success: function (res) {
                                                        that.setData({
                                                            userName: res.userName,
                                                            telNumber: res.telNumber,
                                                            address: res.provinceName + res.cityName + res.countyName + res.detailInfo, nationalCode: res.nationalCode, provinceName: res.provinceName

                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    })
                }
            }
        })
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
        let i = -1;
        let stu = 0;
        let set = setInterval(function () {
            if (i < paylist.length - 1 && stu === 0) {
                i++;
                stu = 1;
                wx.request({
                    url: localhost + '/seller/pro/findOne',
                    data: {
                        pid: paylist[i].pid,
                        token: token
                    },
                    success: function (res) {
                        let content = res.data.data;
                        payList.push({ nums: paylist[i].nums, productId: paylist[i].productId, pid: paylist[i].pid, imgurl: content.indexImages.split(",")[0], con: content.pname });
                        for (let k = 0; k < content.produtsTypes.length; k++) {
                            if (paylist[i].productId === content.produtsTypes[k].id) {
                                payList[i].priceNew = content.produtsTypes[k].discountPrice.toFixed(2);
                                payList[i].dname = content.dname;
                                content.produtsTypes[k].priceNew === null ? payList[i].priceOld = "" : payList[i].priceOld = content.produtsTypes[k].priceNew;
                            }
                        }
                        priceAll += (payList[i].priceNew - 0) * (paylist[i].nums - 0)
                        that.setData({
                            payList: payList,
                            priceAll: priceAll.toFixed(2)
                        })
                        stu = 0;
                        i === paylist.length - 1 ? clearInterval(set) : ''
                    }
                })
            }

        }, 1)
        this.deliverPrice()
        wx.hideLoading();
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