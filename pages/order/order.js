const app = getApp();
const token = app.token.token;
const localhost = app.localhost.localhost;
const appid = app.appid.appid;
var util = require('../../utils/util.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        icon: [
            { url: "../../images/icon/waitting-pay2.png", text: "待付款" },
            { url: '../../images/icon/waitting-send.png', text: "待发货" },
            { url: '../../images/icon/wait.png', text: "待收货" },
            { url: '../../images/icon/success.png', text: "已完成" },
        ],
        icon2: [
            { url: "../../images/icon/waitting-pay2.png" },
            { url: "../../images/icon/waitting-send2.png" },
            { url: "../../images/icon/wait2.png" },
            { url: "../../images/icon/success2.png" },
        ],
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        hasuserInfo: false,
        unindex: 0
    },
    address: function () {
        var that = this;
        wx.chooseAddress({
            success: function (res) {
                that.setData({
                    userName: res.userName,
                    telNumber: res.telNumber,
                    address: res.provinceName + res.cityName + res.countyName + res.detailInfo + res.nationalCode,
                })
            },
            fail: function () {
                wx.showModal({
                    title: '提醒',
                    content: '取消将无法获取收货地址！'
                })
            }
        })
    },
    link: function (e) {
        wx.showLoading({
            title: '加载中',
        })
        const that = this;
        const index = e.target.dataset.index;
        this.setData({
            icon: [
                { url: "../../images/icon/waitting-pay.png", text: "待付款" },
                { url: '../../images/icon/waitting-send.png', text: "待发货" },
                { url: '../../images/icon/wait.png', text: "待收货" },
                { url: '../../images/icon/success.png', text: "已完成" },
            ]
        })
        let icon_ = that.data.icon;
        icon_[index].url = that.data.icon2[index].url
        this.setData({
            icon: icon_,
            unindex: index
        })
        this.setCons(index);
        wx.hideLoading();
    },
    getInfo: function (e) {
        console.log(e)
        this.setData({
            avatarUrl: e.detail.userInfo.avatarUrl,
            nickName: e.detail.userInfo.nickName,
            hasuserInfo: true
        })
    },
    pay: function (e) {
        const that = this;
        const index = e.target.dataset.index;
        const id = e.target.dataset.id;
        const openid = wx.getStorageSync('openid');
        let cons_ = that.data.cons;
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
                        wx.request({
                            url: localhost + '/pay/do',
                            data: {
                                appId: appid,
                                body: "禾才商务-服装",
                                mchId: "1487862802",
                                openId: openid,
                                ip: that.data.IP,
                                total_fee: 1,
                                session_key: session_key,
                                key1: "hecaishangwu1234hecaishangwu1234",
                                sellerId: token
                            },
                            success: function (res) {
                                const content = res.data[0];
                                console.log(content)
                                wx.requestPayment({
                                    timeStamp: content.timeStamp,
                                    nonceStr: content.nonceStr,
                                    package: content.package,
                                    signType: 'MD5',
                                    paySign: content.paySign,
                                    success: function (res) {
                                        wx.request({
                                            url: localhost + "/order/changeState",
                                            data: {
                                                oid: id,
                                                state: "待发货订单",
                                                sellerId: token
                                            },
                                            success: function () {
                                                cons_.splice(index, 1)
                                                const cons = cons_;
                                                that.setData({
                                                    cons: cons
                                                })
                                            }
                                        })
                                    },
                                    fail: function (res) {
                                        if (res.errMsg !== "requestPayment:fail cancel") {
                                            wx.showModal({
                                                title: '提示',
                                                content: res.err_desc,
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

    cancle: function (e) {
        const that = this;
        const index = e.target.dataset.index;
        const id = e.target.dataset.id;
        const openid = wx.getStorageSync('openid');
        let cons_ = that.data.cons;
        wx.request({
            url: localhost + '/order/del',
            data: {
                openId: openid,
                id: id
            },
            success: function (res) {
                cons_.splice(index, 1)
                const cons = cons_;
                that.setData({
                    cons: cons
                })
            }
        })
    },
    hint: function () {
        wx.showModal({
            title: '提示',
            content: '已提醒买家',
        })
    },
    sure: function (e) {
        const that = this;
        const index = e.target.dataset.index;
        const id = e.target.dataset.id;
        let cons_ = that.data.cons;
        wx.request({
            url: localhost + '/order/changeState',
            data: {
                oid: id,
                state: "已完成订单",
                sellerId: token
            },
            success: function (res) {
                console.log(res)
                cons_.splice(index, 1)
                const cons = cons_;
                that.setData({
                    cons: cons
                })
            }
        })
    },
    delet: function (e) {
        const that = this;
        const index = e.target.dataset.index;
        const id = e.target.dataset.id;
        console.log(id)
        const openid = wx.getStorageSync('openid');
        let cons_ = that.data.cons;
        wx.request({
            url: localhost + '/order/cancel',
            data: {
                id: id,
                openId: openid,
                sellerId: token
            },
            success: function (res) {
                console.log(res)
                cons_.splice(index, 1)
                const cons = cons_;
                that.setData({
                    cons: cons
                })
            }
        })
    },
    copy:function(e){
        const dcode = e.target.dataset.id;
        console.log(e.target.dataset.id);
        wx.setClipboardData({
            data: dcode,
            success:function(res){
                wx.showToast({
                    title: '复制成功！',
                })
            }
        })
    },
    setCons: function (index) {
        const that = this;
        const cons = [];
        const openid = wx.getStorageSync('openid');
        const getstatus = util.getstatus(index, localhost, openid, token, function (data) {
            console.log(data)
            if (data.length >= 1) {
                for (let i = 0; i < data.length; i++) {
                    let imgurl = data[i].products[0].indexImages.split(",")[0];
                    let con = data[i].products[0].pname;
                    let color = data[i].produtsTypes[0].color;
                    let size = data[i].produtsTypes[0].size;
                    let priceNew = data[i].produtsTypes[0].priceNew;
                    let id = data[i].id;
                    let dname = data[i].deliver.dname;
                    let dcode = data[i].deliver.dcode;
                    let orderCode = data[i].orderCode;
                    let createDate = data[i].createDate
                    cons.push({ imgurl: imgurl, con: con, color: color, size: size, priceNew: priceNew, id: id, dname: dname, dcode: dcode, orderCode: orderCode, createDate: createDate })
                }
                that.setData({
                    cons: cons
                })
            } else {
                that.setData({
                    cons: cons
                })
            }
            // console.log(cons)

        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showLoading({
            title: '加载中',
        })
        const that = this;
        app.getUserInfo(function (data) {
            console.log(data);
            that.setData({
                avatarUrl: data.avatarUrl,
                nickName: data.nickName,
                hasuserInfo: true
            })
            wx.hideLoading()
        })
        util.GetIP(function (ip) {
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
        const that = this;
        const cons = [];
        const openid = wx.getStorageSync('openid');
        const getstatus = util.getstatus(0, localhost, openid, token, function (data) {
            console.log(data);
            for (let i = 0; i < data.length; i++) {
                let imgurl = data[i].products[0].indexImages.split(",")[0];
                let con = data[i].products[0].pname;
                let color = data[i].produtsTypes[0].color;
                let size = data[i].produtsTypes[0].size;
                let priceNew = data[i].produtsTypes[0].priceNew;
                let id = data[i].id;
                cons.push({ imgurl: imgurl, con: con, color: color, size: size, priceNew: priceNew, id: id })
            }
            that.setData({
                cons: cons
            })
        });
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