var express = require('express');
var router = express.Router();

var connection = require('../../db/mysqlconfig.js');
const security = require('../../util/security');

const m_company = require('../../model/company');

const count_perpage = 10;

// 会社メニュー
router.get('/', security.authorize(), function (req, res, next) {
  res.render('admin/companies', {
    searchvalue: null,
    results: null,
    page_current: 0,
    page_max: 0,
    count_all: 0,
  });
});

router.post('/', security.authorize(), function (req, res, next) {

  const searchvalue = req.body.searchvalue;        //検索文字列
  const pagecount_current = req.body.page_current; //現在表示されているページ
  const page_action = req.body.pageaction;         //ページングアクション

  //ページングアクションにより、表示対象のページ数を確定する
  let pagecount_target;
  if (page_action === 'next') {
    pagecount_target = parseInt(pagecount_current) + 1;
  } else if (page_action === 'prev') {
    pagecount_target = parseInt(pagecount_current) - 1;
  } else {
    pagecount_target = 1;
  }
  //表示開始位置を確定する
  const offset = (pagecount_target - 1) * count_perpage;

  m_company.findLikeCount(searchvalue, (err, retObj) => {
    if (err) {
      throw err;
    }
    let count_all = retObj;
    const pagecount_max = parseInt(count_all / count_perpage) + 1;
    m_company.findLikeForPaging(searchvalue, count_perpage, offset, (err, retObj) => {
      if (err) {
        throw err;
      }
      res.render('admin/companies', {
        searchvalue: searchvalue,
        results: retObj,
        page_current: pagecount_target,
        page_max: pagecount_max,
        count_all: count_all,
      });
    });
  });
});

// 会社メニューから登録画面（companiesForm）へ
router.get('/insert', security.authorize(), function (req, res, next) {
  res.render('admin/companiesform', {
    company: null,
    mode: 'insert',
  });
});

//会社IDを指定して更新画面（companiesForm）へ
router.get('/update/:id', security.authorize(), function (req, res, next) {
  const id = req.params.id;
  m_company.findPKey(id, (err, retObj) => {
    if (err) {
      throw err;
    }
    res.render('admin/companiesform', {
      company: retObj,
      mode: 'update',
    });
  });
});

//会社情報の登録
router.post('/insert', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.body.id;
  inObj.id_nyukyo = req.body.id_nyukyo;
  inObj.id_kaigi = req.body.id_kaigi;
  inObj.name = req.body.name;
  inObj.kana = req.body.kana;
  inObj.bikou = req.body.bikou;

  m_company.insert(inObj, (err, retObj) => {
    if (err) {
      throw err;
    }
    res.redirect(req.baseUrl);
  });
});

//会社情報の更新
router.post('/update/update', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.body.id;
  inObj.id_nyukyo = req.body.id_nyukyo;
  inObj.id_kaigi = req.body.id_kaigi;
  inObj.name = req.body.name;
  inObj.kana = req.body.kana;
  inObj.bikou = req.body.bikou;
  m_company.update(inObj, (err, retObj) => {
    if (err) {
      throw err;
    }
    res.redirect(req.baseUrl);
  });
});

//会社情報の削除
router.post('/update/delete', security.authorize(), function (req, res, next) {
  const id = req.body.id;
  m_company.remove(id, (err, retObj) => {
    if (err) {
      throw err;
    }
    res.redirect(req.baseUrl);
  });
});

module.exports = router;
