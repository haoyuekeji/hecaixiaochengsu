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
        Seclect: false,//默认选中
        SeclectAll: false,//默认全选
    },

    //点击单个商品选中
    SeclectList: function (e) {
        if (e.target.dataset.active !== true) {
            wx.showModal({
                title: '提示',
                content: '该商品已下架，请删除该商品！',
            })
            return false
        } else {
            const index = e.target.dataset.index;
            var cons_ = this.data.cons;
            cons_[index].Seclect = !this.data.cons[index].Seclect;
            this.setData({
                cons: cons_
            })
            this.SeclectAll();
            this.getPrice()

        }
    },

    //点击全部商品选中
    SeclectAlllist: function (e) {
        var k = 0;
        var arr = []
        var cons = this.data.cons;
        var Seclect = this.data.SeclectAll;
        for (var i = 0; i < cons.length; i++) {
            if (cons[i].active !== true) {
                cons[i].Seclect = false
                k++
                arr.push(i + 1)
            } else {
                cons[i].Seclect = !Seclect
            }
        }
        if (k > 0) {
            wx.showModal({
                title: '提示',
                content: '列表中第' + arr.join(',') + '件商品已下架，请删除该商品！',
            })

        }

        this.setData({
            SeclectAll: !Seclect,
            cons: cons
        })
        this.getPrice()


    },

    //点击减少件数
    NumJian: function (e) {
        if (e.target.dataset.active !== true) {
            wx.showModal({
                title: '提示',
                content: '该商品已下架，请删除该商品！',
            })
            return false
        }

        wx.showLoading({
            title: '加载中',
            mask: true
        })
        const index = e.target.dataset.index;
        const that = this;
        let cons = this.data.cons;
        let nums_ = cons[index].nums;
        let color = cons[index].color;
        let nums = 0;
        var stu = true
        if (stu) {
            if (nums_ === 1) {
                stu = false
                wx.hideLoading();
                color = '#cccccc';
                wx.showToast({
                    title: '数量最少为1',
                    image: '../../images/icon/fail.png',
                    mask: true,
                    duration: 1000
                })
                stu = true
                return false
            } else {
                stu = false
                color = '#000000';
                nums = -1
                wx.request({
                    url: localhost + "/shopCar/save",
                    data: {
                        proId: cons[index].id,
                        openId: that.data.openid,
                        sellerId: token,
                        amount: nums,
                        "produtsType.id": that.data.cons[index].productId
                    },
                    success: function (res) {
                        if (res.statusCode === 200) {
                            nums_ <= 1 ? nums_ = 1 : nums_--;
                            nums_ === 1 ? color = '#cccccc' : color = '#000000';
                            cons[index].color = color;
                            cons[index].nums = nums_;
                            that.setData({
                                cons: cons
                            })
                        }
                        that.getPrice();
                        wx.hideLoading();
                        stu = true
                    }
                })
            };
        }
    },

    //点击增加件数
    NumJia: function (e) {
        if (e.target.dataset.active !== true) {
            wx.showModal({
                title: '提示',
                content: '该商品已下架，请删除该商品！',
            })
            return false
        }
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        const index = e.target.dataset.index;
        let cons = this.data.cons;
        let nums = cons[index].nums;
        let color = cons[index].color;
        const that = this;
        var stu = true;
        if (stu) {
            stu = false
            wx.request({
                url: localhost + "/shopCar/save",
                data: {
                    proId: cons[index].id,
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
                    stu = true
                }
            })
        }

    },

    //点击删除商品
    delet: function (e) {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        const that = this;
        const id = e.target.dataset.id;
        const index = e.target.dataset.index;
        const openid = wx.getStorageSync('openid')
        let cons = this.data.cons;
        that.setData({
            id: 'del'
        })
        setTimeout(function () {
            wx.request({
                url: localhost + "/shopCar/del",
                data: {
                    id: id,
                    openId: openid,
                },
                success: function (res) {
                    if (res.data.message === "操作成功") {
                        cons.splice(index, 1);
                        that.setData({
                            cons: cons,
                            id: 'del'
                        });
                        wx.hideLoading();
                        wx.showToast({
                            title: '成功删除商品！',
                            icon: 'success',
                            mask: true,
                            duration: 1500
                        })
                    }
                    that.getPrice();
                    that.SeclectAll();
                },
                fail: function () {

                }
            })
        }, 500)
    },
    //点击跳转订单确认页面
    buy: function () {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        const paylist = [];
        const cons = this.data.cons;
        const openid = wx.getStorageSync('openid');
        for (let i = 0; i < cons.length; i++) {
            if (cons[i].Seclect === true) {
                paylist.push({ pid: cons[i].id, productId: cons[i].productId, nums: cons[i].nums, dname: cons[i].dname, id: cons[i].pid, isLuckDraw: cons[i].isLuckDraw })
            }
        }
        if (paylist.length === 0) {
            wx.hideLoading()
            wx.showModal({
                title: '提示',
                content: '您还没有选择商品哦！',
            })
            return false
        }
        wx.navigateTo({
            url: '../sure/sure?paylist=' + JSON.stringify(paylist)
        })
    },
    //点击跳转详情页
    link: function (e) {
        if (e.target.dataset.active !== true) {
            wx.showModal({
                title: '提示',
                content: '该商品已下架，请删除该商品！',
            })
            return false
        }
        const id = e.target.dataset.id;
        wx.navigateTo({
            url: '../details/details?id=' + id
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
            if (cons[i].Seclect !== Seclect) {
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
        var that = this;
        const Seclect = that.data.Seclect;
        const openid = wx.getStorageSync('openid');
        wx.request({
            url: localhost + "/shopCar/list",
            data: {
                openId: openid,
                sellerId: token
            },
            success: function (res) {
                const content = res.data.data;
                const cons = [];
                let color = '';
                for (let k = content.length - 1; k >= 0; k--) {
                    if (content[k].productses.length === 0) {
                        content.splice(k, 1)
                    }
                }
                for (let i = 0; i < content.length; i++) {
                    let imgurl = content[i].productses[0].indexImages.split(',')[0];
                    let con = content[i].productses[0].pname;
                    let price = content[i].productses[0].produtsTypes[0].discountPrice;
                    let nums = content[i].shopCarDetails[0].amount;
                    nums == 1 ? color = '#ccc' : color = '#000';
                    let id = content[i].id;
                    let pid = content[i].productses[0].produtsTypes[0].productId;
                    let productId = content[i].productses[0].produtsTypes[0].id;
                    let size = content[i].productses[0].produtsTypes[0].size;
                    let productcolor = content[i].productses[0].produtsTypes[0].color;
                    let dname = content[i].productses[0].dname;
                    let active = content[i].productses[0].active;
                    let isLuckDraw = content[i].productses[0].isLuckDraw;
                    cons.push({ imgurl: imgurl, con: con, price: price, nums: nums, Seclect: Seclect, color: color, id: pid, pid: id, productId: productId, size: size, productcolor: productcolor, dname: dname, active: active, isLuckDraw: isLuckDraw })
                }
                that.setData({
                    cons: cons,
                    SeclectAll: false
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