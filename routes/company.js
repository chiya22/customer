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
    if (err) { next(err); }
    res.render('companyform', {
      company: null,
      nyukyos: retObj,
      id_nyukyo: null,
      mode: 'insert',
      message: null,
    });
  })
});

// TOPページから「会社リンク選択」での会社ページへの遷移
router.get('/:id', security.authorize(), function (req, res, next) {
  const id_company = req.params.id;
  let company;
  let persons;
  let freerooms;
  m_company.findPKey(id_company, (err, retObj) => {
    if (err) { next(err); }
    company = retObj;
    m_person.findByCompany(id_company, (err, retObj) => {
      if (err) { next(err); }
      persons = retObj;
      m_relation_comroom.findFree((err,retObj) => {
        if (err) { next(err);};
        freerooms = retObj;
        m_relation_comroom.findByCompany(id_company, (err, retObj) => {
          if (err) { next(err); }
          res.render('company', {
            company: company,
            persons: persons,
            rooms: retObj,
            freerooms: freerooms,
          });
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
    if (err) { next(err); }
    company = retObj;
    m_nyukyo.findForSelect((err, retObj) => {
      if (err) { next(err); }
      res.render('companyform', {
        company: company,
        nyukyos: retObj,
        id_nyukyo: null,
        mode: 'update',
        message: null,
      });
    });
  });
});

// 会社ページから「削除」リンクでの会社（編集）ページへの遷移
router.get('/delete/:id', security.authorize(), function (req, res, next) {
  const id_company = req.params.id;
  m_company.findPKey(id_company, (err, retObj) => {
    if (err) { next(err); }
    res.render('companyform', {
      company: retObj,
      id_nyukyo: null,
      mode: 'delete',
      message: null,
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
    //会社のidは自動採番とするため、Duplicateエラーは考慮不要
    if (err) { next(err); }
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
    if (err) { next(err); }
    if (retObj.changedRows === 0) {
      m_nyukyo.findForSelect((err, retObj) => {
        res.render('companyform', {
          company: inObj,
          nyukyos: retObj,
          id_nyukyo: null,
          mode: 'update',
          message: '更新対象がすでに削除されています',
        });
      });
    } else {
      res.redirect('/top');
    }
  });
});

//会社情報の削除
router.post('/delete', security.authorize(), function (req, res, next) {
  const id = req.body.id;
  m_company.remove(id, (err, retObj) => {
    if (err) {
      if (err.errno === 1451) {
        m_company.findPKey(id, (err, retObj) => {
          if (err) { next(err) };
          res.render('companyform', {
            company: retObj,
            id_nyukyo: null,
            mode: 'delete',
            message: '削除対象の会社は使用されています',
          });
        })
      } else {
        next(err);
      }
    } else {
      res.redirect('/top');
    }
  });
});

// 会社⇔部屋情報の追加
router.post('/add', security.authorize(), function (req, res, next) {
  const id_room = req.body.id_room;
  const id_company = req.body.id_company;
  let relation_comroom = {};
  relation_comroom.id_company = id_company;
  relation_comroom.id_room = id_room;
  m_relation_comroom.insert(relation_comroom, (err, retObj) => {
    if (err) { next(err); };
    res.redirect('/company/' + id_company);
  });
});

// 会社⇔部屋情報の削除
router.get('/delete/:id_company/:id_room', security.authorize(), function (req, res, next) {
  const id_company = req.params.id_company;
  const id_room = req.params.id_room;
  m_relation_comroom.remove(id_company, id_room, (err, retObj) => {
    if (err) { next(err); };
    res.redirect('/company/' + id_company);
  });
});


module.exports = router;
