var express = require('express');
var router = express.Router();

const security = require('../util/security');
const m_company = require('../model/company');
const m_person = require('../model/person');

// 会社ページから「登録」ボタンでの個人ページへ遷移
router.get('/insert/:id_company', security.authorize(), function (req, res, next) {
  const id_company = req.params.id_company;
  m_company.findForSelect((err, retObj) => {
    if (err) { throw err };
    res.render('personform', {
      id_company: id_company,
      person: null,
      companies: retObj,
      mode: 'insert',
    });
  })
});

// TOPページから「個人登録」で個人（編集）ページへの遷移
router.get('/insert', security.authorize(), function (req, res, next) {
  m_company.findForSelect((err, retObj) => {
    if (err) { throw err };
    res.render('personform', {
      id_company: null,
      person: null,
      companies: retObj,
      mode: 'insert',
    });
  });
});

// TOPページから「個人リンク選択」での個人ページへ遷移
router.get('/:id', security.authorize(), function (req, res, next) {
  const id_person = req.params.id;
  m_person.findPKey(id_person, (err, retObj) => {
    if (err) { throw err; }
    res.render('person', {
      person: retObj,
    });
  });
});


// 個人ページから「更新」リンクでの個人（編集）ページへの遷移
router.get('/update/:id', security.authorize(), function (req, res, next) {
  const id_person = req.params.id;
  let companies;
  m_company.findForSelect((err, retObj) => {
    if (err) { throw err };
    companies = retObj;
    m_person.findPKey(id_person, (err, retObj) => {
      if (err) { throw (err); }
      res.render('personform', {
        id_company: retObj.id_company,
        person: retObj,
        companies: companies,
        mode: 'update',
      });
    })
  });
});

// 個人ページから「削除」リンクでの個人（編集）ページへの遷移
router.get('/delete/:id', security.authorize(), function (req, res, next) {
  const id_person = req.params.id;
  m_person.findPKey(id_person, (err, retObj) => {
    if (err) { throw (err); }
    res.render('personform', {
      id_company: retObj.id_company,
      person: retObj,
      companies: null,
      mode: 'delete',
    });
  })
});

// 個人情報の登録
router.post('/insert', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.body.id;
  inObj.id_company = req.body.id_company;
  inObj.name = req.body.name;
  inObj.kana = req.body.kana;
  inObj.telno = req.body.telno;
  inObj.telno_mobile = req.body.telno_mobile;
  inObj.email = req.body.email;
  inObj.no_yubin = req.body.no_yubin;
  inObj.todoufuken = req.body.todoufuken;
  inObj.address = req.body.address;
  inObj.bikou = req.body.bikou;
  m_person.insert(inObj, (err, retObj) => {
    if (err) { throw err; }
    res.redirect('/company/' + inObj.id_company);
  });
});

//個人情報の更新
router.post('/update', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.body.id;
  inObj.id_company = req.body.id_company;
  inObj.name = req.body.name;
  inObj.kana = req.body.kana;
  inObj.telno = req.body.telno;
  inObj.telno_mobile = req.body.telno_mobile;
  inObj.email = req.body.email;
  inObj.no_yubin = req.body.no_yubin;
  inObj.todoufuken = req.body.todoufuken;
  inObj.address = req.body.address;
  inObj.bikou = req.body.bikou;
  m_person.update(inObj, (err, retObj) => {
    if (err) { throw err; }
    res.redirect('/company/' + inObj.id_company);
  });
});

//個人情報の削除
router.post('/delete', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.body.id;
  inObj.id_company = req.body.id_company;
  m_person.remove(inObj.id, (err, retObj) => {
    if (err) { throw err; }
    res.redirect('/company/' + inObj.id_company);
  });
});

module.exports = router;
