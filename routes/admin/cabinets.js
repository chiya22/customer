var express = require('express');
var router = express.Router();

const security = require('../../util/security');

const m_cabinet = require('../../model/cabinet');

// TOPページ
router.get('/', security.authorize(), function (req, res, next) {
  m_cabinet.find( (err, retObj) => {
    if (err) {
      throw err;
    }
    res.render('admin/cabinets', {
      cabinets: retObj,
    });
  });
});

// メニューから登録画面（cabinetForm）へ
router.get('/insert', security.authorize(), function (req, res, next) {
  res.render('admin/cabinetform', {
    cabinet: null,
    mode: 'insert',
  });
});

//キャビネットIDを指定して更新画面（cabinetForm）へ
router.get('/update/:id', security.authorize(), function (req, res, next) {
  const id = req.params.id;
  m_cabinet.findPKey( id, (err, retObj) => {
    if (err) throw err;
    res.render('admin/cabinetform', {
      cabinet: retObj,
      mode: 'update',
    });
  });
});

//キャビネット情報の登録
router.post('/insert', security.authorize(), function (req, res, next) {

  let inObj = {};
  inObj.id = req.body.id;
  inObj.id_nyukyo = req.body.id_nyukyo;
  inObj.place = req.body.place;
  inObj.name = req.body.name;
  m_cabinet.insert(inObj, (err, retObj) => {
    if (err) throw err;
    res.redirect(req.baseUrl);
  });
});

//キャビネット情報の更新
router.post('/update', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.body.id;
  inObj.id_nyukyo = req.body.id_nyukyo;
  inObj.place = req.body.place;
  inObj.name = req.body.name;
  m_cabinet.update(inObj, (err,retObj) => {
    if (err) throw err;
    res.redirect(req.baseUrl);
  });
});

//キャビネット情報の削除
router.post('/delete', security.authorize(), function (req, res, next) {
  const id = req.body.id;
  m_cabinet.remove( id, (err, retObj) => {
    if (err) throw err;
    res.redirect(req.baseUrl);
  });
});

module.exports = router;
