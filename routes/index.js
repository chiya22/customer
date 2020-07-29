var express = require('express');
var router = express.Router();
const security = require('../util/security');
var connection = require('../db/mysqlconfig.js');

//認証画面の初期表示
router.get('/login', function (req, res) {
  res.render("./login.ejs", { message: req.flash("message") });
});

//認証画面の入力
router.post('/login', security.authenticate());

//ログアウト
router.post("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

const count_perpage = 4;

// index
router.get('/', security.authorize(), function (req, res, next) {
  res.render('index', {
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

  const query = 'select count(*) as count_all from ((select "company" AS kubun, c.id, c.name, c.kana from companies as c where ((c.name like "%' + searchvalue + '%") or (c.kana like "%' + searchvalue + '%") or (c.id_nyukyo like "%' + searchvalue + '%")) and c.ymd_end = "99991231") union all (select "person" AS kubun, p.id, p.name, p.kana from persons as p where ((p.name like "%' + searchvalue + '%") or (p.kana like "%' + searchvalue + '%")) and p.ymd_end = "99991231")) as total'
  connection.query(query, function (error, results, fields) {
    if (error) { next(error) };
    let count_all;
    count_all = results[0].count_all;
    const pagecount_max = parseInt(count_all / count_perpage) + 1;
    const query2 = '(select "会社" AS header, c.id, c.id_nyukyo as id_nyukyo, c.kubun_company as kubun, c.name, c.kana, c.ymd_nyukyo, c.ymd_kaiyaku from companies as c where ((c.name like "%' + searchvalue + '%") or (c.kana like "%' + searchvalue + '%") or (c.id_nyukyo like "%' + searchvalue + '%")) and c.ymd_end = "99991231") union all (select "個人" AS header, p.id, NULL as id_nyukyo, p.kubun_person as kubun, p.name, p.kana, p.ymd_nyukyo, p.ymd_kaiyaku from persons as p where ((p.name like "%' + searchvalue + '%") or (p.kana like "%' + searchvalue + '%")) and p.ymd_end = "99991231") order by header asc, ymd_kaiyaku desc, ymd_nyukyo asc limit ' + count_perpage + ' offset ' + offset
    connection.query(query2, function (error, results, fields) {
      if (error) { next(error) };
      res.render('index', {
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
