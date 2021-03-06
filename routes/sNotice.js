var express = require('express');
var router = express.Router();
var db = require('../model/db');
var session = require('express-session');



/* GET home page. */

// 店家
let storeID;
let store;

// 通知讀取數
let read;

// 廠商平台通知
let dNotice;

// 廠商新訂單明細
let orderDtNoticeSelect;
let orderDtNotice;

// 廠商訂單
let a;

// 廠商新訂單
let orderNotice;

// 廠商拒絕訂單
let orderCaNotice;

// 廠商接受訂單
let orderOkNotice;

// 廠商接受訂單
let orderID;



// 通知資料
router.get('/', function (req, res, next) {
    // 店家
    storeID = req.session.storeID;
    orderID = 9;
    store = 'select a.`storeID`,a.`storeName`,\
    a.`storePhoto`,count(b.`noticeStatus`) as\
     noticeCount from `store` as a,`notice` as\
      b where a.`storeID`=b.`toWhoID` and b.`toWhoType`=1\
       and b.`noticeStatus`=1 and storeID=' + storeID;

    // 通知讀取數
    read = 'SELECT count(noticeID) countZ  FROM `notice` WHERE `toWhoType`=1 and noticeStatus=1 and `toWhoID`=' + storeID;

    // 廠商平台通知
    dNotice = 'SELECT * FROM `notice` where noticeType=0 and toWhoType=1 and toWhoID=' + storeID;

    // 廠商訂單
    a = 'SELECT c.`noticeID`,a.`orderID`,b.`memberName`,b.`memberPhoto`,c.`noticeStatus`,\
    c.`noticeTime`,sum(d.`price`*d.`quality`) total,a.`orderDeadline` FROM\
     `order` as a ,`member` as b ,`notice` as c ,`orderdetail` as d \
    where a.`memberID`=b.`memberID` and  a.`orderID`=c.`noticeData` and\
     a.`orderID` = d.`orderID` and (a.`orderStatus`'
    // 廠商新訂單
    orderNotice = `${a} =2 ) and c.toWhoID=${storeID} group by noticeID,orderID,memberName,memberPhoto,noticeTime,orderDeadline`;
    // 廠商拒絕訂單
    orderCaNotice = `${a} =0 ) and c.toWhoID=${storeID}` + ' group by `noticeID`,`orderID`,`storeID`,`deliveryAddress`,\
    `orderDeadline`,`orderArrivedTime`,`orderCreateTime`';
    // 廠商接受訂單
    orderOkNotice = `${a} =3 or a.orderStatus=4 or a.orderStatus=5 )and c.toWhoID=${storeID}` + ' group by `noticeID`\
,`orderID`,`memberName`,`memberPhoto`,`noticeStatus`,`noticeTime`,`orderDeadline`';

    // // 訂單詳情
    orderDtNoticeSelect = 'select o.orderID,d.productID,d.price,sum(d.quality) sum,\
    o.orderArrivedTime,o.orderCreateTime,m.memberName,m.memberPhone,\
    p.productPhoto,p.productName,o.deliveryAddress FROM\
     `orderdetail` d , `order` o , `member` m , `product` p where\
      o.orderID=d.orderID and d.productID=p.productID and m.memberID=o.memberID\
       and d.orderID='
    orderDtNotice = `${orderDtNoticeSelect}${orderID} group by productID,price,productPhoto,productName`;

    next();
});

router.get('/getDetail', async (req, res, next) => {
    orderID = req.query.orderID;
    orderDtNoticeSelect = 'select o.orderID,d.productID,d.price,sum(d.quality) sum,\
    o.orderArrivedTime,o.orderCreateTime,m.memberName,m.memberPhone,\
    p.productPhoto,p.productName,o.deliveryAddress FROM\
     `orderdetail` d , `order` o , `member` m , `product` p where\
      o.orderID=d.orderID and d.productID=p.productID and m.memberID=o.memberID\
       and d.orderID='
    orderDtNotice = `${orderDtNoticeSelect}${orderID} group by productID,price,productPhoto,productName`;
    newsJSON3 = JSON.stringify(await getOrderDTNotice(req));
    res.json(newsJSON3);
    next();
});

// 接受
router.post('/setAppect', function (req, res, next) {
    db.query('UPDATE `order` set `orderStatus`=3 where orderID=' + req.body.orderID,
        function () {
            console.log('已接受')
        })
        .catch(function () {
            console.log('err');
        })

})

// 拒絕
router.post('/setRefuse', function (req, res, next) {
    db.query('UPDATE `order` set `orderStatus`=0 where orderID=' + req.body.orderID,
        function () {
            console.log('已拒絕')
        })
        .catch(function () {
            console.log('err');
        })

})


// 已讀
router.post('/read', function (req, res, next) {
    db.query('UPDATE `notice` set `noticeStatus`=2 where noticeID=' + req.body.noticeId,
        function () {
            console.log('已讀')
        })
        .catch(function () {
            console.log('err');
        })


})
// 全部已讀
router.post('/allRead', function (req, res, next) {
    db.query('UPDATE `notice` set `noticeStatus`=2 where `toWhoType`=1 and toWhoID=' + req.body.storeID,
        function () {
            console.log('全部已讀')
        })
        .catch(function () {
            console.log('err');
        })

})

// 刪除
router.post('/deleteN', function (req, res, next) {
    db.query('UPDATE `notice` set `noticeStatus`=0 where noticeID=' + req.body.noticeId,
        function () {
            console.log('刪除')
        })
        .catch(function () {
            console.log('err');
        })


})



// 店家左側
const getStoreData = (req) => {
    return new Promise((resolve, reject) => {
        db.queryAsync(store)
            .then(results => {
                resolve(results);
            })
            .catch(ex => {
                reject(ex);
            });
    })
};

// 店家平台通知
const getDNotice = (req) => {
    return new Promise((resolve, reject) => {
        db.queryAsync(dNotice)
            .then(results => {
                resolve(results);
            })
            .catch(ex => {
                reject(ex);
            });
    })
};

// 店家訂單通知
const getOrderNotice = (req) => {
    return new Promise((resolve, reject) => {
        db.queryAsync(orderNotice)
            .then(results => {
                resolve(results);
            })
            .catch(ex => {
                reject(ex);
            });
    })
};
// 店家訂單通知詳細
const getOrderDTNotice = (req) => {
    return new Promise((resolve, reject) => {
        db.queryAsync(orderDtNotice)
            .then(results => {
                resolve(results);
            })
            .catch(ex => {
                reject(ex);
            });
    })
};

// 店家拒絕訂單詳細
const getOrderCaNotice = (req) => {
    return new Promise((resolve, reject) => {
        db.queryAsync(orderCaNotice)
            .then(results => {
                resolve(results);
            })
            .catch(ex => {
                reject(ex);
            });
    })
};
// 店家接單訂單詳細
const getOrderOkNotice = (req) => {
    return new Promise((resolve, reject) => {
        db.queryAsync(orderOkNotice)
            .then(results => {
                resolve(results);
            })
            .catch(ex => {
                reject(ex);
            });
    })
};
// 已讀
const getread = (req) => {
    return new Promise((resolve, reject) => {
        db.queryAsync(read)
            .then(results => {
                resolve(results);
            })
            .catch(ex => {
                reject(ex);
            });
    })
};

//傳資料到表單裡
router.get('/', async (req, res) => {
    newsJSON = JSON.stringify(await getStoreData(req));
    newsJSON1 = JSON.stringify(await getDNotice(req));
    newsJSON2 = JSON.stringify(await getOrderNotice(req));
    newsJSON3 = JSON.stringify(await getOrderDTNotice(req));
    newsJSON4 = JSON.stringify(await getOrderCaNotice(req));
    newsJSON5 = JSON.stringify(await getOrderOkNotice(req));
    newsJSON6 = JSON.stringify(await getread(req));

    res.render('sNotice', {
        storeData: newsJSON,
        dNticeData: newsJSON1,
        orderNoticeData: newsJSON2,
        orderDTNoticeData: newsJSON3,
        orderCaNoticeData: newsJSON4,
        orderOkNoticeData: newsJSON5,
        readData: newsJSON6,
        active: 'sNotice'
    });
});





module.exports = router;