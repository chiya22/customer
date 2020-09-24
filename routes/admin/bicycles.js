var express = require('express');
var router = express.Router();

const security = require('../../util/security');
const tool = require('../../util/tool');

const m_bicycle = require('../../model/bicycles');

// TOPページ
router.get('/', security.authorize(), function (req, res, next) {
  // m_bicycle.find( (err, retObj) => {
    m_bicycle.findForAdmin( (err, retObj) => {
      if (err) { next(err) };
    res.render('admin/bicycles', {
      bicycles: retObj,
    });
  });
});

// メニューから登録画面（bicycleForm）へ
router.get('/insert', security.authorize(), function (req, res, next) {
  res.render('admin/bicycleform', {
    bicycle: null,
    mode: 'insert',
    message: null,
  });
});

//部屋IDを指定して更新画面（roomForm）へ
router.get('/update/:id', security.authorize(), function (req, res, next) {
  const id = req.params.id;
  m_bicycle.findPKey( id, (err, retObj) => {
    if (err) { next(err) };
    res.render('admin/bicycleform', {
      bicycle: retObj,
      mode: 'update',
      message: null,
    });
  });
});

//部屋情報の登録
router.post('/insert', security.authorize(), function (req, res, next) {

  let inObj = {};
  inObj.id = req.body.id;
  inObj.name = req.body.name;
  inObj.ymd_start = tool.getToday();
  inObj.ymd_upd = tool.getToday();
  inObj.id_upd = req.user.id;
  m_bicycle.insert(inObj, (err, retObj) => {
    if (err) {
      if (err.errno === 1062) {
        res.render('admin/bicycleform', {
          bicycle: null,
          mode: 'insert',
          message: '駐輪場【' + inObj.id + '】はすでに存在しています',
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
  inObj.name = req.body.name;
  inObj.ymd_start = req.body.ymd_start;
  inObj.ymd_end = req.body.ymd_end;
  inObj.before_ymd_end = req.body.before_ymd_end;
  inObj.ymd_upd = tool.getToday();
  inObj.id_upd = req.user.id;
  m_bicycle.update(inObj, (err,retObj) => {
    if (err) { next(err) };
    //更新時に対象レコードが存在しない場合
    if (retObj.changedRows === 0) {
      res.render('admin/bicycleform', {
        bicycle: inObj,
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
  let inObj = {};
  inObj.id = req.body.id;
  inObj.id_upd = req.user.id;
  m_bicycle.remove( inObj, (err, retObj) => {
    if (err) {
      // 外部制約参照エラーの場合
      if (err.errno === 1451) {
        m_room.findPKey(id, (err, retObj) => {
          if (err) { next(err)};
          res.render('admin/bicycleform', {
            bicycle: retObj,
            mode: 'update',
            message: '削除対象の駐輪場は使用されています',
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
