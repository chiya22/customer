var express = require('express');
var router = express.Router();

var connection = require('../db/mysqlconfig.js');
const security = require('../util/security');

const count_perpage = 10;

// TOPページ
router.get('/', security.authorize(), function (req, res, next) {
  res.render('top', {
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

  connection.query('select count(*) as count_all from ((select "company" AS kubun, c.id, c.name, c.kana from companies as c where (c.name like "%' + searchvalue + '%") or (c.kana like "%' + searchvalue + '%")) union all (select "person" AS kubun, p.id, p.name, p.kana from persons as p where (p.name like "%' + searchvalue + '%") or (p.kana like "%' + searchvalue + '%")) union all (select "nyukyo" AS kubun, n.id, null, null from nyukyos as n where n.id like "%' + searchvalue + '%")) as total', function (error, results, fields) {
    if (error) throw error;
    let count_all;
    count_all = results[0].count_all;
    const pagecount_max = parseInt(count_all / count_perpage) + 1;
    connection.query('(select "company" AS kubun, c.id, c.name, c.kana from companies as c where (c.name like "%' + searchvalue + '%") or (c.kana like "%' + searchvalue + '%")) union all (select "person" AS kubun, p.id, p.name, p.kana from persons as p where (p.name like "%' + searchvalue + '%") or (p.kana like "%' + searchvalue + '%")) union all (select "nyukyo" AS kubun, n.id, null, null from nyukyos as n where n.id like "%' + searchvalue + '%") limit ' + count_perpage + ' offset ' + offset, function (error, results, fields) {
      if (error) throw error;
      res.render('top', {
        searchvalue: searchvalue,
        results: results,
        page_current: pagecount_target,
        page_max: pagecount_max,
        count_all: count_all,
      });
    });
  });
});

module.exports = router;
