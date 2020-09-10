var express = require('express');
var router = express.Router();

const security = require('../../util/security');
const tool = require('../../util/tool');

const m_cabinet = require('../../model/cabinet');

// TOPページ
router.get('/', security.authorize(), function (req, res, next) {
  m_cabinet.findForAdmin((err, retObj) => {
    if (err) { next(err) };
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
    message: null,
  });
});

//キャビネットIDを指定して更新画面（cabinetForm）へ
router.get('/update/:id', security.authorize(), function (req, res, next) {
  const id = req.params.id;
  let cabinet;
  m_cabinet.findPKey(id, (err, retObj) => {
    if (err) { next(err) };
    res.render('admin/cabinetform', {
      cabinet: retObj,
      mode: 'update',
      message: null,
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
  inObj.ymd_start = tool.getToday();
  inObj.ymd_upd = tool.getToday();
  inObj.id_upd = req.user.id;
  m_cabinet.insert(inObj, (err, retObj) => {
    if (err) {
      if (err.errno === 1062) {
        res.render('admin/cabinetform', {
          cabinet: null,
          mode: 'insert',
          message: 'キャビネット【' + inObj.id + '】はすでに存在しています',
        });
      } else {
        next(err)
      };
    } else {
      res.redirect(req.baseUrl);
    }
  });
});

//キャビネット情報の更新
router.post('/update', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.body.id;
  inObj.place = req.body.place;
  inObj.name = req.body.name;
  inObj.ymd_start = req.body.ymd_start;
  inObj.ymd_end = req.body.ymd_end;
  inObj.ymd_upd = tool.getToday();
  inObj.id_upd = req.user.id;
  inObj.before_ymd_end = req.body.before_ymd_end;
  m_cabinet.update(inObj, (err, retObj) => {
    if (err) { next(err) };
    //更新時に対象レコードが存在しない場合
    if (retObj.changedRows === 0) {
      res.render('admin/cabinetform', {
        cabinet: inObj,
        mode: 'update',
        message: '更新対象がすでに削除されています',
      });
    } else {
      res.redirect(req.baseUrl);
    }
  });
});

//キャビネット情報の削除
router.post('/delete', security.authorize(), function (req, res, next) {
  const id = req.body.id;
  let cabinet;
  m_cabinet.remove(id, (err, retObj) => {
    if (err) {
      // 外部制約参照エラーの場合
      if (err.errno === 1451) {
        m_cabinet.findPKey(id, (err, retObj) => {
          if (err) { next(err) };
          res.render('admin/cabinetform', {
            cabinet: retObj,
            mode: 'update',
            message: '削除対象のキャビネットは使用されています',
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
