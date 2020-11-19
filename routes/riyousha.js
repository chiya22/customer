const express = require('express');
const router = express.Router();
const security = require('../util/security');
const riyousha = require("../model/riyousha");

const count_perpage = 20;

// index
router.get('/', security.authorize(), function (req, res, next) {

  res.render('riyoushas', {
    searchvalue: null,
    results: null,
    page_current: 0,
    page_max: 0,
    count_all: 0,
  });
});

//検索文字列を指定して、会社検索
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

  const query_search_riyousha = 'select r.id, r.name, r.kubun, r.kubun2, r.ymd_add from riyoushas as r where ((r.id like "%' + searchvalue + '%") or (r.name like "%' + searchvalue + '%") or (r.kana like "%' + searchvalue + '%"))';

  // 合体
  let query = '';
  let query2 = '';
  query = 'select count(*) as count_all from (' + query_search_riyousha + ') as total'
  query2 = '(' + query_search_riyousha + ') order by id asc limit ' + count_perpage + ' offset ' + offset

  riyousha.selectSQL(query, (err, retObj) => {
    if (err) { next(err) };
    let count_all;
    count_all = retObj[0].count_all;
    let pagecount_max = parseInt(count_all / count_perpage);
    if ((count_all % count_perpage) > 0) {
      pagecount_max += 1;
    }

    riyousha.selectSQL(query2, (err, retObj) => {
      if (err) { next(err) };
      res.render('riyoushas', {
        searchvalue: searchvalue,
        results: retObj,
        page_current: pagecount_target,
        page_max: pagecount_max,
        count_all: count_all,
      });
    });
  });
});

// TOPページから「会社リンク選択」での会社ページへの遷移
router.get('/:id', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.params.id;

  //利用者情報の取得
  riyousha.findPKey(inObj, (err, retObj) => {
    if (err) { next(err); }
      res.render('riyousha', {
        riyousha: retObj,
      });
    });
});


module.exports = router;
