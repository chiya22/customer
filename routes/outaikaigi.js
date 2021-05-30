var express = require("express");
var router = express.Router();

const security = require("../util/security");
const tool = require("../util/tool");

const m_sq = require("../model/sq");
const m_outaikaigi = require("../model/outaiskaigi");
const m_riyousha = require("../model/riyoushas");

//応対履歴（会議室）検索画面の初期表示
router.get("/", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjRiyousha = await m_riyousha.findForSelect();
    res.render("outaiskaigi", {
      results: null,
      searchvalue: null,
      selectRiyousha: null,
      riyoushas: retObjRiyousha,
      page_current: 0,
      page_max: 0,
      count_all: 0,
      includecomplete: null,
    });
  })();
});

const count_perpage = 20;

//検索文字列を指定して、応対履歴（会議室）検索
router.post("/", security.authorize(), (req, res, next) => {
  (async () => {
    const searchvalue = req.body.searchvalue; //検索文字列
    const pagecount_current = req.body.page_current; //現在表示されているページ
    const page_action = req.body.pageaction; //ページングアクション

    const id_riyousha = req.body.id_riyousha;
    const includecomplete = req.body.includecomplete;

    //ページングアクションにより、表示対象のページ数を確定する
    const pagecount_target =
      page_action === "next"
        ? parseInt(pagecount_current) + 1
        : page_action === "prev"
        ? parseInt(pagecount_current) - 1
        : 1;

    //表示開始位置を確定する
    const offset = (pagecount_target - 1) * count_perpage;

    let query;
    let query2;
    if (id_riyousha) {
      if (includecomplete) {
        query =
          'select COUNT(*) as count_all FROM ( SELECT o.*,r.name as name_riyousha FROM outaiskaigi o left outer JOIN riyoushas r ON o.id_riyousha = r.id ) oru WHERE oru.id_riyousha = "' +
          id_riyousha +
          '" and (oru.content LIKE "%' +
          searchvalue +
          '%" OR oru.name_riyousha LIKE "%' +
          searchvalue +
          '%" )';
        query2 =
          'select * from(SELECT o.*,ua.name AS name_add, uu.name AS name_upd, ifnull(r.name, "利用者指定なし") as name_riyousha FROM outaiskaigi o left outer JOIN riyoushas r ON o.id_riyousha = r.id LEFT OUTER JOIN users ua ON ua.id = o.id_add LEFT OUTER JOIN users uu ON uu.id = o.id_upd) oru WHERE oru.id_riyousha = "' +
          id_riyousha +
          '" AND ( oru.content LIKE "%' +
          searchvalue +
          '%" OR oru.name_riyousha LIKE "%' +
          searchvalue +
          '%") ORDER BY oru.ymdhms_upd desc limit ' +
          count_perpage +
          " offset " +
          offset;
      } else {
        query =
          'select COUNT(*) as count_all FROM ( SELECT o.*,r.name as name_riyousha FROM outaiskaigi o left outer JOIN riyoushas r ON o.id_riyousha = r.id ) oru WHERE oru.id_riyousha = "' +
          id_riyousha +
          '" and oru.status != "完了" and (oru.content LIKE "%' +
          searchvalue +
          '%" OR oru.name_riyousha LIKE "%' +
          searchvalue +
          '%" )';
        query2 =
          'select * from(SELECT o.*,ua.name AS name_add, uu.name AS name_upd, ifnull(r.name, "利用者指定なし") as name_riyousha FROM outaiskaigi o left outer JOIN riyoushas r ON o.id_riyousha = r.id LEFT OUTER JOIN users ua ON ua.id = o.id_add LEFT OUTER JOIN users uu ON uu.id = o.id_upd) oru WHERE oru.id_riyousha = "' +
          id_riyousha +
          '" AND oru.status != "完了" AND ( oru.content LIKE "%' +
          searchvalue +
          '%" OR oru.name_riyousha LIKE "%' +
          searchvalue +
          '%") ORDER BY oru.ymdhms_upd desc limit ' +
          count_perpage +
          " offset " +
          offset;
      }
    } else {
      if (includecomplete) {
        query =
          'select COUNT(*) as count_all FROM ( SELECT o.*,r.name as name_riyousha FROM outaiskaigi o left outer JOIN riyoushas r ON o.id_riyousha = r.id ) oru WHERE (oru.content LIKE "%' +
          searchvalue +
          '%" OR oru.name_riyousha LIKE "%' +
          searchvalue +
          '%" )';
        query2 =
          'select * from(SELECT o.*,ua.name AS name_add, uu.name AS name_upd, ifnull(r.name, "利用者指定なし") as name_riyousha FROM outaiskaigi o left outer JOIN riyoushas r ON o.id_riyousha = r.id LEFT OUTER JOIN users ua ON ua.id = o.id_add LEFT OUTER JOIN users uu ON uu.id = o.id_upd) oru WHERE ( oru.content LIKE "%' +
          searchvalue +
          '%" OR oru.name_riyousha LIKE "%' +
          searchvalue +
          '%") ORDER BY oru.ymdhms_upd desc limit ' +
          count_perpage +
          " offset " +
          offset;
      } else {
        query =
          'select COUNT(*) as count_all FROM ( SELECT o.*,r.name as name_riyousha FROM outaiskaigi o left outer JOIN riyoushas r ON o.id_riyousha = r.id ) oru WHERE oru.status != "完了" and (oru.content LIKE "%' +
          searchvalue +
          '%" OR oru.name_riyousha LIKE "%' +
          searchvalue +
          '%" )';
        query2 =
          'select * from(SELECT o.*,ua.name AS name_add, uu.name AS name_upd, ifnull(r.name, "利用者指定なし") as name_riyousha FROM outaiskaigi o left outer JOIN riyoushas r ON o.id_riyousha = r.id LEFT OUTER JOIN users ua ON ua.id = o.id_add LEFT OUTER JOIN users uu ON uu.id = o.id_upd) oru WHERE oru.status != "完了" AND ( oru.content LIKE "%' +
          searchvalue +
          '%" OR oru.name_riyousha LIKE "%' +
          searchvalue +
          '%") ORDER BY oru.ymdhms_upd desc limit ' +
          count_perpage +
          " offset " +
          offset;
      }
    }

    const retObjOutaiCnt = await m_outaikaigi.setSQL(query);
    const count_all = retObjOutaiCnt[0].count_all;
    let pagecount_max = parseInt(count_all / count_perpage);
    if (count_all % count_perpage > 0) {
      pagecount_max += 1;
    }

    const retObjOutaiKaigi = await m_outaikaigi.setSQL(query2);
    const retObjSelectRiyousha = await m_riyousha.findForSelect();

    const retObjRiyousha = id_riyousha
      ? await m_riyousha.findPKey(id_riyousha)
      : null;
    res.render("outaiskaigi", {
      results: retObjOutaiKaigi,
      searchvalue: searchvalue,
      selectRiyousha: retObjRiyousha,
      riyoushas: retObjSelectRiyousha,
      page_current: pagecount_target,
      page_max: pagecount_max,
      count_all: count_all,
      includecomplete: includecomplete,
    });
  })();
});

//応対履歴IDをもとに応対履歴情報表示へ
router.get("/:id_outai", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjOutaikaigi = await m_outaikaigi.findPKey(req.params.id_outai);
    const retObjRisyouha = retObjOutaikaigi.id_riyousha
      ? await m_riyousha.findPKey(retObjOutaikaigi.id_riyousha)
      : null;
    res.render("outaikaigi", {
      outaikaigi: retObjOutaikaigi,
      selectRiyousha: retObjRisyouha,
      errors: null,
    });
  })();
});

//応対履歴情報表示から「更新」ボタンで応対履歴を更新するフォームへ
router.get("/update/:id_outai", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjOutaiKaigi = await m_outaikaigi.findPKey(req.params.id_outai);
    const retObjSelectRiyousha = await m_riyousha.findForSelect();
    const retObjRiyousha = retObjOutaiKaigi.id_riyousha
      ? await m_riyousha.findPKey(retObjOutaiKaigi.id_riyousha)
      : null;
    res.render("outaikaigiform", {
      outaikaigi: retObjOutaiKaigi,
      riyoushas: retObjSelectRiyousha,
      selectRiyousha: retObjRiyousha,
      mode: "update",
      errors: null,
    });
  })();
});

//会社IDをもとに応対履歴を追加するフォームへ
router.get("/insert/:id_riyousha", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjRiyousha = await m_riyousha.findPKey(req.params.id_riyousha);
    const retObjSelectRiyousha = await m_riyousha.findForSelect();
    res.render("outaikaigiform", {
      outaikaigi: null,
      riyoushas: retObjSelectRiyousha,
      selectRiyousha: retObjRiyousha,
      mode: "insert",
      errors: null,
    });
  })();
});

// 応対履歴情報の登録
router.post("/insert", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjOutaikaigi = getOutairirekiData(req.body);
    inObjOutaikaigi.ymdhms_add = tool.getTodayTime();
    inObjOutaikaigi.ymdhms_upd = tool.getTodayTime();
    inObjOutaikaigi.id_add = req.user.id;
    inObjOutaikaigi.id_upd = req.user.id;

    //入力チェック
    let errors;
    errors = validateData(req.body);

    if (errors) {
      const retObjSelectRiyousha = await m_riyousha.findForSelect();
      const retObjRiyousha = inObjOutaikaigi.id_riyousha
        ? await m_riyousha.findPKey(inObjOutaikaigi.id_riyousha)
        : null;
      res.render("outaikaigiform", {
        outai: inObjOutaikaigi,
        riyoushas: retObjSelectRiyousha,
        selectRiyousha: retObjRiyousha,
        mode: "insert",
        errors: errors,
      });
    }

    //応対履歴IDの採番号
    const retObjOutaikaigiNo = await m_sq.getSqOutaikaigi();
    inObjOutaikaigi.id = "O" + ("000000000" + retObjOutaikaigiNo.no).slice(-9);
    const retObjOutaikaigi = await m_outaikaigi.insert(inObjOutaikaigi);
    res.redirect("/outaikaigi");
  })();
});

//応対履歴情報の更新
router.post("/update", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjOutaikaigi = getOutairirekiData(req.body);
    inObjOutaikaigi.ymdhms_upd = tool.getTodayTime();
    inObjOutaikaigi.id_upd = req.user.id;

    //入力チェック
    let errors;
    errors = validateData(req.body);

    const retObjSelectRiyousha = await m_riyousha.findForSelect();

    if (errors) {
      res.render("outaikaigiform", {
        outaikaigi: inObjOutaikaigi,
        riyoushas: retObjSelectRiyousha,
        mode: "update",
        errors: errors,
      });
    }

    const retObjOutaiKaigi = m_outaikaigi.update(inObjOutaikaigi);
    if (retObjOutaiKaigi.changedRows === 0) {
      errors.common = "更新対象はすでに削除されています";
      res.render("outaikaigiform", {
        outaikaigi: inObjOutaikaigi,
        riyoushas: retObjSelectRiyousha,
        mode: "update",
        errors: errors,
      });
    } else {
      res.redirect("/outaikaigi");
    }
  })();
});

function validateData(body) {
  let isValidated = true;
  let errors = {};

  if (!body.content) {
    isValidated = false;
    errors.content = "内容が未入力です。";
  } else {
    if (body.content.length > 1000) {
      isValidated = false;
      errors.content = "内容は1000桁以下で入力してください。";
    }
  }

  return isValidated ? undefined : errors;
}

function getOutairirekiData(body) {
  let inObj = {};
  inObj.id = body.id;
  inObj.id_riyousha = body.id_riyousha;
  inObj.content = body.content;
  inObj.status = body.status;
  inObj.ymdhms_add = body.ymdhms_add;
  inObj.id_add = body.id_add;
  inObj.ymdhms_upd = body.ymdhms_upd;
  inObj.id_upd = body.id_upd;
  return inObj;
}

module.exports = router;
