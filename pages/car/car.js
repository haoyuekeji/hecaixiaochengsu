const app = getApp();
const localhost = app.localhost.localhost;
const token = app.token.token;
Page({
    /**
     * 页面的初始数据
     */
    data: {
        CarShow: false,//购物车无商品时显示
        price: 0.00,//合计金额
        priceAll: 0,//件数
        style: '1rpx solid #cccccc',
        color: '#000',//数字变为一时，颜色变化
        Seclect: true,//默认选中
        SeclectAll: true,//默认全选
    },

    //点击单个商品选中
    SeclectList: function (e) {
        const index = e.target.dataset.index;
        var cons_ = this.data.cons;
        cons_[index].Seclect = !this.data.cons[index].Seclect;
        this.setData({
            cons: cons_
        })
        this.SeclectAll();
        this.getPrice()
    },

    //点击全部商品选中
    SeclectAlllist: function (e) {
        var cons = this.data.cons;
        var Seclect = this.data.SeclectAll;
        for (var i = 0; i < cons.length; i++) {
            cons[i].Seclect = !Seclect
        }
        this.setData({
            SeclectAll: !Seclect,
            cons: cons
        })
        this.getPrice()
    },

    //点击减少件数
    NumJian: function (e) {
        wx.showLoading({
            title: '加载中',
        })
        const index = e.target.dataset.index;
        const that = this;
        let cons = this.data.cons;
        let nums_ = cons[index].nums;
        let color = cons[index].color;
        let nums = 0;
        if (nums_ === 1) {
            color = '#cccccc';
            wx.hideLoading();
        } else {
            color = '#000000';
            nums = -1
            wx.request({
                url: localhost + "/shopCar/save",
                data: {
                    proId: cons[index].pid,
                    openId: that.data.openid,
                    sellerId: token,
                    amount: nums,
                    "produtsType.id": that.data.cons[index].productId
                },
                success: function (res) {
                    if (res.statusCode === 200) {
                        nums_ <= 1 ? nums_ = 1 : nums_--;


                        cons[index].color = color;
                        cons[index].nums = nums_;
                        that.setData({
                            cons: cons
                        })
                    }
                    that.getPrice();
                    wx.hideLoading();
                }
            })
        };

    },

    //点击增加件数
    NumJia: function (e) {
        wx.showLoading({
            title: '加载中',
        })
        const index = e.target.dataset.index;
        let cons = this.data.cons;
        let nums = cons[index].nums;
        let color = cons[index].color;
        const that = this;
        wx.request({
            url: localhost + "/shopCar/save",
            data: {
                proId: cons[index].pid,
                openId: that.data.openid,
                sellerId: token,
                amount: 1,
                "produtsType.id": that.data.cons[index].productId
            },
            success: function (res) {
                if (res.statusCode === 200) {
                    nums++;
                    nums === 1 ? color = '#cccccc'
                        : color = '#000000'
                    cons[index].color = color;
                    cons[index].nums = nums;
                    that.setData({
                        cons: cons
                    })
                }
                that.getPrice();
                wx.hideLoading();
            }
        })
    },

    //点击删除商品
    delet: function (e) {
        wx.showLoading({
            title: '加载中',
        });
        const that = this;
        const id = e.target.dataset.id;
        const index = e.target.dataset.index;
        let cons = this.data.cons;
        that.setData({
            id: 'del'
        })
        setTimeout(function () {
            wx.request({
                url: localhost + "/shopCar/del",
                data: {
                    id: id
                },
                success: function (res) {
                    if (res.statusCode === 200) {
                        cons.splice(index, 1);
                        that.setData({
                            cons: cons,
                            id: 'del'
                        });
                        wx.showToast({
                            title: '成功删除商品！',
                            icon: 'success',
                            mask: true,
                            duration: 1000
                        })
                    }
                    wx.hideLoading();
                }
            })
        }, 500)

        console.log(id)
        this.SeclectAll();
        this.getPrice();
    },
    //点击跳转订单确认页面
    buy: function () {
        const paylist = [];
        const cons = this.data.cons;
        for (let i = 0; i < cons.length; i++) {
            if (cons[i].Seclect === true) {
                paylist.push({ pid: cons[i].pid, productId: cons[i].productId, nums: cons[i].nums })
            }
        }
        wx.navigateTo({
            url: '../sure/sure?paylist=' + JSON.stringify(paylist)
        })
    },
    //点击跳转详情页
    link: function () {
        wx.navigateTo({
            url: '../details/details?id='
        })
    },
    //判断全选按钮是否应该选中
    SeclectAll: function () {
        let cons_ = this.data.cons;
        let len = this.data.cons.length;
        let j = 0
        for (let i = 0; i < len; i++) {
            if (cons_[i].Seclect !== true) {
                j++
            }
        }

        len == 0 ? this.setData({
            SeclectAll: false
        }) : j == 0 ?
                this.setData({
                    SeclectAll: true
                }) : this.setData({
                    SeclectAll: false
                })
    },


    //获取总价格
    getPrice: function () {
        var priceAll = 0;
        var price_ = 0;
        const Seclect = this.data.Seclect;
        let len = this.data.cons.length;
        let cons = this.data.cons;
        for (var i = 0; i < len; i++) {
            if (cons[i].Seclect == Seclect) {
                priceAll++;
                price_ += cons[i].price * cons[i].nums
            }
        }
        const price = price_.toFixed(2)
        this.setData({
            priceAll: priceAll,
            price: price
        })
    },
    scroll: function (e) {
        console.log(1)
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const openid = wx.getStorageSync('openid');
        this.setData({
            openid: openid
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
        const openid = wx.getStorageSync("openid");
        var that = this;
        const Seclect = that.data.Seclect;
        wx.request({
            url: localhost + "/shopCar/list",
            data: {
                openId: openid,
                sellerId: token
            },
            success: function (res) {
                const content = res.data.data;
                // console.log(content)
                const cons = [];
                let color = '';
                for (let i = 0; i < content.length; i++) {
                    let imgurl = content[i].productses[0].indexImages.split(',')[0];
                    let con = content[i].productses[0].pname;
                    let price = content[i].shopCarDetails[0].produtsType.priceNew;
                    let nums = content[i].shopCarDetails[0].amount;
                    nums == 1 ? color = '#ccc' : color = '#000';
                    let id = content[i].id;
                    let pid = content[i].shopCarDetails[0].produtsType.productId;
                    let productId = content[i].shopCarDetails[0].produtsType.id;
                    cons.push({ imgurl: imgurl, con: con, price: price, nums: nums, Seclect: Seclect, color: color, id: id, pid: pid, productId: productId })
                }
                that.setData({
                    cons: cons,
                    SeclectAll: true
                })
                that.getPrice();
                wx.hideLoading()
            }
        })
        setTimeout(function () {
            wx.hideLoading()
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