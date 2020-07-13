var express = require('express');
var router = express.Router();

const security = require('../util/security');

const m_nyukyo = require('../model/nyukyos');
const m_company = require('../model/company');
const m_cabinet = require('../model/cabinet');
const cabinet = require('../model/cabinet');

// TOPページから「入居番号リンク選択」での入居番号ページへの遷移
router.get('/:id', security.authorize(), function (req, res, next) {
  const id_nyukyo = req.params.id;
  let nyukyo;
  let companies;
  let freecabinets;
  m_nyukyo.findPKey(id_nyukyo, (err, retObj) => {
    if (err) { throw err; }
    nyukyo = retObj;
    m_company.findByNyukyo(id_nyukyo, (err, retObj) => {
      if (err) { throw err; }
      companies = retObj;
      m_cabinet.findFree((err, retObj) => {
        if (err) { throw err; }
        freecabinets = retObj;
        m_cabinet.findByNyukyo(id_nyukyo, (err, retObj) => {
          if (err) { throw err; };
          res.render('nyukyo', {
            nyukyo: nyukyo,
            companies: companies,
            freecabinets: freecabinets,
            cabinets: retObj,
          });
        });
      });
    });
  });
});

// 入居番号画面の「キャビネット追加」ボタン
router.post('/add', security.authorize(), function (req, res, next) {
  const id_nyukyo = req.body.id_nyukyo;
  const id_cabinet = req.body.id_cabinet;
  m_cabinet.findPKey(id_cabinet, (err, retObj) => {
    if (err) { throw err };
    retObj.id_nyukyo = id_nyukyo;
    m_cabinet.update(retObj, (err, retObj) => {
      res.redirect('/nyukyo/' + id_nyukyo);
    });
  });
});

router.get('/delete/:id_nyukyo/:id_cabinet', security.authorize(), function (req, res, next) {
  const id_nyukyo = req.params.id_nyukyo;
  const id_cabinet = req.params.id_cabinet;
  m_cabinet.findPKey(id_cabinet, (err, retObj) => {
    if (err) { throw err };
    // delete retObj.id_nyukyo;
    retObj.id_nyukyo = "";
    m_cabinet.update(retObj, (err, retObj) => {
      res.redirect('/nyukyo/' + id_nyukyo);
    });
  });
});

module.exports = router;
