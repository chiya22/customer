const express = require('express');
const security = require('../util/security');
const company = require('../model/companies');

const router = express.Router();

// const log4js = require("log4js");
// const logger = log4js.configure('./config/log4js-config.json').getLogger();

//　◆認証画面の表示
router.get('/login', function (req, res) {
  res.render("./login.ejs", { message: req.flash("message") });
});

//　◆認証画面の入力
router.post('/login', security.authenticate());

//　◆ログアウト
router.post("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

const COUNT_PERPAGE = 20;

// ◆初期画面の表示
router.get('/', security.authorize(), function (req, res, next) {

  // 検索条件の初期化
  let searchdetail = {};
  searchdetail.search_kubun_company_cn = "checked";
  searchdetail.search_kubun_company_on = "checked";
  searchdetail.search_kubun_company_onl = "checked";
  searchdetail.search_kubun_company_ts = "checked";
  searchdetail.search_kubun_company_city = "checked";
  searchdetail.search_kubun_company_other = "checked";
  searchdetail.search_kubun_company_kaiyaku = "checked";
  searchdetail.search_kubun_person_main = "checked"
  searchdetail.search_kubun_person_nai = "checked";
  searchdetail.search_kubun_person_add = "checked"
  searchdetail.search_kubun_person_other = "checked"
  searchdetail.search_kubun_person_guest = "checked"
  searchdetail.search_kubun_person_free = "checked"
  searchdetail.search_kubun_person_kaiyaku = "checked"
  searchdetail.search_ymd_nyukyo_start = ""
  searchdetail.search_ymd_nyukyo_end = ""
  searchdetail.search_ymd_kaiyaku_start = ""
  searchdetail.search_ymd_kaiyaku_end = ""

  /*
  searchvalue:検索文字列
  searchdetail:検索詳細条件
  results:検索結果（表示する件数のみ）
  count_all：検索結果件数
  page_current: 現在のページ数
  page_max：最大ページ数
  */
  res.render('index', {
    searchvalue: null,
    searchdetail: searchdetail,
    results: null,
    count_all: 0,
    page_current: 0,
    page_max: 0,
  });
});

//　◆検索画面の表示
router.post('/', security.authorize(), function (req, res, next) {

  const searchvalue = req.body.searchvalue;        //検索文字列
  const pagecount_current = req.body.page_current; //現在表示されているページ
  const page_action = req.body.pageaction;         //ページングアクション(next/prev/なし)

  //ページングアクションにより、表示対象のページ数を確定
  const pagecount_target = page_action === 'next' ? parseInt(pagecount_current) + 1 : (page_action === 'prev' ? parseInt(pagecount_current) - 1: 1)

  //表示開始位置を確定する
  const offset = (pagecount_target - 1) * COUNT_PERPAGE;

  // 詳細検索条件の取得
  let searchdetail = {};
  searchdetail.search_kubun_company_cn = req.body.kubun_company_cn;
  searchdetail.search_kubun_company_on = req.body.kubun_company_on;
  searchdetail.search_kubun_company_onl = req.body.kubun_company_onl;
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

  // ここから検索条件用のSQL組み立て
  let search_kubun_company = '';
  let search_kubun_company_for_person = '';

  //   会社区分
  search_kubun_company = searchdetail.search_kubun_company_on?search_kubun_company += `,'ON'`:search_kubun_company;
  search_kubun_company = searchdetail.search_kubun_company_onl?search_kubun_company += `,'ONL'`:search_kubun_company;
  search_kubun_company = searchdetail.search_kubun_company_cn?search_kubun_company += `,'CN'`:search_kubun_company;
  search_kubun_company = searchdetail.search_kubun_company_ts?search_kubun_company += `,'TS'`:search_kubun_company;
  search_kubun_company = searchdetail.search_kubun_company_city?search_kubun_company += `,'市町村'`:search_kubun_company;
  search_kubun_company = searchdetail.search_kubun_company_other?search_kubun_company += `,'その他'`:search_kubun_company;
  if (search_kubun_company !== '') {
    search_kubun_company_for_person = ` INNER JOIN companies AS c2 ON c2.kubun_company IN (${search_kubun_company.substr(1)}) AND c2.id = p.id_company `
    // 解約した会社を対象とするかで条件を追加
    if (searchdetail.search_kubun_company_kaiyaku) {
      search_kubun_company = ` AND c.kubun_company IN (${search_kubun_company.substr(1)})`
    } else {
      search_kubun_company = ` AND c.kubun_company IN (${search_kubun_company.substr(1)}) AND c.ymd_kaiyaku = '99991231'`
    }
  }

  // 個人区分
  let search_kubun_person = '';
  search_kubun_person = searchdetail.search_kubun_person_main? search_kubun_person += `,'主'`:search_kubun_person;
  search_kubun_person = searchdetail.search_kubun_person_nai? search_kubun_person += `,'人数内'`:search_kubun_person;
  search_kubun_person = searchdetail.search_kubun_person_add? search_kubun_person += `,'追加'`: search_kubun_person;
  search_kubun_person = searchdetail.search_kubun_person_other? search_kubun_person += `,'その他'`:search_kubun_person;
  search_kubun_person = searchdetail.search_kubun_person_guest? search_kubun_person += `,'ゲスト'`:search_kubun_person;
  search_kubun_person = searchdetail.search_kubun_person_free? search_kubun_person += `,'フリー'`:search_kubun_person;
  if (search_kubun_person !== '') {
    // 解約した人を対象とするかで条件を追加
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
    ymd_kaiyaku_where_company = `AND '${searchdetail.search_ymd_kaiyaku_start}' <= c.ymd_kaiyaku AND c.ymd_kaiyaku <> '99991231'`
    ymd_kaiyaku_where_person = `AND '${searchdetail.search_ymd_kaiyaku_start}' <= p.ymd_kaiyaku AND p.ymd_kaiyaku <> '99991231'`
  } else if (searchdetail.search_ymd_kaiyaku_end) {
    ymd_kaiyaku_where_company = `AND c.ymd_kaiyaku <= '${searchdetail.search_ymd_kaiyaku_end}'`
    ymd_kaiyaku_where_person = `AND p.ymd_kaiyaku <= '${searchdetail.search_ymd_kaiyaku_end}'`
  }

  // 会社、個人のクエリ作成
  let query_search_company = '';
  let query_search_person = '';
  if (search_kubun_company) {
    query_search_company = 'SELECT "company" AS kubun, c.id, c.name, c.kana FROM companies AS c WHERE ((c.name like "%' + searchvalue + '%") OR (c.name_other like "%' + searchvalue + '%") OR (c.kana like "%' + searchvalue + '%") OR (c.id_nyukyo like "%' + searchvalue + '%")) AND c.ymd_end = "99991231"' + ymd_nyukyo_where_company + ymd_kaiyaku_where_company + search_kubun_company;
    query_search_company2 = 'SELECT "会社" AS header, CASE c.ymd_kaiyaku when "99991231" THEN "" ELSE "解約" END AS kaiyakuKubun, c.id, c.id_nyukyo AS id_nyukyo, c.kubun_company AS kubun, c.name, c.kana, c.ymd_nyukyo, c.ymd_kaiyaku FROM companies AS c WHERE ((c.name like "%' + searchvalue + '%") OR (c.name_other like "%' + searchvalue + '%") OR (c.kana like "%' + searchvalue + '%") OR (c.id_nyukyo like "%' + searchvalue + '%")) AND c.ymd_end = "99991231" ' + ymd_nyukyo_where_company + ymd_kaiyaku_where_company + search_kubun_company
  }
  if (search_kubun_person) {
    query_search_person = 'SELECT "person" AS kubun, p.id, p.name, p.kana FROM persons AS p ' + search_kubun_company_for_person + ' WHERE ((p.name like "%' + searchvalue + '%") OR (p.kana like "%' + searchvalue + '%")) AND p.ymd_end = "99991231" ' + ymd_nyukyo_where_person + ymd_kaiyaku_where_person + search_kubun_person;
    query_search_person2 = 'SELECT "個人" AS header, CASE p.ymd_kaiyaku when "99991231" THEN "" ELSE "解約" END AS kaiyakuKubun, p.id, NULL AS id_nyukyo, p.kubun_person AS kubun, p.name, p.kana, p.ymd_nyukyo, p.ymd_kaiyaku FROM persons AS p ' + search_kubun_company_for_person + ' WHERE ((p.name like "%' + searchvalue + '%") OR (p.kana like "%' + searchvalue + '%")) AND p.ymd_end = "99991231" ' + ymd_nyukyo_where_person + ymd_kaiyaku_where_person + search_kubun_person
  }

  // 合体
  let query = '';
  let query2 = '';
  if ((query_search_company) && (query_search_person)) {
    query = 'SELECT count(*) AS count_all FROM (( ' + query_search_company + ') UNION ALL (' + query_search_person + ')) AS total'
    query2 = '(' + query_search_company2 + ') UNION ALL (' + query_search_person2 + ') ORDER BY kaiyakuKubun asc, header asc, id_nyukyo asc, ymd_kaiyaku desc, ymd_nyukyo asc LIMIT ' + COUNT_PERPAGE + ' OFFSET ' + offset
  } else if (query_search_company) {
    query = 'SELECT count(*) AS count_all FROM ( ' + query_search_company + ') AS total'
    query2 = '(' + query_search_company2 + ') ORDER BY kaiyakuKubun asc, header asc, id_nyukyo asc, ymd_kaiyaku desc, ymd_nyukyo asc LIMIT ' + COUNT_PERPAGE + ' OFFSET ' + offset
  } else if (query_search_person) {
    query = 'SELECT count(*) AS count_all FROM ( ' + query_search_person + ') AS total'
    query2 = '(' + query_search_person2 + ') ORDER BY kaiyakuKubun asc, header asc, id_nyukyo asc, ymd_kaiyaku desc, ymd_nyukyo asc limit ' + COUNT_PERPAGE + ' OFFSET ' + offset
  }

  // ここまで検索条件用のSQL組み立て

  // データ取得処理
  async function main() {
    // async function main(query, query2, res) {

    // 検索結果件数を取得する（表示するしないに関わらずすべての件数）
    const retObjCnt = await company.setSQL(query)
    const count_all = retObjCnt[0].count_all;

    // 最大ページ数を計算
    let pagecount_max = (count_all % COUNT_PERPAGE) > 0 ? parseInt(count_all / COUNT_PERPAGE) + 1 : parseInt(count_all / COUNT_PERPAGE);

    // 検索結果を取得する（表示する件数分のみ）
    const retObj = await company.setSQL(query2);

    // 部屋番号を付加する
    for (let obj of retObj) {
      const retObjRomms = await company.findByIdWithRoomInfo(obj.id);
      if (retObjRomms.length !== 0) {
        let tmp_nameroom = '';
        let cnt = 0;
        for (let room of retObjRomms) {
          cnt += 1;
          // 4部屋まで表示、それ以上は「....」を追記し処理を抜ける
          if (cnt >= 5) {
            tmp_nameroom += ".....";
            break;
          } else {
            tmp_nameroom += room.place_room + ' ' + room.name_room + ' / ';
          }
        }
        tmp_nameroom = tmp_nameroom.slice(0,-2);
        obj.name_room = tmp_nameroom;
      }
    };

    /*
    searchvalue:検索文字列
    searchdetail:検索詳細条件
    results:検索結果（表示する件数のみ）
    count_all：検索結果件数
    page_current: 現在のページ数
    page_max：最大ページ数
    */
    res.render('index', {
      searchvalue: searchvalue,
      searchdetail: searchdetail,
      results: retObj,
      count_all: count_all,
      page_current: pagecount_target,
      page_max: pagecount_max,
    });
  }
  main();

});

module.exports = router;
