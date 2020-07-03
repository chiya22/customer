var express = require('express');
var router = express.Router();

var connection = require('../../db/mysqlconfig.js');
const security = require('../../util/security');

// 個人メニュー
router.get('/', security.authorize(), function (req, res, next) {
  connection.query('select id, name from persons limit 50', function (error, results, fields) {
    if (error) throw error;
    res.render('admin/persons', {
      persons: results,
    });
  });
});

// 個人メニューから登録画面（companiesForm）へ
router.get('/insert', security.authorize(), function (req, res, next) {
  res.render('admin/personsform', {
    person: null,
    mode: 'insert',
  });
});

//個人IDを指定して更新画面（companiesForm）へ
router.get('/update/:id', security.authorize(), function (req, res, next) {
  const id = req.params.id;
  connection.query('select * from persons where id = "' + id + '"', function (error, results, fields) {
    if (error) throw error;
    res.render('admin/personsform', {
      person: results[0],
      mode: 'update',
    });
  });
});

//個人情報の登録
router.post('/insert', security.authorize(), function (req, res, next) {
  const id = req.body.id;
  const id_company = req.body.id_company;
  const name = req.body.name;
  const kana = req.body.kana;
  const telno = req.body.telno;
  const telno_mobile = req.body.telno_mobile;
  const email = req.body.email;
  const no_yubin = req.body.no_yubin;
  const todoufuken = req.body.todoufuken;
  const address = req.body.address;
  const bikou = req.body.bikou;

  const query = 'insert into persons values ("' + id + '","' + id_company + '","' + name + '","' + kana + '", "' + telno + '", "' + telno_mobile + '", "' + email + '", "' + no_yubin + '", "' + todoufuken + '", "' + address + '", "20200701", "99991231", "' + bikou + '")';
  connection.query(query, function (error, results, fields) {
    if (error) throw error;
    res.redirect(req.baseUrl);
  });
});

//個人情報の更新
router.post('/update/update', security.authorize(), function (req, res, next) {
  const id = req.body.id;
  const id_company = req.body.id_company;
  const name = req.body.name;
  const kana = req.body.kana;
  const telno = req.body.telno;
  const telno_mobile = req.body.telno_mobile;
  const email = req.body.email;
  const no_yubin = req.body.no_yubin;
  const todoufuken = req.body.todoufuken;
  const address = req.body.address;
  const bikou = req.body.bikou;

  const query = 'update persons set id_company = "' + id_company + '", name = "' + name + '", kana = "' + kana + '", telno = "' + telno + '", telno_mobile = "' + telno_mobile + '", email = "' + email + '", no_yubin = "' + no_yubin + '", todoufuken = "' + todoufuken + '", address = "' + address + '", bikou = "' + bikou + '" where id = "' + id + '"';
  connection.query(query, function (error, results, fields) {
    if (error) throw error;
    res.redirect(req.baseUrl);
  });
});

//個人情報の削除
router.post('/update/delete', security.authorize(), function (req, res, next) {
  const id = req.body.id;
  const query = 'delete from persons where id = "' + id + '"';
  connection.query(query, function (error, results, fields) {
    if (error) throw error;
    res.redirect(req.baseUrl);
  });
});

module.exports = router;
