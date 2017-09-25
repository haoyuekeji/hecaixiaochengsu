//index.js
//获取应用实例
var app = getApp();
const localhost = app.localhost.localhost;
const token = app.token.token;

Page({
    data: {
        userInfo: {},
        indicatorDots: true,
        autoplay: true,
        interval: 3500,
        duration: 1000
    },
    //事件处理函数
    bindViewTap: function () {
        // wx.navigateTo({
        //   url: '../logs/logs'
        // })

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
                pageSize: 20
            },
            success: function (res) {
                console.log(res);
                if (res.data.message === "当前用户未登录") {
                    wx.showModal({
                        content: res.data.message,
                    })
                    wx.hideLoading();
                    return false
                }
                const imgUrls = res.data.data[0].split(',');
                imgUrls.pop();
                const video_src = res.data.data[1];
                var content = res.data.data[2].content;
                const cons = [];
                for (let k = content.length - 1; k <= 0; k--) {
                    if (content.active === false) {
                        content.splice(k, 1)
                    }
                }
                for (let i = 0; i < content.length; i++) {
                    var imgurl = content[i].indexImages.split(',')[0];
                    var con = content[i].pname;
                    var price = content[i].produtsTypes[0].priceNew;
                    var id = content[i].id;
                    cons.push(
                        {
                            imgurl: imgurl,
                            con: con,
                            price: price,
                            id: id,
                            token: token
                        }
                    )
                }
                that.setData({
                    imgUrls: imgUrls,
                    video_src: video_src,
                    cons: cons
                })
                wx.hideLoading();
            }
        })
    }
    , onShareAppMessage: function () {

    },
    onPullDownRefresh: function () {
        // Do something when pull down.
        this.onLoad()
    },
})
