var express = require("express");
var router = express.Router();

const security = require("../util/security");
const tool = require("../util/tool");

const m_nyukyo = require("../model/nyukyos");
const m_company = require("../model/companies");
const m_person = require("../model/persons");
const m_re_comroom = require("../model/relation_comroom");
const m_re_comcabi = require("../model/relation_comcabi");
const m_re_combicycle = require("../model/relation_combicycle");
const m_re_comcar = require("../model/relation_comcar");
const m_sq = require("../model/sq");

/**
 * 会社情報の新規登録画面
 */
router.get("/", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjNyukyo = await m_nyukyo.findForSelect();
    res.render("companyform", {
      company: null,
      nyukyos: retObjNyukyo,
      mode: "insert",
      errors: null,
    });
  })();
});

/**
 * TOPページから「会社リンク選択」で表示される会社情報
 * id：会社情報のid
 */
router.get("/:id", security.authorize(), (req, res, next) => {
  (async () => {
    // 会社情報取得
    const retObjCompany = await m_company.findPKey(req.params.id, "99991231");
    if (!retObjCompany) {
      res.redirect("/");
    } else {
      let inObjPerson = {};
      inObjPerson.id_company = req.params.id;

      // 個人情報取得
      const retObjPersons = await m_person.findByCompany(inObjPerson);

      // キャビネット情報取得
      const retObjCabinets = await m_re_comcabi.findByCompany(req.params.id);

      // キャビネット空き情報取得
      const retObjFreeCabinets = await m_re_comcabi.findFree();

      // 部屋情報取得
      const retObjRooms = await m_re_comroom.findByCompany(req.params.id);

      // 部屋空き情報取得
      const retObjSelectRooms = await m_re_comroom.findForSelect();

      // 駐車場情報取得
      const retObjCars = await m_re_comcar.findByCompany(req.params.id);

      // 駐車場空き情報取得
      const retObjFreeCars = await m_re_comcar.findFree();

      // 駐輪場情報取得
      const retObjBicycles = await m_re_combicycle.findByCompany(req.params.id);

      // 駐輪場空き情報取得
      const retObjFreeBicycles = await m_re_combicycle.findFree();

      res.render("company", {
        company: retObjCompany,
        persons: retObjPersons,
        cabinets: retObjCabinets,
        freecabinets: retObjFreeCabinets,
        rooms: retObjRooms,
        selectrooms: retObjSelectRooms,
        bicycles: retObjBicycles,
        freebicycles: retObjFreeBicycles,
        cars: retObjCars,
        freecars: retObjFreeCars,
      });
    }
  })();
});

/**
 * 会社情報ページから「更新」リンクで表示される会社情報（編集）
 * id:会社情報のid
 */
router.get("/update/:id", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjCompany = await m_company.findPKey(req.params.id, "99991231");
    const retObjNyukyoSelect = await m_nyukyo.findForSelect();
    res.render("companyform", {
      company: retObjCompany,
      nyukyos: retObjNyukyoSelect,
      mode: "update",
      errors: null,
    });
  })();
});

/**
 * 会社情報ページから「削除」リンクで表示される会社情報（削除）
 * id:会社情報のid
 */
router.get("/delete/:id", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjCompany = await m_company.findPKey(req.params.id, "99991231");
    res.render("companyform", {
      company: retObjCompany,
      mode: "delete",
      errors: null,
    });
  })();
});

/**
 * 会社情報の新規登録
 */
router.post("/insert", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjCompany = getCompanyData(req.body);
    inObjCompany.ymd_start = tool.getToday();
    inObjCompany.ymd_upd = tool.getToday();
    inObjCompany.id_upd = req.user.id;

    //入力チェック
    const errors = validateData(req.body);
    if (errors) {
      const retObjSelect = await m_nyukyo.findForSelect();
      res.render("companyform", {
        company: inObjCompany,
        nyukyos: retObjSelect,
        mode: "insert",
        errors: errors,
      });
    } else {
      //会社IDの採番号
      const retObj = await m_sq.getSqCompany();
      inObjCompany.id = "C" + ("00000" + retObj.no).slice(-5);
      await m_company.insert(inObjCompany);
      res.redirect("/");
    }
  })();
});

/**
 * 会社情報の更新
 */
router.post("/update", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjCompany = getCompanyData(req.body);
    inObjCompany.ymd_upd = tool.getToday();
    inObjCompany.id_upd = req.user.id;

    //入力チェック
    const errors = validateData(req.body);
    if (errors) {
      const retObjSelect = await m_nyukyo.findForSelect();
      res.render("companyform", {
        company: inObjCompany,
        nyukyos: retObjSelect,
        mode: "update",
        errors: errors,
      });
    } else {
      const retObjCompany = await m_company.update(inObjCompany);
      if (retObjCompany.changedRows === 0) {
        const retObjSelect = await m_nyukyo.findForSelect();
        let errors = {};
        errors.common = "更新対象がすでに削除されています";
        res.render("companyform", {
          company: inObjCompany,
          nyukyos: retObjSelect,
          mode: "update",
          errors: errors,
        });
      } else {
        res.redirect("/company/" + inObjCompany.id);
      }
    }
  })();
});

/**
 * 会社情報の削除
 */
router.post("/delete", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjCompany = {};
    inObjCompany.id = req.body.id;
    inObjCompany.ymd_kaiyaku = req.body.ymd_kaiyaku;
    if (inObjCompany.ymd_kaiyaku === "99991231") {
      inObjCompany.ymd_kaiyaku = tool.getToday();
    }
    inObjCompany.ymd_end = tool.getToday();

    const retObjCompanyRemove = await m_company.remove(inObjCompany);
    if (retObjCompanyRemove.changedRows === 0) {
      const retObjCompany = await m_company.findPKey(inObjCompany.id, "99991231");
      let errors = {};
      errors.common = "更新対象がすでに削除されています";
      res.render("companyform", {
        company: retObjCompany,
        mode: "delete",
        errors: errors,
      });
    } else {
      res.redirect("/");
    }
  })();
});

/**
 * 会社情報の解約
 */
router.post("/cancel", security.authorize(), (req, res, next) => {
  (async () => {
    const id_company = req.body.id_company;
    const ymd_kaiyaku = req.body.selected_ymd_kaiyaku
      ? req.body.selected_ymd_kaiyaku
      : tool.getToday();

    let inObjCompany = {};
    inObjCompany.id = req.body.id_company;
    inObjCompany.ymd_kaiyaku = ymd_kaiyaku;
    inObjCompany.ymd_upd = tool.getToday();
    inObjCompany.id_upd = req.user.id;

    //会社情報の解約
    const retObjCompany = await m_company.cancel(inObjCompany);

    let inObjPerson = {};
    inObjPerson.id_company = req.body.id_company;
    inObjPerson.ymd_kaiyaku = ymd_kaiyaku;
    inObjPerson.ymd_upd = tool.getToday();
    inObjPerson.id_upd = req.user.id;

    //個人情報の解約
    const retObjPerson = await m_person.cancelByCompany(inObjPerson);

    let inObjRelation = {};
    inObjRelation.id_company = id_company;
    inObjRelation.ymd_end = ymd_kaiyaku;
    inObjRelation.ymd_upd = tool.getToday();
    inObjRelation.id_upd = req.user.id;

    //会社⇔部屋情報の解約
    const reObjComroom = await m_re_comroom.cancelByCompany(inObjRelation);

    //入居番号⇔キャビネットの解約
    const retObjComcabi = await m_re_comcabi.cancelByCompany(inObjRelation);

    //入居番号⇔駐輪場の解約
    const retObjCombicycle = await m_re_combicycle.cancelByCompany(
      inObjRelation
    );

    //入居番号⇔駐車場の解約
    const retObjComcar = await m_re_comcar.cancelByCompany(inObjRelation);

    res.redirect("/");
  })();
});

/**
 * 会社に部屋を紐づける
 */
router.post("/addroom", security.authorize(), (req, res, next) => {
  (async () => {
    const id_company = req.body.id_company;

    if (req.body.id_room !== "") {
      let ibObjComroom = {};
      ibObjComroom.id_company = id_company;
      ibObjComroom.id_room = req.body.id_room;
      ibObjComroom.ymd_start = req.body.selected_ymd_kaiyaku_room;
      ibObjComroom.ymd_upd = tool.getToday();
      ibObjComroom.id_upd = req.user.id;
      const retObjComroom = await m_re_comroom.insert(ibObjComroom);
      res.redirect("/company/" + id_company);
    } else {
      res.redirect("/company/" + id_company);
    }
  })();
});

/**
 * 会社に紐づいている部屋を外す
 */
router.get(
  "/deleteroom/:id_company/:id_room/:no_seq/:ymd_kaiyaku",
  security.authorize(),
  (req, res, next) => {
    (async () => {
      let inObjComroom = {};
      inObjComroom.id_company = req.params.id_company;
      inObjComroom.id_room = req.params.id_room;
      inObjComroom.no_seq = req.params.no_seq;
      inObjComroom.ymd_end = req.params.ymd_kaiyaku;
      inObjComroom.ymd_upd = tool.getToday();
      inObjComroom.id_upd = req.user.id;

      const retObjComroom = await m_re_comroom.remove(inObjComroom);
      res.redirect("/company/" + req.params.id_company);
    })();
  }
);

/**
 * 会社にキャビネットを紐づける
 */
router.post("/addcabinet", security.authorize(), (req, res, next) => {
  (async () => {
    const id_company = req.body.id_company;

    if (req.body.id_cabinet !== "") {
      let inObjComcabi = {};
      inObjComcabi.id_company = id_company;
      inObjComcabi.id_cabinet = req.body.id_cabinet;
      inObjComcabi.ymd_start = req.body.selected_ymd_kaiyaku_cabinet;
      inObjComcabi.ymd_upd = tool.getToday();
      inObjComcabi.id_upd = req.user.id;
      const retObjComcabi = await m_re_comcabi.insert(inObjComcabi);
      res.redirect("/company/" + id_company);
    } else {
      res.redirect("/company/" + id_company);
    }
  })();
});

/**
 * 会社に紐づいているキャビネットを外す
 */
router.get(
  "/deletecabinet/:id_company/:id_cabinet/:no_seq/:ymd_kaiyaku",
  security.authorize(),
  (req, res, next) => {
    (async () => {
      let inObjComcabi = {};
      inObjComcabi.id_company = req.params.id_company;
      inObjComcabi.id_cabinet = req.params.id_cabinet;
      inObjComcabi.no_seq = req.params.no_seq;
      inObjComcabi.ymd_end = req.params.ymd_kaiyaku;
      inObjComcabi.ymd_upd = tool.getToday();
      inObjComcabi.id_upd = req.user.id;
      const retObjComcabi = await m_re_comcabi.remove(inObjComcabi);
      res.redirect("/company/" + req.params.id_company);
    })();
  }
);

/**
 * 会社に駐輪場を紐づける
 */
router.post("/addbicycle", security.authorize(), (req, res, next) => {
  (async () => {
    const id_company = req.body.id_company;

    if (req.body.id_bicycle !== "") {
      let inObjCombicycle = {};
      inObjCombicycle.id_company = id_company;
      inObjCombicycle.id_bicycle = req.body.id_bicycle;
      inObjCombicycle.ymd_start = req.body.selected_ymd_kaiyaku_bicycle;
      inObjCombicycle.ymd_upd = tool.getToday();
      inObjCombicycle.id_upd = req.user.id;
      const retObjCombicycle = await m_re_combicycle.insert(inObjCombicycle);
      res.redirect("/company/" + id_company);
    } else {
      res.redirect("/company/" + id_company);
    }
  })();
});

/**
 * 会社に紐づいている駐輪場を外す
 */
router.get(
  "/deletebicycle/:id_company/:id_bicycle/:no_seq/:ymd_kaiyaku",
  security.authorize(),
  (req, res, next) => {
    (async () => {
      let inObjCombicycle = {};
      inObjCombicycle.id_company = req.params.id_company;
      inObjCombicycle.id_bicycle = req.params.id_bicycle;
      inObjCombicycle.no_seq = req.params.no_seq;
      inObjCombicycle.ymd_end = req.params.ymd_kaiyaku;
      inObjCombicycle.ymd_upd = tool.getToday();
      inObjCombicycle.id_upd = req.user.id;
      const retObjCombicycle = await m_re_combicycle.remove(inObjCombicycle);
      res.redirect("/company/" + req.params.id_company);
    })();
  }
);

/**
 * 会社に駐車場を紐づける
 */
router.post("/addcar", security.authorize(), (req, res, next) => {
  (async () => {
    const id_company = req.body.id_company;

    if (req.body.id_car !== "") {
      let inObjComcar = {};
      inObjComcar.id_company = id_company;
      inObjComcar.id_car = req.body.id_car;
      inObjComcar.ymd_start = req.body.selected_ymd_kaiyaku_car;
      inObjComcar.ymd_upd = tool.getToday();
      inObjComcar.id_upd = req.user.id;
      const retObjComcar = await m_re_comcar.insert(inObjComcar);
      res.redirect("/company/" + id_company);
    } else {
      res.redirect("/company/" + id_company);
    }
  })();
});

/**
 * 会社に紐づいている駐車場を外す
 */
router.get(
  "/deletecar/:id_company/:id_car/:no_seq/:ymd_kaiyaku",
  security.authorize(),
  (req, res, next) => {
    (async () => {
      let inObjComcar = {};
      inObjComcar.id_company = req.params.id_company;
      inObjComcar.id_car = req.params.id_car;
      inObjComcar.no_seq = req.params.no_seq;
      inObjComcar.ymd_end = req.params.ymd_kaiyaku;
      inObjComcar.ymd_upd = tool.getToday();
      inObjComcar.id_upd = req.user.id;
      const retObjComcar = m_re_comcar.remove(inObjComcar);
      res.redirect("/company/" + req.params.id_company);
    })();
  }
);

/**
 * 会社情報の入力チェック
 * @param {*} body formからのリクエスト情報
 * @returns errors エラー情報
 */
const validateData = (body) => {
  let isValidated = true;
  let errors = {};

  if (!body.id_nyukyo) {
    isValidated = false;
    errors.id_nyukyo = "入居番号を選択してください。";
  }
  if (!body.kubun_company) {
    isValidated = false;
    errors.kubun_company = "会社区分が未入力です。";
  }
  if (!body.name) {
    isValidated = false;
    errors.name = "会社名が未入力です。";
  } else {
    if (body.name.length > 100) {
      isValidated = false;
      errors.name = "会社名は100桁以下で入力してください。";
    }
  }
  if (body.name_other) {
    if (body.name_other.length > 100) {
      isValidated = false;
      errors.name_other = "会社名（別名）は100桁以下で入力してください。";
    }
  }
  if (body.id_kaigi) {
    if (body.id_kaigi.length > 5) {
      isValidated = false;
      errors.id_kaigi = "会議室IDは5桁以下で入力してください。";
    }
  }
  if (body.kana) {
    if (body.kana.length > 100) {
      isValidated = false;
      errors.kana = "カナは100桁以下で入力してください。";
    }
  }
  if (!body.ymd_nyukyo) {
    isValidated = false;
    errors.ymd_nyukyo = "入居年月日が未入力です。";
  }
  if (body.bikou) {
    if (body.bikou.length > 100) {
      isValidated = false;
      errors.bikou = "備考は1000桁以下で入力してください。";
    }
  }

  return isValidated ? undefined : errors;
};

/**
 * 引数のbodyに設定された会社情報項目をオブジェクトに詰めて返却する
 * @param {*} body formからのリクエスト情報
 * @returns inObj
 */
const getCompanyData = (body) => {
  let inObj = {};
  inObj.id = body.id;
  inObj.id_nyukyo = body.id_nyukyo;
  inObj.id_kaigi = body.id_kaigi;
  inObj.kubun_company = body.kubun_company;
  inObj.name = body.name;
  inObj.name_other = body.name_other;
  inObj.kana = body.kana;
  inObj.ymd_nyukyo = body.ymd_nyukyo;
  inObj.ymd_kaiyaku = body.ymd_kaiyaku;
  inObj.ymd_start = body.ymd_start;
  inObj.ymd_end = body.ymd_end;
  inObj.ymd_upd = body.ymd_upd;
  inObj.id_upd = body.id_upd;
  inObj.bikou = body.bikou;
  return inObj;
};

module.exports = router;
