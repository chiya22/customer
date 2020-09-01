var express = require('express');
var router = express.Router();

const security = require('../../util/security');
const tool = require('../../util/tool');

const m_room = require('../../model/rooms');

// TOPページ
router.get('/', security.authorize(), function (req, res, next) {
  m_room.findForAdmin( (err, retObj) => {
    if (err) { next(err) };
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
    message: null,
  });
});

//部屋IDを指定して更新画面（roomForm）へ
router.get('/update/:id', security.authorize(), function (req, res, next) {
  const id = req.params.id;
  m_room.findPKey( id, (err, retObj) => {
    if (err) { next(err) };
    res.render('admin/roomform', {
      room: retObj,
      mode: 'update',
      message: null,
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
  inObj.ymd_start = tool.getToday();
  inObj.ymd_upd = tool.getToday();
  inObj.id_upd = req.user.id;
  m_room.insert(inObj, (err, retObj) => {
    if (err) {
      if (err.errno === 1062) {
        res.render('admin/roomform', {
          room: null,
          mode: 'insert',
          message: '部屋【' + inObj.id + '】はすでに存在しています',
        });
      } else {
        next(err)
      };
    } else {
      res.redirect(req.baseUrl);
    }
  });
});

//部屋情報の更新
router.post('/update', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.body.id;
  inObj.place = req.body.place;
  inObj.floor = req.body.floor;
  inObj.name = req.body.name;
  inObj.ymd_upd = tool.getToday();
  inObj.id_upd = req.user.id;
  m_room.update(inObj, (err,retObj) => {
    if (err) { next(err) };
    //更新時に対象レコードが存在しない場合
    if (retObj.changedRows === 0) {
      res.render('admin/roomform', {
        room: inObj,
        mode: 'update',
        message: '更新対象がすでに削除されています',
      });
    } else {
      res.redirect(req.baseUrl);
    }
  });
});

//部屋情報の削除
router.post('/delete', security.authorize(), function (req, res, next) {
  const id = req.body.id;
  m_room.remove( id, (err, retObj) => {
    if (err) {
      // 外部制約参照エラーの場合
      if (err.errno === 1451) {
        m_room.findPKey(id, (err, retObj) => {
          if (err) { next(err)};
          res.render('admin/roomform', {
            room: retObj,
            mode: 'update',
            message: '削除対象の部屋は使用されています',
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
