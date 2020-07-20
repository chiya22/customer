var express = require('express');
var router = express.Router();

const security = require('../../util/security');
const tool = require('../../util/tool');

const m_nyukyo = require('../../model/nyukyos');

// TOPページ
router.get('/', security.authorize(), function (req, res, next) {
  m_nyukyo.find((err, retObj) => {
    if (err) { next(err) };
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
    message: null,
  });
});

//入居番号IDを指定して更新画面（nyukyoForm）へ
router.get('/update/:id', security.authorize(), function (req, res, next) {
  const id = req.params.id;
  m_nyukyo.findPKey(id, (err, retObj) => {
    if (err) { next(err) };
    res.render('admin/nyukyoform', {
      nyukyo: retObj,
      mode: 'update',
      message: null,
    });
  });
});

//入居番号情報の登録
router.post('/insert', security.authorize(), function (req, res, next) {

  let inObj = {};
  inObj.id = req.body.id;
  inObj.ymd_start = tool.getToday();
  inObj.ymd_upd = tool.getToday();
  inObj.id_upd = 'yoshida';
  m_nyukyo.insert(inObj, (err, retObj) => {
    if (err) {
      if (err.errno === 1062) {
        res.render('admin/nyukyoform', {
          nyukyo: null,
          mode: 'insert',
          message: '入居番号' + inObj.id + 'はすでに存在しています',
        });
      } else {
        next(err)
      };
    } else {
      res.redirect(req.baseUrl);
    }
  });
});

//入居番号情報の更新
router.post('/update', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.body.id;
  inObj.ymd_start = req.body.ymd_start;
  inObj.ymd_end = req.body.ymd_end;
  inObj.ymd_upd = tool.getToday();
  inObj.id_upd = 'yoshida';
  m_nyukyo.update(inObj, (err, retObj) => {
    if (err) { next(err) };
    //更新時に対象レコードが存在しない場合
    if (retObj.changedRows === 0) {
      res.render('admin/nyukyoform', {
        nyukyo: inObj,
        mode: 'update',
        message: '更新対象がすでに削除されています',
      });
    } else {
      res.redirect(req.baseUrl);
    }
  });
});

//入居番号情報の削除
router.post('/delete', security.authorize(), function (req, res, next) {
  const id = req.body.id;
  m_nyukyo.remove(id, (err, retObj) => {
    if (err) {
      // 外部制約参照エラーの場合
      if (err.errno === 1451) {
        m_nyukyo.findPKey(id, (err, retObj) => {
          if (err) { next(err)};
          res.render('admin/nyukyoform', {
            nyukyo: retObj,
            mode: 'update',
            message: '削除対象の入居番号は使用されています',
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
