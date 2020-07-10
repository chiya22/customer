var express = require('express');
var router = express.Router();

var connection = require('../../db/mysqlconfig.js');
const security = require('../../util/security');
const hash = require('../../util/hash').digest;

// TOPページ
router.get('/', security.authorize(), function (req, res, next) {
  connection.query('select id, name from users', function (err, results, fields) {
    if (err) throw err;
    res.render('admin/users', {
      users: results,
    });
  });
});

// メニューから登録画面（usersForm）へ
router.get('/insert', security.authorize(), function (req, res, next) {
  res.render('admin/usersform', {
    user: null,
    mode: 'insert',
  });
});

//ユーザIDを指定して更新画面（usersForm）へ
router.get('/update/:id', security.authorize(), function (req, res, next) {
  const id = req.params.id;
  connection.query('select * from users where id = "' + id + '"', function (error, results, fields) {
    if (error) throw error;
    res.render('admin/usersform', {
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
    if (err) throw eerrrror;
    res.redirect(req.baseUrl);
  });
});

//ユーザ情報の更新
router.post('/update/update', security.authorize(), function (req, res, next) {
  const id = req.body.id;
  const name = req.body.name;
  const pwd = hash(req.body.password);
  const role = req.body.role;
  const query = 'update users set name = "' + name + '", password = "' + pwd + '", role = "' + role + '" where id = "' + id + '"';
  connection.query(query, function (err, results, fields) {
    if (err) throw err;
    res.redirect(req.baseUrl);
  });
});

//ユーザ情報の削除
router.post('/update/delete', security.authorize(), function (req, res, next) {
  const id = req.body.id;
  const query = 'delete from users where id = "' + id + '"';
  connection.query(query, function (err, results, fields) {
    if (err) throw err;
    res.redirect(req.baseUrl);
  });
});

module.exports = router;
