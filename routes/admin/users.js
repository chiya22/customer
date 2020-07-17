var express = require('express');
var router = express.Router();

var connection = require('../../db/mysqlconfig.js');
const security = require('../../util/security');
const hash = require('../../util/hash').digest;

// TOPページ
router.get('/', security.authorize(), function (req, res, next) {
  connection.query('select id, name from users', function (err, results, fields) {
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
  });
});

//ユーザIDを指定して更新画面（usersForm）へ
router.get('/update/:id', security.authorize(), function (req, res, next) {
  const id = req.params.id;
  connection.query('select * from users where id = "' + id + '"', function (err, results, fields) {
    if (err) { next(err) };
    res.render('admin/userform', {
      user: results[0],
      mode: 'update',
    });
  });
});

//ユーザ情報の登録
router.post('/insert', security.authorize(), function (req, res, next) {
  const id = req.body.id;
  const name = req.body.name;
  const pwd = hash(req.body.password);
  const role = req.body.role;

  const query = 'insert into users values ("' + id + '","' + name + '","' + pwd + '","' + role + '")';
  connection.query(query, function (err, results, fields) {
    if (err) {
      if (err.errno === 1062) {
        res.render('admin/roomform', {
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
  const id = req.body.id;
  const name = req.body.name;
  const pwd = hash(req.body.password);
  const role = req.body.role;
  inObj.id = id;
  inObj.name = name;
  inObj.password = pwd;
  inObj.role = role;
  const query = 'update users set name = "' + name + '", password = "' + pwd + '", role = "' + role + '" where id = "' + id + '"';
  connection.query(query, function (err, results, fields) {
    if (err) { next(err) };
    //更新時に対象レコードが存在しない場合
    if (retObj.changedRows === 0) {
      res.render('admin/userform', {
        room: inObj,
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
  const query = 'delete from users where id = "' + id + '"';
  connection.query(query, function (err, results, fields) {
    if (err) {
      // 外部制約参照エラーの場合
      if (err.errno === 1451) {
        connection.query('select * from users where id = "' + id + '"', function (err, results, fields) {
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
