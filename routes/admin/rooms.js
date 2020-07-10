var express = require('express');
var router = express.Router();

const security = require('../../util/security');

const m_room = require('../../model/rooms');

// TOPページ
router.get('/', security.authorize(), function (req, res, next) {
  m_room.find( (err, retObj) => {
    if (err) {throw err;}
    res.render('admin/rooms', {
      rooms: retObj,
    });
  });
});

// メニューから登録画面（roomForm）へ
router.get('/insert', security.authorize(), function (req, res, next) {
  res.render('admin/roomform', {
    room: null,
    mode: 'insert',
  });
});

//部屋IDを指定して更新画面（roomForm）へ
router.get('/update/:id', security.authorize(), function (req, res, next) {
  const id = req.params.id;
  m_room.findPKey( id, (err, retObj) => {
    if (err) throw err;
    res.render('admin/roomform', {
      room: retObj,
      mode: 'update',
    });
  });
});

//部屋情報の登録
router.post('/insert', security.authorize(), function (req, res, next) {

  let inObj = {};
  inObj.id = req.body.id;
  inObj.place = req.body.place;
  inObj.floor = req.body.floor;
  inObj.name = req.body.name;
  m_room.insert(inObj, (err, retObj) => {
    if (err) throw err;
    res.redirect(req.baseUrl);
  });
});

//部屋情報の更新
router.post('/update', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.body.id;
  inObj.place = req.body.place;
  inObj.floor = req.body.floor;
  inObj.name = req.body.name;
  m_room.update(inObj, (err,retObj) => {
    if (err) throw err;
    res.redirect(req.baseUrl);
  });
});

//部屋情報の削除
router.post('/delete', security.authorize(), function (req, res, next) {
  const id = req.body.id;
  m_room.remove( id, (err, retObj) => {
    if (err) throw err;
    res.redirect(req.baseUrl);
  });
});

module.exports = router;
