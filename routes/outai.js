var express = require("express");
var router = express.Router();

const security = require("../util/security");
const tool = require("../util/tool");

const m_sq = require("../model/sq");
const m_outai = require("../model/outais");
const m_company = require("../model/companies");

const count_perpage = 20;

//応対履歴検索画面の初期表示
router.get("/", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjSelectCompany = await m_company.findForSelect();
    res.render("outais", {
      results: null,
      searchvalue: null,
      selectCompany: null,
      companies: retObjSelectCompany,
      page_current: 0,
      page_max: 0,
      count_all: 0,
      includecomplete: null,
    });
  })();
});

//検索文字列を指定して、応対履歴検索
router.post("/", security.authorize(), (req, res, next) => {
  (async () => {
    const searchvalue = req.body.searchvalue; //検索文字列
    const pagecount_current = req.body.page_current; //現在表示されているページ
    const page_action = req.body.pageaction; //ページングアクション

    const id_company = req.body.id_company;
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
    if (id_company) {
      if (includecomplete) {
        // query = 'select count(*) as count_all from outais where id_company = "' + id_company + '" and content like "%' + searchvalue + '%"'
        query =
          'select COUNT(*) as count_all FROM ( SELECT o.*,c.name as name_company FROM outais o left outer JOIN companies c ON o.id_company = c.id ) ocu WHERE ocu.id_company = "' +
          id_company +
          '" and (ocu.content LIKE "%' +
          searchvalue +
          '%" OR ocu.name_company LIKE "%' +
          searchvalue +
          '%" )';
        // query2 = 'select o.*, u1.name as name_add, u2.name as name_upd, ifnull(c.name,"会社指定なし") as name_company from ( select * from outais where id_company = "' + id_company + '" and content like "%' + searchvalue + '%" ) as o left outer join users as u1 on o.id_add = u1.id left outer join users as u2 on o.id_upd = u2.id left outer join companies as c on o.id_company = c.id order by o.ymdhms_upd desc limit ' + count_perpage + ' offset ' + offset
        query2 =
          'select * from(SELECT o.*,ua.name AS name_add, uu.name AS name_upd, ifnull(c.name, "会社指定なし") as name_company FROM outais o left outer JOIN companies c ON o.id_company = c.id LEFT OUTER JOIN users ua ON ua.id = o.id_add LEFT OUTER JOIN users uu ON uu.id = o.id_upd) ocu WHERE ocu.id_company = "' +
          id_company +
          '" AND ( ocu.content LIKE "%' +
          searchvalue +
          '%" OR ocu.name_company LIKE "%' +
          searchvalue +
          '%") ORDER BY ocu.ymdhms_upd desc limit ' +
          count_perpage +
          " offset " +
          offset;
      } else {
        // query = 'select count(*) as count_all from outais where id_company = "' + id_company + '" and status != "完了" and content like "%' + searchvalue + '%"'
        query =
          'select COUNT(*) as count_all FROM ( SELECT o.*,c.name as name_company FROM outais o left outer JOIN companies c ON o.id_company = c.id ) ocu WHERE ocu.id_company = "' +
          id_company +
          '" and ocu.status != "完了" and (ocu.content LIKE "%' +
          searchvalue +
          '%" OR ocu.name_company LIKE "%' +
          searchvalue +
          '%" )';
        // query2 = 'select o.*, u1.name as name_add, u2.name as name_upd, ifnull(c.name,"会社指定なし") as name_company from ( select * from outais where id_company = "' + id_company + '" and status != "完了" and content like "%' + searchvalue + '%" ) as o left outer join users as u1 on o.id_add = u1.id left outer join users as u2 on o.id_upd = u2.id left outer join companies as c on o.id_company = c.id order by o.ymdhms_upd desc limit ' + count_perpage + ' offset ' + offset
        query2 =
          'select * from(SELECT o.*,ua.name AS name_add, uu.name AS name_upd, ifnull(c.name, "会社指定なし") as name_company FROM outais o left outer JOIN companies c ON o.id_company = c.id LEFT OUTER JOIN users ua ON ua.id = o.id_add LEFT OUTER JOIN users uu ON uu.id = o.id_upd) ocu WHERE ocu.id_company = "' +
          id_company +
          '" AND ocu.status != "完了" AND ( ocu.content LIKE "%' +
          searchvalue +
          '%" OR ocu.name_company LIKE "%' +
          searchvalue +
          '%") ORDER BY ocu.ymdhms_upd desc limit ' +
          count_perpage +
          " offset " +
          offset;
      }
    } else {
      if (includecomplete) {
        // query = 'select count(*) as count_all from outais where content like "%' + searchvalue + '%"'
        query =
          'select COUNT(*) as count_all FROM ( SELECT o.*,c.name as name_company FROM outais o left outer JOIN companies c ON o.id_company = c.id ) ocu WHERE (ocu.content LIKE "%' +
          searchvalue +
          '%" OR ocu.name_company LIKE "%' +
          searchvalue +
          '%" )';
        // query2 = 'select o.*, u1.name as name_add, u2.name as name_upd, ifnull(c.name,"会社指定なし") as name_company from ( select * from outais where content like "%' + searchvalue + '%" ) as o left outer join users as u1 on o.id_add = u1.id left outer join users as u2 on o.id_upd = u2.id left outer join companies as c on o.id_company = c.id order by o.ymdhms_upd desc limit ' + count_perpage + ' offset ' + offset
        query2 =
          'select * from(SELECT o.*,ua.name AS name_add, uu.name AS name_upd, ifnull(c.name, "会社指定なし") as name_company FROM outais o left outer JOIN companies c ON o.id_company = c.id LEFT OUTER JOIN users ua ON ua.id = o.id_add LEFT OUTER JOIN users uu ON uu.id = o.id_upd) ocu WHERE ( ocu.content LIKE "%' +
          searchvalue +
          '%" OR ocu.name_company LIKE "%' +
          searchvalue +
          '%") ORDER BY ocu.ymdhms_upd desc limit ' +
          count_perpage +
          " offset " +
          offset;
      } else {
        // query = 'select count(*) as count_all from outais where status != "完了" and content like "%' + searchvalue + '%"'
        query =
          'select COUNT(*) as count_all FROM ( SELECT o.*,c.name as name_company FROM outais o left outer JOIN companies c ON o.id_company = c.id ) ocu WHERE ocu.status != "完了" and (ocu.content LIKE "%' +
          searchvalue +
          '%" OR ocu.name_company LIKE "%' +
          searchvalue +
          '%" )';
        // query2 = 'select o.*, u1.name as name_add, u2.name as name_upd, ifnull(c.name,"会社指定なし") as name_company from ( select * from outais where status != "完了" and content like "%' + searchvalue + '%" ) as o left outer join users as u1 on o.id_add = u1.id left outer join users as u2 on o.id_upd = u2.id left outer join companies as c on o.id_company = c.id order by o.ymdhms_upd desc limit ' + count_perpage + ' offset ' + offset
        query2 =
          'select * from(SELECT o.*,ua.name AS name_add, uu.name AS name_upd, ifnull(c.name, "会社指定なし") as name_company FROM outais o left outer JOIN companies c ON o.id_company = c.id LEFT OUTER JOIN users ua ON ua.id = o.id_add LEFT OUTER JOIN users uu ON uu.id = o.id_upd) ocu WHERE ocu.status != "完了" AND ( ocu.content LIKE "%' +
          searchvalue +
          '%" OR ocu.name_company LIKE "%' +
          searchvalue +
          '%") ORDER BY ocu.ymdhms_upd desc limit ' +
          count_perpage +
          " offset " +
          offset;
      }
    }

    const retObjSelectOutaiCount = await m_outai.setSQL(query);
    const count_all = retObjSelectOutaiCount[0].count_all;
    let pagecount_max = parseInt(count_all / count_perpage);
    if (count_all % count_perpage > 0) {
      pagecount_max += 1;
    }
    const retObjOutai = await m_outai.setSQL(query2);
    const retObjSelectCompany = await m_company.findForSelect();
    const retObjCompany = id_company
      ? await m_company.findPKey(id_company, "99991231")
      : null;
    res.render("outais", {
      results: retObjOutai,
      searchvalue: searchvalue,
      selectCompany: retObjCompany,
      companies: retObjSelectCompany,
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
    const retObjOutai = await m_outai.findPKey(req.params.id_outai);
    const retObjCompany = retObjOutai.id_company
      ? await m_company.findPKey(retObjOutai.id_company, "99991231")
      : null;

    res.render("outai", {
      outai: retObjOutai,
      selectCompany: retObjCompany,
      errors: null,
    });
  })();
});

//応対履歴情報表示から「更新」ボタンで応対履歴を更新するフォームへ
router.get("/update/:id_outai", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjOutai = await m_outai.findPKey(req.params.id_outai);
    const retObjSelectCompany = await m_company.findForSelect();

    const retObjCompany = retObjOutai.id_company
      ? await m_company.findPKey(retObjOutai.id_company, "99991231")
      : null;
    res.render("outaiform", {
      outai: retObjOutai,
      companies: retObjSelectCompany,
      selectCompany: retObjCompany,
      mode: "update",
      errors: null,
    });
  })();
});

//会社IDをもとに応対履歴を追加するフォームへ
router.get("/insert/:id_company", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjCompany = await m_company.findPKey(
      req.params.id_company,
      "99991231"
    );
    const retObjSelectCompany = await m_company.findForSelect();
    res.render("outaiform", {
      outai: null,
      companies: retObjSelectCompany,
      selectCompany: retObjCompany,
      mode: "insert",
      errors: null,
    });
  })();
});

// 応対履歴情報の登録
router.post("/insert", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjOutai = getOutaiData(req.body);
    inObjOutai.ymdhms_add = tool.getTodayTime();
    inObjOutai.ymdhms_upd = tool.getTodayTime();
    inObjOutai.id_add = req.user.id;
    inObjOutai.id_upd = req.user.id;

    //入力チェック
    let errors;
    errors = validateData(req.body);

    if (errors) {
      //すでに会社を選択している場合
      const retObjCompany = inObjOutai.id_company
        ? await m_company.findPKey(inObjOutai.id_company, "99991231")
        : null;
      const retObjSelectCompany = await m_company.findForSelect();
      res.render("outaiform", {
        outai: inObj,
        companies: retObj,
        selectCompany: company,
        mode: "insert",
        errors: errors,
      });
    }

    //応対履歴IDの採番号
    const retObjOutaiSq = await m_sq.getSqOutai();
    inObjOutai.id = "O" + ("000000000" + retObjOutaiSq.no).slice(-9);
    const retObjOutai = await m_outai.insert(inObjOutai);
    res.redirect("/outai");
  })();
});

//応対履歴情報の更新
router.post("/update", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjOutai = getOutaiData(req.body);
    inObjOutai.ymdhms_upd = tool.getTodayTime();
    inObjOutai.id_upd = req.user.id;

    //入力チェック
    let errors;
    errors = validateData(req.body);

    const retObjSelectCompany = await m_company.findForSelect();

    if (errors) {
      res.render("outaiform", {
        outai: inObj,
        companies: retObjSelectCompany,
        mode: "update",
        errors: errors,
      });
    }

    const retObjOutai = await m_outai.update(inObjOutai);
    if (retObjOutai.changedRows === 0) {
      errors.common = "更新対象はすでに削除されています";
      res.render("outaiform", {
        outai: inObjOutai,
        companies: retObjSelectCompany,
        mode: "update",
        errors: errors,
      });
    } else {
      res.redirect("/outai");
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

function getOutaiData(body) {
  let inObj = {};
  inObj.id = body.id;
  inObj.id_company = body.id_company;
  inObj.content = body.content;
  inObj.status = body.status;
  inObj.ymdhms_add = body.ymdhms_add;
  inObj.id_add = body.id_add;
  inObj.ymdhms_upd = body.ymdhms_upd;
  inObj.id_upd = body.id_upd;
  return inObj;
}

module.exports = router;
