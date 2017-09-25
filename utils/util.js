function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function Getstring() {
    let length = 32;
    let numeric = '0123456789';
    let strUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let password = "";
    while (password.length < length) {
        var entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
        var entity4 = Math.ceil(strUpper.length * Math.random() * Math.random());
        password += numeric.charAt(entity2);
        password += strUpper.charAt(entity4);
    }
    const paynmber = password.toString();
    return paynmber;
}


function getstatus(stu, localhost, openid, token, callback) {
    switch (stu) {
        case 0:
            wx.request({
                url: localhost + '/order/clist',
                data: {
                    openId: openid,
                    state: "待付款订单",
                    sellerId: token
                },
                success: function (res) {
                    const content = res.data.data;
                    callback(content);
                }
            })
            break;
        case 1:
            wx.request({
                url: localhost + '/order/clist',
                data: {
                    openId: openid,
                    state: "待发货订单",
                    sellerId: token
                },
                success: function (res) {
                    const content = res.data.data;
                    callback(content);
                }
            })
            break;
        case 2:
            wx.request({
                url: localhost + '/order/clist',
                data: {
                    openId: openid,
                    state: "待收货订单",
                    sellerId: token
                },
                success: function (res) {
                    const content = res.data.data;
                    callback(content);
                }
            })
            break;
        case 3:
            wx.request({
                url: localhost + '/order/clist',
                data: {
                    openId: openid,
                    state: "已完成订单",
                    sellerId: token
                },
                success: function (res) {
                    let content = res.data.data;
                    for (let i = content.length - 1; i >= 0; i--) {
                        if (content[i].active === false) {
                            content.splice(i,1);
                        }
                    }
                    callback(content)
                }
            })
            break;
    }
}
function GetIP(callback) {
    wx.request({
        url: 'https://wxapp.edeyun.cn/fujun/ip.php',
        success: function (e) {
            const IP = e.data;
            callback(IP)
        }
    })
}
module.exports = {
    formatTime: formatTime,
    Getstring: Getstring,
    getstatus: getstatus,
    GetIP: GetIP
}


