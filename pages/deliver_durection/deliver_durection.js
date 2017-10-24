const app = getApp();
const localhost = app.localhost.localhost;
const token = app.token.token;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        deliver_price_hidden: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.showLoading({
            title: '加载中',
        })
        const that = this;
        wx.request({
            url: localhost + '/seller/pro/findOne',
            data: {
                pid: options.id,
                token: token
            },
            success: function (res) {
                const content = res.data.data;
                const dname = content.dname;
                if (dname !== null) {
                    wx.request({
                        url: localhost + '/deliver/getTemplate',
                        data: {
                            sellerId: token,
                            dname: dname
                        },
                        success: function (res) {
                            if (res.data.message === "信息不存在") {
                                that.setData({
                                    deliver_price_hidden: false
                                })
                            } else {
                                const content = res.data.data
                                let price_type = ''
                                switch (content[0].price_type) {
                                    case "件数":
                                        price_type = "件"
                                        break
                                    case "重量":
                                        price_type = "/kg"
                                        break
                                }
                                that.setData({
                                    dname: dname,
                                    price: content[0].price,
                                    more_account: content[0].more_account,
                                    more_price: content[0].more_price,
                                    price_type: price_type
                                })
                            }
                        },
                        fail: function () {
                            wx.showModal({
                                title: '提示',
                                content: '网络信号弱，请稍后再试！',
                            })
                        }
                    })
                } else {
                    that.setData({
                        deliver_price_hidden: false
                    })
                }
                wx.hideLoading();
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