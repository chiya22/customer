var express = require('express');
var router = express.Router();

var connection = require('../../db/mysqlconfig.js');
const security = require('../../util/security');

// 会社メニュー
router.get('/', security.authorize(), function (req, res, next) {
  connection.query('select id, name from companies limit 50', function (error, results, fields) {
    if (error) throw error;
    res.render('admin/companies', {
      companies: results,
    });
  });
});

// 会社メニューから登録画面（companiesForm）へ
router.get('/insert', security.authorize(), function (req, res, next) {
  res.render('admin/companiesform', {
    company: null,
    mode: 'insert',
  });
});

//会社IDを指定して更新画面（companiesForm）へ
router.get('/update/:id', security.authorize(), function (req, res, next) {
  const id = req.params.id;
  connection.query('select * from companies where id = "' + id + '"', function (error, results, fields) {
    if (error) throw error;
    res.render('admin/companiesform', {
      company: results[0],
      mode: 'update',
    });
  });
});

//会社情報の登録
router.post('/insert', security.authorize(), function (req, res, next) {
  const id = req.body.id;
  const id_nyukyo = req.body.id_nyukyo;
  const id_kaigi = req.body.id_kaigi;
  const name = req.body.name;
  const kana = req.body.kana;
  const bikou = req.body.bikou;

  const query = 'insert into companies values ("' + id + '","' + id_nyukyo + '","' + id_kaigi + '","' + name + '","' + kana + '", "20200701", "99991231", "' + bikou + '")';
  connection.query(query, function (error, results, fields) {
    if (error) throw error;
    res.redirect(req.baseUrl);
  });
});

//会社情報の更新
router.post('/update/update', security.authorize(), function (req, res, next) {
  const id = req.body.id;
  const id_nyukyo = req.body.id_nyukyo;
  const id_kaigi = req.body.id_kaigi;
  const name = req.body.name;
  const kana = req.body.kana;
  const bikou = req.body.bikou;
  const query = 'update companies set id_nyukyo = "' + id_nyukyo + '", id_kaigi = "' + id_kaigi + '", name = "' + name + '", kana = "' + kana + '", bikou = "' + bikou + '" where id = "' + id + '"';
  connection.query(query, function (error, results, fields) {
    if (error) throw error;
    res.redirect(req.baseUrl);
  });
});

//会社情報の削除
router.post('/update/delete', security.authorize(), function (req, res, next) {
  const id = req.body.id;
  const query = 'delete from companies where id = "' + id + '"';
  connection.query(query, function (error, results, fields) {
    if (error) throw error;
    res.redirect(req.baseUrl);
  });
});

module.exports = router;
