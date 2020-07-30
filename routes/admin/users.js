var express = require('express');
var router = express.Router();

var connection = require('../../db/mysqlconfig.js');
const security = require('../../util/security');
const hash = require('../../util/hash').digest;
const tool = require('../../util/tool');

// TOPページ
router.get('/', security.authorize(), function (req, res, next) {
  const query = 'select * from users where ymd_end = "99991231" order by id asc';
  connection.query(query, function (err, results, fields) {
    if (err) { next(err) };
    res.render('admin/users', {
      users: results,
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
  const query = 'select * from users where id = "' + id + '" and ymd_end = "99991231" order by id asc';
  connection.query(query, function (err, results, fields) {
    if (err) { next(err) };
    res.render('admin/userform', {
      user: results[0],
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
  inObj.id_upd = req.user;

  const query = 'insert into users values ("' + inObj.id + '","' + inObj.name + '","' + inObj.pwd + '","' + inObj.role + '", "' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
  connection.query(query, function (err, results, fields) {
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
  inObj.ymd_upd = tool.getToday();
  inObj.id_upd = req.user;
  const query = 'update users set name = "' + inObj.name + '", password = "' + inObj.password + '", role = "' + inObj.role + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_ymd + '" where id = "' + inObj.id + '" and ymd_end = "99991231"';
  connection.query(query, function (err, results, fields) {
    if (err) { next(err) };
    //更新時に対象レコードが存在しない場合
    if (results.changedRows === 0) {
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
  const query = 'update users set ymd_end = "' + tool.getToday() + '" where id = "' + id + '" and ymd_end = "99991231"';
  connection.query(query, function (err, results, fields) {
    if (err) {
      // 外部制約参照エラーの場合
      if (err.errno === 1451) {
        connection.query('select * from users where id = "' + id + '" and ymd_end = "99991231"', function (err, results, fields) {
          if (err) { next(err) };
          res.render('admin/userform', {
            user: results[0],
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
