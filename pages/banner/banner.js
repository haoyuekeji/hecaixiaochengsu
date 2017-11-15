const app = getApp();
const localhost = app.localhost.localhost;
const token = app.token.token;
const QQMAP = require('../../utils/qqmap.min.js');
const qqmap_demo = new QQMAP({
    key: 'YV4BZ-S3EKG-EYLQP-ISBKQ-GTOXE-G6BPR'
})
var that
var resizePicModal = {}
var resizePicModalService = require('../../pages/resizePicModal/resizePicModal.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        indicatorDots: true,
        autoplay: true,
        interval: 3500,
        duration: 1000,
        cover: true,
        background: '#cdcdcd',
        nums: 1,
        price: 0,
        stu: true,
        deliver_price_hidden: true,
        img_cover_stu: false,
        scaleWidth: "",
        scaleHeight: "",
        dataimg: "",
        x: 100,
        y: 50,
        share_stu: true
    },

    NumJian: function () {
        let num = this.data.nums;
        num--;
        num > 0 ?
            this.setData({
                nums: num
            }) : "";

    },
    NumJia: function () {
        let num = this.data.nums;
        num++;
        this.setData({
            nums: num
        })

    },
    Changelist: function (e) {
        let index = e.target.dataset.index
        this.setData({
            id: index
        })
    },



    ChooseGuige: function (e) {
        const cover_ = this.data.cover;
        let cover = !cover_;
        this.setData({
            cover: cover,
            bottom: 0
        })
    },

    guige_details: function () {
        return false
    },

    ChangeColor: function (e) {
        const that = this;
        const size_ = [];
        const details = that.data.details;
        for (let i = 0; i < details.length; i++) {
            if (e.target.dataset.name === details[i].color) {
                for (var k = 0; k < details[i].size.length; k++) {
                    size_.push(details[i].size[k].size)
                }
            }
        }

        this.setData({
            Colorindex: e.target.dataset.index,
            choosecolor: e.target.dataset.name,
            size: size_
        })

        this.setPrice_color()
    },



    ChangeSize: function (e) {
        this.setData({
            Sizeindex: e.target.dataset.index,
            choosesize: e.target.dataset.name
        })
        this.setPrice_size()
    },



    SetCar: function () {
        const that = this;
        const id = this.data.id;
        const productId = this.data.productId;
        const details = that.data.details;
        if (id !== '' && id !== undefined && productId !== "" && productId !== undefined) {
            try {
                var value = wx.getStorageSync('openid')
                if (value) {
                    // Do something with return value
                    wx.request({
                        url: localhost + '/shopCar/save',
                        data: {
                            openId: value,
                            proId: that.data.productId,
                            sellerId: token,
                            amount: that.data.nums,
                            "produtsType.id": that.data.id
                        },
                        success: function (res) {
                            if (res.statusCode === 200) {
                                wx.showToast({
                                    title: '添加成功！',
                                    icon: 'success',
                                    mask: true,
                                    duration: 1200
                                })
                            }
                            setTimeout(function () {
                                wx.switchTab({
                                    url: '../../pages/car/car',
                                })
                            }, 1200)
                        }
                    })
                }
            } catch (e) {
                // Do something when catch error

            }
        } else {
            wx.showModal({
                title: '提示',
                content: '有信息没选中！',
                showCancel: false
            })
        }
    },


    buy: function () {
        const id = this.data.id;
        const productId = this.data.productId;
        const nums = this.data.nums;
        const dname = this.data.dname;
        const paylist = [];
        if (id !== '' && id !== undefined && productId !== "" && productId !== undefined) {
            paylist.push({ pid: productId, productId: id, nums: nums, dname: dname });
            wx.navigateTo({
                url: '../sure/sure?paylist=' + JSON.stringify(paylist)
            })
        } else {
            wx.showModal({
                title: '提示',
                content: '有信息没选中！',
                showCancel: false
            })
        }
    },

    setPrice_size: function () {
        const that = this;
        let Sizeindex = that.data.Sizeindex;
        let amount = 0;
        let price = 0;
        let id = 0;
        let productId = 0;
        const size_ = [];
        let Colorindex = that.data.Colorindex;
        let choosecolor = that.data.choosecolor;
        let i = 0;
        let choosesize = '';
        const details = that.data.details;
        if (choosecolor === undefined) {
            Colorindex = 0;
            choosecolor = details[Colorindex].color;
            for (let k = 0; k < details[Colorindex].size.length; k++) {
                if (that.data.choosesize === details[Colorindex].size[k].size) {
                    amount = details[Colorindex].size[k].amount;
                    price = details[Colorindex].size[k].priceNew
                }
            }

            for (var k = 0; k < details[Colorindex].size.length; k++) {
                size_.push(details[Colorindex].size[k].size)
            }

            that.setData({
                Colorindex: Colorindex,
                choosecolor: choosecolor,
                kucun: amount,
                price: price,
                size: size_
            })


            for (let k = 0; k < details[Colorindex].size.length; k++) {
                if (that.data.choosesize === details[Colorindex].size[k].size) {
                    i++;
                    amount = details[Colorindex].size[k].amount;
                    price = details[Colorindex].size[k].priceNew;
                    Sizeindex = k;
                    choosesize = details[Colorindex].size[k].size;
                    id = details[Colorindex].size[k].id;
                    productId = details[Colorindex].size[k].productId
                }
            }
            if (i > 0) {
                this.setData({
                    kucun: amount,
                    price: price,
                    Sizeindex: Sizeindex,
                    choosesize: choosesize,
                    id: id,
                    productId: productId
                })
            } else {
                wx.showModal({
                    title: '提示',
                    content: choosecolor + "的" + that.data.choosesize + "码已卖完!",
                    showCancel: false,
                    success: function () {
                        that.setData({
                            choosesize: "",
                            Sizeindex: "",
                            id: '',
                            productId: '',
                            kucun: details[Colorindex].amount
                        })
                    }
                })
            }

        } else {
            const Sizeindex = that.data.Sizeindex
            for (let k = 0; k < details[Colorindex].size.length; k++) {
                if (that.data.choosesize === details[Colorindex].size[Sizeindex].size) {
                    amount = details[Colorindex].size[Sizeindex].amount;
                    price = details[Colorindex].size[Sizeindex].priceNew;
                    id = details[Colorindex].size[Sizeindex].id;
                    productId = details[Colorindex].size[Sizeindex].productId
                }
            }
            this.setData({
                kucun: amount,
                price: price,
                id: id,
                productId: productId
            })
        }
    },



    setPrice_color: function () {
        const that = this;
        let amount = 0;
        let price = 0;
        let i = 0;
        let Colorindex = that.data.Colorindex;
        let choosecolor = that.data.choosecolor;
        let Sizeindex = 0;
        let choosesize = '';
        let id = 0;
        let productId = 0;
        const details = that.data.details;
        if (that.data.choosesize === undefined || that.data.choosesize === "") {
            amount = details[Colorindex].amount;
            price = details[Colorindex].priceNew
            that.setData({
                kucun: amount,
                price: price
            })
        } else {
            for (let k = 0; k < details[Colorindex].size.length; k++) {
                if (that.data.choosesize === details[Colorindex].size[k].size) {
                    i++;
                    amount = details[Colorindex].size[k].amount;
                    price = details[Colorindex].size[k].priceNew;
                    Sizeindex = k;
                    choosesize = details[Colorindex].size[k].size;
                    productId = details[Colorindex].size[k].productId;
                    id = details[Colorindex].size[k].id
                }
            }
            if (i > 0) {
                this.setData({
                    kucun: amount,
                    price: price,
                    Sizeindex: Sizeindex,
                    choosesize: choosesize,
                    id: id,
                    productId: productId
                })
            } else {
                wx.showModal({
                    title: choosecolor + "的" + that.data.choosesize + "码已卖完!",
                    showCancel: false,
                    success: function () {
                        that.setData({
                            choosesize: "",
                            Sizeindex: "",
                            id: '',
                            productId: '',
                            kucun: details[Colorindex].amount
                        })
                    }
                })
            }
        }
    },
    deliverPrice: function (dname) {
        const that = this;
        var deliverPrice_price = 0
        const deliverPrice_price_all = []
        if (dname !== null) {
            wx.getLocation({
                success: function (res) {
                    qqmap_demo.reverseGeocoder({
                        location: {
                            latitude: res.latitude,
                            longitude: res.longitude
                        },
                        success: function (res) {
                            const provinceName = res.result.address_component.province
                            that.setData({
                                provinceName: res.result.address_component.district
                            })
                            if (dname !== '') {
                                wx.request({
                                    url: localhost + '/deliver/getTemplate',
                                    data: {
                                        sellerId: token,
                                        dname: dname
                                    },
                                    success: function (res) {
                                        if (res.data.message === "信息不存在") {
                                            deliverPrice_price = "包邮"
                                            that.setData({
                                                deliverPrice_price: deliverPrice_price,
                                            })
                                        } else {
                                            const content = res.data.data
                                            for (let k = 1; k < content.length; k++) {
                                                let destination = content[k].destination.split('，');
                                                for (let j = 0; j < destination.length; j++) {
                                                    if (provinceName === destination[j]) {
                                                        deliverPrice_price = content[k].price
                                                        that.setData({
                                                            deliverPrice_price: deliverPrice_price.toFixed(2),
                                                        })
                                                        return false
                                                    } else {
                                                        deliverPrice_price = content[0].price
                                                        that.setData({
                                                            deliverPrice_price: deliverPrice_price.toFixed(2),
                                                        })
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    fail: function () {
                                        deliverPrice_price = "包邮"
                                        that.setData({
                                            deliverPrice_price: deliverPrice_price,
                                        })
                                        wx.showModal({
                                            title: '提示',
                                            content: '网络信号弱，请稍后再试！',
                                        })
                                    }
                                })
                            } else {
                                deliverPrice_price = "包邮"
                                that.setData({
                                    deliverPrice_price: deliverPrice_price,
                                })
                            }
                        },
                        fail: function (res) {
                            deliverPrice_price = "点击查看"
                            that.setData({
                                deliverPrice_price: deliverPrice_price,
                                provinceName: '无法获取位置信息'
                            })
                        }
                    })
                },
                fail: function (res) {
                    deliverPrice_price = "点击查看"
                    that.setData({
                        deliverPrice_price: deliverPrice_price,
                        provinceName: '无法获取位置信息'
                    })
                    if (res.errMsg === 'getLocation:fail auth deny') {
                        wx.showModal({
                            title: '提示',
                            content: '取消后将无法提示邮费信息，您可以点击个人中心进行设置或点击邮费查看详情！',
                        })
                    }
                }
            })
        } else {
            deliverPrice_price = "包邮"
            that.setData({
                deliverPrice_price: deliverPrice_price,
            })
        }
    },
    express: function () {
        wx.navigateTo({
            url: '../deliver_durection/deliver_durection?id=' + this.data.options.id,
        })
    },
    showImg: function (e) {
        var that = this
        var index = e.target.dataset.id
        wx.previewImage({
            current: that.data.imgurl[index],
            urls: that.data.imgurl,
        })
    },
    showIndexImg: function (e) {
        var that = this
        var index = e.target.dataset.id
        wx.previewImage({
            current: that.data.imgurl[index],
            urls: that.data.imgUrls,
        })
    },
    index: function () {
        wx.switchTab({
            url: '../../pages/index/index',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
        })
    },
    shareShow: function () {
        const share_stu = this.data.share_stu
        this.setData({
            share_stu: !share_stu
        })
    },
    creatPicture: function () {
        const that = this
        wx.navigateTo({
            url: '../../pages/phonto/phonto?id=' + that.data.id,
        })
    },
    /**
  * 生命周期函数--监听页面加载
  */
    onLoad: function (options) {
        wx.showLoading({
            title: '加载中',
        })
        this.setData({
            options: options
        })
        var that = this;
        wx.request({
            url: localhost + '/seller/pro/findOne',
            data: {
                pcode: options.id,
                token: token
            },
            success: function (res) {
                const content = res.data.data;
                const details = [];
                const produtsTypes = content.produtsTypes;
                for (let q = produtsTypes.length - 1; q >= 0; q--) {
                    if (produtsTypes[q].amount === 0 || produtsTypes[q].active === false) {
                        produtsTypes.splice(q, 1);
                    }
                }
                const imgUrls = [];
                const imgurl = [];
                const size = [];
                const size_ = []
                const color = [];
                const json = {};
                let kucun = 0;
                let price = 0;
                var monthSale = 0;
                const img = content.images.split(',');
                const imgs = content.indexImages.split(',');
                const dname = content.dname;
                const id = content.id;
                content.monthSale === null ? monthSale = 0 : monthSale = content.monthSale
                // img.pop();
                const con = content.pname;
                const priceNew = content.produtsTypes[0].discountPrice;
                let priceOld = content.produtsTypes[0].priceNew;
                priceOld === null ? that.setData({ priceOldstu: false }) : that.setData({ priceOldstu: true });
                for (let i = 0; i < imgs.length; i++) {
                    imgUrls.push(imgs[i])
                }
                imgUrls.length <= 1 ? that.setData({ indicatorDots: false }) : '';

                for (let k = 0; k < img.length; k++) {
                    imgurl.push(img[k])
                }
                for (let i = 0; i < produtsTypes.length; i++) {
                    color.push(produtsTypes[i].color);
                    kucun += produtsTypes[i].amount
                }
                for (var i = color.length - 1; i >= 0; i--) {
                    if (color[i] === color[i - 1]) {
                        color.splice(i, 1)
                    }
                }
                for (let w = 0; w < color.length; w++) {
                    details.push({ color: color[w], size: [], })
                }
                for (let w = 0; w < details.length; w++) {
                    let kucun = 0;
                    for (let q = 0; q < produtsTypes.length; q++) {
                        if (details[w].color === produtsTypes[q].color) {
                            if (!json[produtsTypes[q].size]) {
                                size_.push(produtsTypes[q].size);
                                json[produtsTypes[q].size] = 1;
                            }
                            kucun += produtsTypes[q].amount;
                            price = produtsTypes[q].priceNew;
                            details[w].size.push({ size: produtsTypes[q].size, priceNew: produtsTypes[q].discountPrice, amount: produtsTypes[q].amount, id: produtsTypes[q].id, productId: produtsTypes[q].productId });

                        }
                    }
                    details[w].kucun = kucun;
                    details[w].priceNew = price;
                }
                const imgurl_length = imgurl.length
                that.deliverPrice(dname)
                that.setData({
                    imgUrls: imgUrls,
                    con: con,
                    priceNew: priceNew,
                    priceOld: priceOld,
                    imgurl: imgurl,
                    guige_img: imgs[0],
                    color: color,
                    kucun: kucun,
                    price: priceNew,
                    details: details,
                    pid: options.id,
                    monthSale: monthSale,
                    size: size_,
                    dname: dname,
                    imgurl_length: imgurl_length,
                    id: id
                })
                wx.hideLoading();
            }
        })
        that = this
        resizePicModal = new resizePicModalService.ResizePicModal()
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
        const that = this;
        const options = this.data.options;
        this.setData({
            stu: false
        })
        this.onLoad(options);
        setTimeout(function () {
            that.setData({
                stu: true
            })
        }, 1200)
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: this.data.con,
            path: '/pages/banner/banner?id=' + this.data.pid + "&&token=" + token
        }
    }
})