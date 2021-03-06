//index.js
//获取应用实例
var app = getApp();
const localhost = app.localhost.localhost;
const token = app.token.token;
let pageSize = 20;
Page({
    data: {
        userInfo: {},
        indicatorDots: true,
        autoplay: false,
        interval: 3500,
        duration: 1000,
        logo_stu: true
    },
    banner: function (e) {
        const that = this
        const index = e.target.dataset.index
        const banner_navlist = that.data.banner_nav.split(',')
        if (banner_navlist[index] !== '') {
            wx.navigateTo({
                url: '../banner/banner?id=' + banner_navlist[index],
            })
        } else {
            return false
        }

    },
    //事件处理函数
    reflash: function (pageSize) {
        wx.showLoading({
            title: '加载中',
        })
        const that = this;
        var monthSale = 0;
        wx.request({
            url: localhost + '/seller/index',
            data: {
                token: token,
                pageSize: pageSize,
                active: true
            },
            success: function (res) {
                let content = res.data.data[2].content;
                for (let k = content.length - 1; k >= 0; k--) {
                    if (content[k].active === false) {
                        content.splice(k, 1)
                    }
                }
                const cons = [];
                for (let i = 0; i < content.length; i++) {
                    var imgurl = content[i].indexImages.split(',')[0];
                    var con = content[i].pname;
                    var price = content[i].produtsTypes[0].discountPrice;
                    var id = content[i].id;
                    content[i].monthSale === null ? monthSale = 0 : monthSale = content[i].monthSale
                    cons.push(
                        {
                            imgurl: imgurl,
                            con: con,
                            price: price,
                            id: id,
                            token: token,
                            monthSale: monthSale
                        }
                    )
                }
                that.setData({
                    cons: cons,
                    logo_stu: true
                })
                wx.hideLoading();
            }
        })
    },
    onLoad: function () {
        wx.showLoading({
            title: '加载中',
        })
        var that = this
        //调用应用实例的方法获取全局数据
        var app_ = app.globalData.url
        app.getUserInfo(function (userInfo) {
            //更新数据
            that.setData({
                userInfo: userInfo
            })
        });
        wx.request({
            url: localhost + '/seller/index',
            data: {
                token: token,
                pageSize: pageSize,
                active: true
            },
            success: function (res) {
                if (res.data.message === "当前用户未登录") {
                    wx.showModal({
                        content: res.data.message,
                    })
                    wx.hideLoading();
                    return false
                }
                var monthSale = 0;
                const imgUrls = res.data.data[0].split(',');
                const video_src = res.data.data[1];
                let content = res.data.data[2].content;
                for (let k = content.length - 1; k >= 0; k--) {
                    if (content[k].active === false) {
                        content.splice(k, 1)
                    }
                }
                const cons = [];
                for (let i = 0; i < content.length; i++) {
                    var imgurl = content[i].indexImages.split(',')[0];
                    var con = content[i].pname;
                    var price = content[i].produtsTypes[0].discountPrice;
                    var id = content[i].id;
                    content[i].monthSale === null ? monthSale = 0 : monthSale = content[i].monthSale
                    cons.push(
                        {
                            imgurl: imgurl,
                            con: con,
                            price: price,
                            id: id,
                            token: token,
                            monthSale: monthSale
                        }
                    )
                }
                imgUrls.length === 1 && that.setData({
                    indicatorDots: false
                });
                that.setData({
                    imgUrls: imgUrls,
                    video_src: video_src,
                    cons: cons,
                    banner_nav: res.data.data[3]
                })
                wx.hideLoading();
            },
            fail: function () {
                wx.hideLoading();
                wx.showModal({
                    title: '提示',
                    content: '网络信号弱，请稍后再试！',
                })
            }
        })
    },
    onShow: function () {
        const that = this;
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    height: res.windowHeight + 'px'
                })
            }
        })

    },
    onShareAppMessage: function () {

    },
    onReachBottom: function () {
        // Do something when pull down.
        this.setData({
            logo_stu: false
        })
        pageSize += 20;
        this.reflash(pageSize);
    },
})
