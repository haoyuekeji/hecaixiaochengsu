const app = getApp();
const localhost = app.localhost.localhost;
const token = app.token.token;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        unindex: 0
    },
    ChangeNav: function (e) {
        wx.showLoading({
            title: '加载中',
        })
        const that = this;
        const ptypename = e.target.dataset.id;
        this.setData({
            unindex: e.target.dataset.index
        });
        if (ptypename === "全部") {
            this.Allgoods()
        } else {
            this.ptypegoods(ptypename);
        }
        wx.hideLoading()
    },
    Allgoods: function () {
        wx.showLoading({
            title: '加载中',
        })
        const that = this;
        wx.request({
            url: localhost + "/customer/proSearch",
            data: {
                token: token
            },
            success: function (res) {
                const content = res.data.data;
                const nav = ['全部'];
                const cons = [];
                const json = {};
                var monthSale = 0;
                for (let i = 0; i < content.length; i++) {
                    let ptypeName = content[i].ptypeName;
                    let img = content[i].indexImages.split(',')[0];
                    content[i].monthSale === null ? monthSale = 0 : monthSale = content[i].monthSale
                    cons.push({ con: content[i].pname, imgurl: img, price: content[i].produtsTypes[0].discountPrice, id: content[i].id, monthSale: monthSale });
                    if (!json[ptypeName]) {
                        nav.push(ptypeName);
                        json[ptypeName] = 1;
                    }
                }
                cons.sort(that.sortmonthSale).reverse()

                that.setData({
                    cons: cons,
                    nav: nav,

                })
                wx.hideLoading()
            }
        })
    },

    sortmonthSale: function (a, b) {
        return a.monthSale - b.monthSale
    },
    ptypegoods: function (ptypename) {
        const that = this;
        wx.request({
            url: localhost + "/customer/proSearch",
            data: {
                token: token,
                ptypename: ptypename
            },
            success: function (res) {
                const content = res.data.data;
                const cons = [];
                var monthSale = 0;
                for (let i = 0; i < content.length; i++) {
                    let img = content[i].indexImages.split(',')[0];
                    content[i].monthSale === null ? monthSale = 0 : monthSale = content[i].monthSale;
                    cons.push({ con: content[i].pname, imgurl: img, price: content[i].produtsTypes[0].discountPrice, id: content[i].id, monthSale: monthSale });

                }
                cons.sort(that.sortmonthSale).reverse()

                that.setData({
                    cons: cons,
                })

            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        this.Allgoods()
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
        return {
            title: "DRESS FASHlON轻奢女装",
            path: '/pages/goods/goods?token=' + token
        }
    }
})