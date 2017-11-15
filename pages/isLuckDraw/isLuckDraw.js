const app = getApp();
const token = app.token.token;
const localhost = app.localhost.localhost;
const appid = app.appid.appid;
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },
    copy: function (e) {
        const index = e.target.dataset.id
        const data = this.data.cons[index].luckcode
        wx.setClipboardData({
            data: data
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const openid = wx.getStorageSync('openid');
        const cons = [];
        const that = this;
        wx.request({
            url: localhost + '/order/clist',
            data: {
                openId: openid,
                luckdraw: true,
                sellerId: token
            },
            success: function (res) {
                const data = res.data.data;
                if (data.length >= 1) {
                    for (let i = 0; i < data.length; i++) {
                        let imgurl = data[i].products[0].indexImages.split(",")[0];
                        let con = data[i].products[0].pname;
                        let color = data[i].produtsTypes[0].color;
                        let size = data[i].produtsTypes[0].size;
                        let priceNew = data[i].totalPrice.toFixed(2);
                        let id = data[i].id;
                        let dname = data[i].deliver.dname;
                        let dcode = data[i].deliver.dcode;
                        let orderCode = data[i].orderCode;
                        let createDate = data[i].createDate
                        let amount = data[i].amount;
                        let luckcode = data[i].luckcode;
                        cons.push({ imgurl: imgurl, con: con, color: color, size: size, priceNew: priceNew, id: id, amount: amount, dname: dname, dcode: dcode, orderCode: orderCode, createDate: createDate, luckcode: luckcode })
                    }
                    that.setData({
                        cons: cons
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