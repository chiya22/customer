var express = require('express');
var router = express.Router();

const security = require('../util/security');

const m_nyukyo = require('../model/nyukyos');
const m_company = require('../model/company');
const m_cabinet = require('../model/cabinet');

// TOPページから「入居番号リンク選択」での入居番号ページへの遷移
router.get('/:id', security.authorize(), function (req, res, next) {
  const id_nyukyo = req.params.id;
  let nyukyo;
  let companies;
  m_nyukyo.findPKey(id_nyukyo, (err, retObj) => {
    if (err) { throw err; }
    nyukyo = retObj;
    m_company.findByNyukyo(id_nyukyo, (err, retObj) => {
      if (err) { throw err; }
      companies = retObj;
      m_cabinet.findByNyukyo(id_nyukyo, (err, retObj) => {
        if (err) { throw err; }
        res.render('nyukyo', {
          nyukyo: nyukyo,
          companies: companies,
          cabinets: retObj,
        });
      });
    });
  });
});

module.exports = router;
