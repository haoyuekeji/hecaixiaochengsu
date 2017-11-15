const app = getApp();
const localhost = app.localhost.localhost;
const token = app.token.token;
Page({

    /**
     * 页面的初始数据
     */
    data: {

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
                pid: options.id,
                token: token
            },
            success: function (res) {
                const img = res.data.data.indexImages.split(',')[0]
                const con = res.data.data.pname
                const price = res.data.data.produtsTypes[0].discountPrice.toFixed(2)
                const height = that.data.height;
                const width = that.data.width;
                const arr = []
                that.setData({
                    img: img,
                    con: con,
                    price: price
                })
                wx.getSystemInfo({
                    success: function (res) {
                        var width = res.screenWidth * 0.8
                        var height = res.screenHeight * 0.77
                        that.setData({
                            height: height,
                            width: width,
                            pixelRatio: res.pixelRatio,
                            left: (res.screenWidth - width) / 2
                        })

                        wx.downloadFile({
                            url:'https:'+img.split(':')[1],
                            success: function (res) {
                                var num = width * 0.08
                                var cons = con.substring(0, num)
                                var con_ = con.substring(num)
                                var ctx = wx.createCanvasContext('firstCanvas')
                                ctx.setFillStyle('#ffffff')
                                ctx.rect(0, 0, width, height)
                                ctx.fill()
                                ctx.drawImage(res.tempFilePath, (width * 0.05), height * 0.025, width * 0.9, height * 0.55)
                                ctx.setTextAlign('left')
                                ctx.setFontSize(12)
                                ctx.setFillStyle('black')
                                ctx.fillText(cons, (width * 0.05), height * 0.62)
                                ctx.fillText(con_, (width * 0.05), height * 0.66)
                                ctx.setFillStyle('red')
                                ctx.setFontSize(12)
                                ctx.fillText(price, (width * 0.05), height * 0.7)
                                ctx.beginPath()
                                ctx.setLineWidth(0.1)
                                ctx.moveTo((width * 0.05), height * 0.72)
                                ctx.lineTo((width - that.data.left / 2), height * 0.72)
                                ctx.stroke()
                                ctx.setFontSize(12)
                                ctx.setFillStyle('black')
                                ctx.drawImage('../../images/icon/logo.png', (width * 0.05), height * 0.8, width * 0.18, width * 0.18)
                                ctx.setFontSize(12)
                                ctx.fillText('轻奢女装', (width * 0.25), height * 0.85)
                                ctx.fillText('长按识别二维码', (width * 0.25), height * 0.88)
                                ctx.drawImage('../../images/icon/erweima.jpg', ( width * 0.65 - that.data.left / 2), height * 0.75, width * 0.35, width * 0.35)
                                ctx.save()
                                ctx.draw()
                            }
                        })
                        wx.hideLoading();
                    }
                })
            },
        })
    },
    save: function () {
        wx.canvasToTempFilePath({
            canvasId: 'firstCanvas',
            success: function (res) {
                var tempFilePath = res.tempFilePath
                wx.showModal({
                    title: '提示',
                    content: '是否将图片保存到本地相册',
                    success: function (res) {
                        if (res.confirm) {
                            wx.saveImageToPhotosAlbum({
                                filePath: tempFilePath,
                                success: function (res) {
                                    wx.showToast({
                                        title: '保存成功！',
                                    })
                                }, fail: function (res) {
                                    if (res.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
                                        wx.showModal({
                                            title: '提示',
                                            content: '请到个人中心点击右上角设置按钮开启权限，或直接截图保存！',
                                        })
                                    }
                                }
                            })
                        }
                    }

                })

            },
            fail: function (res) {
                console.log(res)
            }
        })

    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: this.data.con,
            path: '/pages/phonto/phonto?id=' + this.data.options.id + "&&token=" + token
        }
    }
})