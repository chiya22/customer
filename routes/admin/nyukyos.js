var express = require('express');
var router = express.Router();

const security = require('../../util/security');

const m_nyukyo = require('../../model/nyukyos');

// TOPページ
router.get('/', security.authorize(), function (req, res, next) {
  m_nyukyo.find( (err, retObj) => {
    if (err) {
      throw err;
    }
    res.render('admin/nyukyos', {
      nyukyos: retObj,
    });
  });
});

// メニューから登録画面（nyukyoForm）へ
router.get('/insert', security.authorize(), function (req, res, next) {
  res.render('admin/nyukyoform', {
    nyukyo: null,
    mode: 'insert',
  });
});

//入居番号IDを指定して更新画面（nyukyoForm）へ
router.get('/update/:id', security.authorize(), function (req, res, next) {
  const id = req.params.id;
  m_nyukyo.findPKey( id, (err, retObj) => {
    if (err) throw err;
    res.render('admin/nyukyoform', {
      nyukyo: retObj,
      mode: 'update',
    });
  });
});

//入居番号情報の登録
router.post('/insert', security.authorize(), function (req, res, next) {

  let inObj = {};
  inObj.id = req.body.id;
  m_nyukyo.insert(inObj, (err, retObj) => {
    if (err) throw err;
    res.redirect(req.baseUrl);
  });
});

//入居番号情報の更新
router.post('/update', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.body.id;
  inObj.ymd_start = req.body.ymd_start;
  inObj.ymd_end = req.body.ymd_end;
  m_nyukyo.update(inObj, (err,retObj) => {
    if (err) throw err;
    res.redirect(req.baseUrl);
  });
});

//入居番号情報の削除
router.post('/delete', security.authorize(), function (req, res, next) {
  const id = req.body.id;
  m_nyukyo.remove( id, (err, retObj) => {
    if (err) throw err;
    res.redirect(req.baseUrl);
  });
});

module.exports = router;
