const express = require("express");
const router = express.Router();
const security = require("../util/security");
const riyousha = require("../model/riyoushas");
const outaikaigi = require("../model/outaiskaigi");
const yoyaku = require("../model/yoyakus");

const COUNT_PERPAGE = 20;

// index
router.get("/", security.authorize(), (req, res, next) => {
  res.render("riyoushas", {
    searchvalue: null,
    results: null,
    page_current: 0,
    page_max: 0,
    count_all: 0,
  });
});

//検索文字列を指定して、会社検索
router.post("/", security.authorize(), (req, res, next) => {
  (async () => {
    const searchvalue = req.body.searchvalue; //検索文字列
    const pagecount_current = req.body.page_current; //現在表示されているページ
    const page_action = req.body.pageaction; //ページングアクション

    //ページングアクションにより、表示対象のページ数を確定する
    const pagecount_target =
      page_action === "next"
        ? parseInt(pagecount_current) + 1
        : page_action === "prev"
        ? parseInt(pagecount_current) - 1
        : 1;

    //表示開始位置を確定する
    const offset = (pagecount_target - 1) * COUNT_PERPAGE;

    const query_search_riyousha =
      'select r.id, r.name, r.kubun, r.kubun2, r.ymd_add from riyoushas as r where ((r.id like "%' +
      searchvalue +
      '%") or (r.name like "%' +
      searchvalue +
      '%") or (r.kana like "%' +
      searchvalue +
      '%"))';

    // 合体
    const query =
      "select count(*) as count_all from (" +
      query_search_riyousha +
      ") as total";
    const query2 =
      "(" +
      query_search_riyousha +
      ") order by id asc limit " +
      COUNT_PERPAGE +
      " offset " +
      offset;

    const retObjRiyoushaCount = await riyousha.setSQL(query);

    const count_all = retObjRiyoushaCount[0].count_all;
    let pagecount_max = parseInt(count_all / COUNT_PERPAGE);
    if (count_all % COUNT_PERPAGE > 0) {
      pagecount_max += 1;
    }

    const retObjRiyousha = await riyousha.setSQL(query2);

    res.render("riyoushas", {
      searchvalue: searchvalue,
      results: retObjRiyousha,
      page_current: pagecount_target,
      page_max: pagecount_max,
      count_all: count_all,
    });
  })();
});

// 会議室利用者検索ページから「会議室利用者リンク選択」での会議室利用者ページへの遷移
router.get("/:id", security.authorize(), (req, res, next) => {
  (async () => {
    //利用者情報の取得
    const retObjRiyousha = await riyousha.findPKey(req.params.id);
    const retObjOutaikaigi = await outaikaigi.findByRiyoushaForOutai(req.params.id);
    const retObjYoyaku = await yoyaku.findByRiyoushaForOutai(req.params.id);
    res.render("riyousha", {
      riyousha: retObjRiyousha,
      outaikaigis: retObjOutaikaigi,
      yoyakus: retObjYoyaku,
    });
  })();
});

module.exports = router;
