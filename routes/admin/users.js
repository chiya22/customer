var express = require('express');
var router = express.Router();

const security = require('../../util/security');
const hash = require('../../util/hash').digest;
const tool = require('../../util/tool');

const users = require("../../model/users");

// TOPページ
router.get('/', security.authorize(), function (req, res, next) {

  users.find((err, retObj) => {
    if (err) { next(err); }
    res.render('admin/users', {
      users: retObj,
    });
  });

});

// メニューから登録画面（usersForm）へ
router.get('/insert', security.authorize(), function (req, res, next) {
  res.render('admin/userform', {
    user: null,
    mode: 'insert',
    message: null,
  });
});

//ユーザIDを指定して更新画面（usersForm）へ
router.get('/update/:id', security.authorize(), function (req, res, next) {
  const id = req.params.id;
  users.findPKey(id, (err, retObj) => {
    if (err) { next(err) };
    res.render('admin/userform', {
      user: retObj[0],
      mode: 'update',
      message: null,
    });
  });
});

//ユーザ情報の登録
router.post('/insert', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.body.id;
  inObj.name = req.body.name;
  inObj.pwd = hash(req.body.password);
  inObj.role = req.body.role;
  inObj.ymd_start = tool.getToday();
  inObj.ymd_upd = tool.getToday();
  inObj.id_upd = req.user.id;

  users.insert(inObj, (err, retObj)=> {
    if (err) {
      if (err.errno === 1062) {
        res.render('admin/userform', {
          user: null,
          mode: 'insert',
          message: 'ユーザー【' + inObj.id + '】はすでに存在しています',
        });
      } else {
        next(err)
      };
    } else {
      res.redirect(req.baseUrl);
    }
  });
});

//ユーザ情報の更新
router.post('/update/update', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.body.id;
  inObj.name = req.body.name;
  inObj.password = hash(req.body.password);
  inObj.role = req.body.role;
  inObj.ymd_start = req.body.ymd_start;
  inObj.ymd_end = req.body.ymd_end;
  inObj.ymd_upd = tool.getToday();
  inObj.id_upd = req.user.id;
  inObj.before_ymd_end = req.body.before_ymd_end;
  users.update(inObj, (err, retObj) => {
    if (err) { next(err) };
    //更新時に対象レコードが存在しない場合
    if (retObj.changedRows === 0) {
      res.render('admin/userform', {
        user: inObj,
        mode: 'update',
        message: '更新対象がすでに削除されています',
      });
    } else {
      res.redirect(req.baseUrl);
    }
  });
});

//ユーザ情報の削除
router.post('/update/delete', security.authorize(), function (req, res, next) {
  const id = req.body.id;
  users.remove(id, (err,retObj)=>{
    if (err) {
      // 外部制約参照エラーの場合
      if (err.errno === 1451) {
        users.findPKey(id, (err, retObj) => {
          if (err) { next(err) };
          res.render('admin/userform', {
            user: retObj[0],
            mode: 'update',
            message: '削除対象のユーザーは使用されています',
          });
        });
      } else {
        next(err)
      }
    } else {
      res.redirect(req.baseUrl);
    }
  });
});

module.exports = router;
