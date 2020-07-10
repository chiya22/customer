var express = require('express');
var router = express.Router();

const security = require('../util/security');

const m_nyukyo = require('../model/nyukyos');
const m_company = require('../model/company');
const m_person = require('../model/person');
const m_relation_comroom = require('../model/relation_comroom');

// TOPページから「登録」ボタンでの遷移
router.get('/', security.authorize(), function (req, res, next) {
  m_nyukyo.findForSelect((err, retObj) => {
    if (err) { throw err; }
    res.render('companyform', {
      company: null,
      nyukyos: retObj,
      id_nyukyo: null,
      mode: 'insert',
    });
  })
});

// TOPページから「会社リンク選択」での会社ページへの遷移
router.get('/:id', security.authorize(), function (req, res, next) {
  const id_company = req.params.id;
  let company;
  let persons;
  m_company.findPKey(id_company, (err, retObj) => {
    if (err) { throw err; }
    company = retObj;
    m_person.findByCompany(id_company, (err, retObj) => {
      if (err) { throw err; }
      persons = retObj;
      m_relation_comroom.findByCompany(id_company, (err, retObj) => {
        if (err) { throw err; }
        res.render('company', {
          company: company,
          persons: persons,
          rooms: retObj,
        });
      });
    });
  });
});

// 会社ページから「更新」リンクでの会社（編集）ページへの遷移
router.get('/update/:id', security.authorize(), function (req, res, next) {
  const id_company = req.params.id;
  let company;
  m_company.findPKey(id_company, (err, retObj) => {
    if (err) { throw (err); }
    company = retObj;
    m_nyukyo.findForSelect((err, retObj) => {
      if (err) { throw err; }
      res.render('companyform', {
        company: company,
        nyukyos: retObj,
        id_nyukyo: null,
        mode: 'update',
      });
    })
  });
});

// 会社ページから「削除」リンクでの会社（編集）ページへの遷移
router.get('/delete/:id', security.authorize(), function (req, res, next) {
  const id_company = req.params.id;
  m_company.findPKey(id_company, (err, retObj) => {
    if (err) { throw (err); }
    res.render('companyform', {
      company: retObj,
      id_nyukyo: null,
      mode: 'delete',
    });
  })
});

// 入居番号ページから「会社登録」リンクでの会社（編集）ページへの遷移
router.get('/insert/:id', security.authorize(), function (req, res, next) {
  const id_nyukyo = req.params.id;
  m_nyukyo.find((err, retObj) => {
    if (err) { throw err; }
    res.render('companyform', {
      company: null,
      nyukyos: retObj,
      id_nyukyo: id_nyukyo,
      mode: 'insert',
    });
  });
});

// 会社情報の登録
router.post('/insert', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.body.id;
  inObj.id_nyukyo = req.body.id_nyukyo;
  inObj.id_kaigi = req.body.id_kaigi;
  inObj.name = req.body.name;
  inObj.kana = req.body.kana;
  inObj.bikou = req.body.bikou;
  m_company.insert(inObj, (err, retObj) => {
    if (err) { throw err; }
    res.redirect('/top');
  });
});

//会社情報の更新
router.post('/update', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.body.id;
  inObj.id_nyukyo = req.body.id_nyukyo;
  inObj.id_kaigi = req.body.id_kaigi;
  inObj.name = req.body.name;
  inObj.kana = req.body.kana;
  inObj.bikou = req.body.bikou;
  m_company.update(inObj, (err, retObj) => {
    if (err) { throw err; }
    res.redirect('/top');
    // res.redirect(req.baseUrl);
  });
});

//会社情報の削除
router.post('/delete', security.authorize(), function (req, res, next) {
  const id = req.body.id;
  m_company.remove(id, (err, retObj) => {
    if (err) { throw err; }
    res.redirect('/top');
    // res.redirect(req.baseUrl);
  });
});

module.exports = router;
