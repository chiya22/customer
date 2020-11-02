const express = require('express');
const router = express.Router();
const security = require('../util/security');
const company = require("../model/company");

// const log4js = require("log4js");
// const logger = log4js.configure('./config/log4js-config.json').getLogger();

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

const count_perpage = 20;

// index
router.get('/', security.authorize(), function (req, res, next) {

  // 検索条件の初期化
  let searchdetail = {};
  searchdetail.search_kubun_company_cn = "checked";
  searchdetail.search_kubun_company_on = "checked";
  searchdetail.search_kubun_company_ts = "checked";
  searchdetail.search_kubun_company_city = "checked";
  searchdetail.search_kubun_company_other = "checked";
  searchdetail.search_kubun_company_kaiyaku = "";
  searchdetail.search_kubun_person_main = "checked"
  searchdetail.search_kubun_person_nai = "checked";
  searchdetail.search_kubun_person_add = "checked"
  searchdetail.search_kubun_person_other = "checked"
  searchdetail.search_kubun_person_guest = "checked"
  searchdetail.search_kubun_person_free = "checked"
  searchdetail.search_kubun_person_kaiyaku = ""
  searchdetail.search_ymd_nyukyo_start = ""
  searchdetail.search_ymd_nyukyo_end = ""
  searchdetail.search_ymd_kaiyaku_start = ""
  searchdetail.search_ymd_kaiyaku_end = ""

  res.render('index', {
    searchvalue: null,
    searchdetail: searchdetail,
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

  // 詳細検索条件の取得
  let searchdetail = {};
  searchdetail.search_kubun_company_cn = req.body.kubun_company_cn;
  searchdetail.search_kubun_company_on = req.body.kubun_company_on;
  searchdetail.search_kubun_company_ts = req.body.kubun_company_ts;
  searchdetail.search_kubun_company_city = req.body.kubun_company_city;
  searchdetail.search_kubun_company_other = req.body.kubun_company_other;
  searchdetail.search_kubun_company_kaiyaku = req.body.kubun_company_kaiyaku;
  searchdetail.search_kubun_person_main = req.body.kubun_person_main;
  searchdetail.search_kubun_person_nai = req.body.kubun_person_nai;
  searchdetail.search_kubun_person_add = req.body.kubun_person_add;
  searchdetail.search_kubun_person_other = req.body.kubun_person_other;
  searchdetail.search_kubun_person_guest = req.body.kubun_person_guest;
  searchdetail.search_kubun_person_free = req.body.kubun_person_free;
  searchdetail.search_kubun_person_kaiyaku = req.body.kubun_person_kaiyaku;
  searchdetail.search_ymd_nyukyo_start = req.body.ymd_nyukyo_start;
  searchdetail.search_ymd_nyukyo_end = req.body.ymd_nyukyo_end;
  searchdetail.search_ymd_kaiyaku_start = req.body.ymd_kaiyaku_start;
  searchdetail.search_ymd_kaiyaku_end = req.body.ymd_kaiyaku_end;

  // 会社区分
  let search_kubun_company = '';
  let search_kubun_company_for_person = '';
  if (searchdetail.search_kubun_company_on) {
    search_kubun_company += `,'ON'`
  }
  if (searchdetail.search_kubun_company_cn) {
    search_kubun_company += `,'CN'`
  }
  if (searchdetail.search_kubun_company_ts) {
    search_kubun_company += `,'TS'`
  }
  if (searchdetail.search_kubun_company_city) {
    search_kubun_company += `,'市町村'`
  }
  if (searchdetail.search_kubun_company_other) {
    search_kubun_company += `,'その他'`
  }
  if (search_kubun_company !== '') {
    search_kubun_company_for_person = ` INNER JOIN companies as c2 ON c2.kubun_company IN (${search_kubun_company.substr(1)}) AND c2.id = p.id_company `

    if (searchdetail.search_kubun_company_kaiyaku) {
      search_kubun_company = ` AND c.kubun_company IN (${search_kubun_company.substr(1)})`
    } else {
      search_kubun_company = ` AND c.kubun_company IN (${search_kubun_company.substr(1)}) AND c.ymd_kaiyaku = '99991231'`
    }
  }

  // 個人区分
  let search_kubun_person = '';
  if (searchdetail.search_kubun_person_main) {
    search_kubun_person += `,'主'`
  }
  if (searchdetail.search_kubun_person_nai) {
    search_kubun_person += `,'人数内'`
  }
  if (searchdetail.search_kubun_person_add) {
    search_kubun_person += `,'追加'`
  }
  if (searchdetail.search_kubun_person_other) {
    search_kubun_person += `,'その他'`
  }
  if (searchdetail.search_kubun_person_guest) {
    search_kubun_person += `,'ゲスト'`
  }
  if (searchdetail.search_kubun_person_free) {
    search_kubun_person += `,'フリー'`
  }
  if (search_kubun_person !== '') {
    if (searchdetail.search_kubun_person_kaiyaku) {
      search_kubun_person = ` AND p.kubun_person IN (${search_kubun_person.substr(1)})`
    } else {
      search_kubun_person = ` AND p.kubun_person IN (${search_kubun_person.substr(1)}) AND p.ymd_kaiyaku = '99991231'`
    }
  }

  // 入居年月日
  let ymd_nyukyo_where_company = '';
  let ymd_nyukyo_where_person = '';
  if ((searchdetail.search_ymd_nyukyo_start) && (searchdetail.search_ymd_nyukyo_end)) {
    ymd_nyukyo_where_company = `AND '${searchdetail.search_ymd_nyukyo_start}' <= c.ymd_nyukyo AND c.ymd_nyukyo <= '${searchdetail.search_ymd_nyukyo_end}'`
    ymd_nyukyo_where_person = `AND '${searchdetail.search_ymd_nyukyo_start}' <= p.ymd_nyukyo AND p.ymd_nyukyo <= '${searchdetail.search_ymd_nyukyo_end}'`
  } else if (searchdetail.search_ymd_nyukyo_start) {
    ymd_nyukyo_where_company = `AND '${searchdetail.search_ymd_nyukyo_start}' <= c.ymd_nyukyo`
    ymd_nyukyo_where_person = `AND '${searchdetail.search_ymd_nyukyo_start}' <= p.ymd_nyukyo`
  } else if (searchdetail.search_ymd_nyukyo_end) {
    ymd_nyukyo_where_company = `AND c.ymd_nyukyo <= '${searchdetail.search_ymd_nyukyo_end}'`
    ymd_nyukyo_where_person = `AND p.ymd_nyukyo <= '${searchdetail.search_ymd_nyukyo_end}'`
  }

  // 解約年月日
  let ymd_kaiyaku_where_company = '';
  let ymd_kaiyaku_where_person = '';
  if ((searchdetail.search_ymd_kaiyaku_start) && (searchdetail.search_ymd_kaiyaku_end)) {
    ymd_kaiyaku_where_company = `AND '${searchdetail.search_ymd_kaiyaku_start}' <= c.ymd_kaiyaku AND c.ymd_kaiyaku <= '${searchdetail.search_ymd_kaiyaku_end}'`
    ymd_kaiyaku_where_person = `AND '${searchdetail.search_ymd_kaiyaku_start}' <= p.ymd_kaiyaku AND p.ymd_kaiyaku <= '${searchdetail.search_ymd_kaiyaku_end}'`
  } else if (searchdetail.search_ymd_kaiyaku_start) {
    ymd_kaiyaku_where_company = `AND '${searchdetail.search_ymd_kaiyaku_start}' <= c.ymd_kaiyaku and c.ymd_kaiyaku <> '99991231'`
    ymd_kaiyaku_where_person = `AND '${searchdetail.search_ymd_kaiyaku_start}' <= p.ymd_kaiyaku and p.ymd_kaiyaku <> '99991231'`
  } else if (searchdetail.search_ymd_kaiyaku_end) {
    ymd_kaiyaku_where_company = `AND c.ymd_kaiyaku <= '${searchdetail.search_ymd_kaiyaku_end}'`
    ymd_kaiyaku_where_person = `AND p.ymd_kaiyaku <= '${searchdetail.search_ymd_kaiyaku_end}'`
  }

  // 会社、個人のクエリ作成
  let query_search_company = '';
  let query_search_person = '';
  if (search_kubun_company) {
    query_search_company = 'select "company" AS kubun, c.id, c.name, c.kana from companies as c where ((c.name like "%' + searchvalue + '%") or (c.name_other like "%' + searchvalue + '%") or (c.kana like "%' + searchvalue + '%") or (c.id_nyukyo like "%' + searchvalue + '%")) and c.ymd_end = "99991231"' + ymd_nyukyo_where_company + ymd_kaiyaku_where_company + search_kubun_company;
    query_search_company2 = 'select "会社" AS header, case c.ymd_kaiyaku when "99991231" then "" else "解約" end as kaiyakuKubun, c.id, c.id_nyukyo as id_nyukyo, c.kubun_company as kubun, c.name, c.kana, c.ymd_nyukyo, c.ymd_kaiyaku from companies as c where ((c.name like "%' + searchvalue + '%") or (c.name_other like "%' + searchvalue + '%") or (c.kana like "%' + searchvalue + '%") or (c.id_nyukyo like "%' + searchvalue + '%")) and c.ymd_end = "99991231" ' + ymd_nyukyo_where_company + ymd_kaiyaku_where_company + search_kubun_company
  }
  if (search_kubun_person) {
    query_search_person = 'select "person" AS kubun, p.id, p.name, p.kana from persons as p ' + search_kubun_company_for_person + ' where ((p.name like "%' + searchvalue + '%") or (p.kana like "%' + searchvalue + '%")) and p.ymd_end = "99991231" ' + ymd_nyukyo_where_person + ymd_kaiyaku_where_person + search_kubun_person;
    query_search_person2 = 'select "個人" AS header, case p.ymd_kaiyaku when "99991231" then "" else "解約" end as kaiyakuKubun, p.id, NULL as id_nyukyo, p.kubun_person as kubun, p.name, p.kana, p.ymd_nyukyo, p.ymd_kaiyaku from persons as p ' + search_kubun_company_for_person + ' where ((p.name like "%' + searchvalue + '%") or (p.kana like "%' + searchvalue + '%")) and p.ymd_end = "99991231" ' + ymd_nyukyo_where_person + ymd_kaiyaku_where_person + search_kubun_person
  }

  // 合体
  let query = '';
  let query2 = '';
  if ((query_search_company) && (query_search_person)) {
    query = 'select count(*) as count_all from (( ' + query_search_company + ') union all (' + query_search_person + ')) as total'
    query2 = '(' + query_search_company2 + ') union all (' + query_search_person2 + ') order by kaiyakuKubun asc, header asc, id_nyukyo asc, ymd_kaiyaku desc, ymd_nyukyo asc limit ' + count_perpage + ' offset ' + offset
  } else if (query_search_company) {
    query = 'select count(*) as count_all from ( ' + query_search_company + ') as total'
    query2 = '(' + query_search_company2 + ') order by kaiyakuKubun asc, header asc, id_nyukyo asc, ymd_kaiyaku desc, ymd_nyukyo asc limit ' + count_perpage + ' offset ' + offset
  } else if (query_search_person) {
    query = 'select count(*) as count_all from ( ' + query_search_person + ') as total'
    query2 = '(' + query_search_person2 + ') order by kaiyakuKubun asc, header asc, id_nyukyo asc, ymd_kaiyaku desc, ymd_nyukyo asc limit ' + count_perpage + ' offset ' + offset
  }

  company.selectSQL(query, (err, retObj) => {
    if (err) { next(err) };
    let count_all;
    count_all = retObj[0].count_all;
    let pagecount_max = parseInt(count_all / count_perpage);
    if ((count_all % count_perpage) > 0) {
      pagecount_max += 1;
    }

    company.selectSQL(query2, (err, retObj) => {
      if (err) { next(err) };
      res.render('index', {
        searchvalue: searchvalue,
        searchdetail: searchdetail,
        results: retObj,
        page_current: pagecount_target,
        page_max: pagecount_max,
        count_all: count_all,
      });
    });
  });
});

module.exports = router;
