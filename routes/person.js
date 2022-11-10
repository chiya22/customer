var express = require("express");
var router = express.Router();

const security = require("../util/security");
const tool = require("../util/tool");

const m_company = require("../model/companies");
const m_person = require("../model/persons");
const m_sq = require("../model/sq");

// 会社ページより「個人登録」をクリック
router.get("/add/:id_company", security.authorize(), (req, res, next) => {
  (async () => {
    //会社情報
    const retObjCompany = await m_company.findPKey(req.params.id_company, "99991231");

    // 会社情報のセレクトボックス情報
    const retObjSelectCompany = await m_company.findForSelect();

    let inObjP = {};
    inObjP.id_company = req.params.id_company;

    res.render("personform", {
      person: inObjP,
      company: retObjCompany,
      companies: retObjSelectCompany,
      mode: "insert",
      errors: null,
    });
  })();
});

// TOPページから「個人リンク選択」での個人ページへ遷移
router.get("/:id", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjPerson = await m_person.findPKey(req.params.id, "99991231");

    if (retObjPerson.id_company) {
      const retObjCompany = await m_company.findPKey(retObjPerson.id_company, "99991231");
      res.render("person", {
        person: retObjPerson,
        companyname: retObjCompany.name,
      });
    } else {
      res.render("person", {
        person: retObjPerson,
        companyname: null,
      });
    }
  })();
});

// 個人ページから「更新」リンクでの個人（編集）ページへの遷移
router.get("/update/:id", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjPerson = await m_person.findPKey(req.params.id, "99991231");
    const retObjCompany = await m_company.findPKey(retObjPerson.id_company, "99991231");
    const retObjSelectCompany = await m_company.findForSelect();

    res.render("personform", {
      person: retObjPerson,
      company: retObjCompany,
      companies: retObjSelectCompany,
      mode: "update",
      errors: null,
    });
  })();
});

// 個人ページから「削除」リンクでの個人（編集）ページへの遷移
router.get("/delete/:id", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjPerson = await m_person.findPKey(req.params.id, "99991231");
    const retObjCompany = await m_company.findPKey(retObjPerson.id_company, "99991231");

    res.render("personform", {
      person: retObjPerson,
      company: retObjCompany,
      companies: null,
      mode: "delete",
      errors: null,
    });
  })();
});

// 個人情報の登録
router.post("/insert", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjPerson = getPersonData(req.body);
    inObjPerson.ymd_start = tool.getToday();
    inObjPerson.ymd_upd = tool.getToday();
    inObjPerson.id_upd = req.user.id;

    //エラー情報
    let errors;

    //権限チェック
    if (req.user.role !== "社員") {
      errors.role = "社員権限のみ実行できます";
    }

    //入力チェック
    errors = validateData(req.body);

    if (errors) {
      //会社情報
      const retObjCompany = await m_company.findPKey(inObjPerson.id_company, "99991231");
      const retObjSelectCompany = await m_company.findForSelect();

      res.render("personform", {
        person: inObjPerson,
        company: retObjCompany,
        companies: retObjSelectCompany,
        mode: "insert",
        errors: errors,
      });
    } else {
      //個人IDの採番号
      const retObjPersonNo = await m_sq.getSqPerson();
      inObjPerson.id = "P" + ("00000" + retObjPersonNo.no).slice(-5);
      const retObjPerson = await m_person.insert(inObjPerson);

      // 会社に紐づいている場合は会社情報に戻る
      if (inObjPerson.id_company) {
        res.redirect("/company/" + inObjPerson.id_company);
      } else {
        res.redirect("/");
      }
    }
  })();
});

//個人情報の更新
router.post("/update", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjPerson = getPersonData(req.body);
    inObjPerson.ymd_upd = tool.getToday();
    inObjPerson.id_upd = req.user.id;

    //適用開始日を取得
    const ymd_target = req.body.selected_ymd_change;

    //以前の個人情報を取得
    const retObjBeforePerson = await m_person.findPKey(inObjPerson.id, inObjPerson.ymd_end);

    //会社情報
    const retObjCompany = await m_company.findPKey(inObjPerson.id_company, "99991231");

    //エラー情報
    let errors;

    //権限チェック
    if (req.user.role !== "社員") {
      errors.role = "社員権限のみ実行できます";
    }

    //入力チェック
    errors = validateData(req.body);
    if (errors) {
      const retObjSelectCompany = await m_company.findForSelect();
      res.render("personform", {
        person: inObjPerson,
        company: retObjCompany,
        companies: retObjSelectCompany,
        mode: "update",
        errors: errors,
      });
    } else {

      // 個人情報の内容が変更されている場合
      if (isUpdatePersonData(inObjPerson, retObjBeforePerson)) {

        //個人IDの採番号
        const retObjPersonNo = await m_sq.getSqPerson();
        inObjPerson.id = "P" + ("00000" + retObjPersonNo.no).slice(-5);

        // 会社の紐づけ（id_company）を変更した場合
        // 変更前の解約年月日を設定、変更後の入居年月日を設定
        if (retObjBeforePerson.id_company !== inObjPerson.id_company) {
          retObjBeforePerson.ymd_kaiyaku = tool.getYYYYMMDDBefore1Day(ymd_target);
          inObjPerson.ymd_nyukyo = ymd_target;

        // 会社の紐づけ（id_company）を変更していない場合（個人情報の変更のみ）
        // 変更前の適用終了を設定、変更後の適用開始を設定
        } else {
          retObjBeforePerson.ymd_end = tool.getYYYYMMDDBefore1Day(ymd_target);
          inObjPerson.ymd_start = ymd_target;
        }
        
        // 更新
        const retObjPersonUpd = await m_person.update(retObjBeforePerson);
        if (retObjPersonUpd.changedRows === 0) {
          const retObjSelectCompany = await m_company.findForSelect();
          let errors = {};
          errors.common = "更新対象はすでに削除されています";
          res.render("personform", {
            person: inObjPerson,
            company: retObjCompany,
            companies: retObjSelectCompany,
            mode: "update",
            errors: errors,
          });

        } else {
          // 変更後の個人情報で登録
          const retObjPerson = await m_person.insert(inObjPerson);

          // 会社に紐づいている場合は会社情報に戻る
          if (inObjPerson.id_company) {
            res.redirect("/company/" + inObjPerson.id_company);
          } else {
            res.redirect("/");
          }
        }

      // 上記外（個人情報が更新されていない）の場合
      } else {
        const retObjSelectCompany = await m_company.findForSelect();
        let errors = {};
        errors.common = "個人情報が変更されていません";
        res.render("personform", {
          person: inObjPerson,
          company: retObjCompany,
          companies: retObjSelectCompany,
          mode: "update",
          errors: errors,
        });
      }
    }
  })();
});

//個人情報の削除
router.post("/delete", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjPerson = getPersonData(req.body);

    // 解約日が設定されていない場合は、解約日も設定する
    if (inObjPerson.ymd_kaiyaku === "99991231") {
      inObjPerson.ymd_kaiyaku = tool.getToday();
    }
    inObjPerson.ymd_end = tool.getToday();

    //会社情報
    const retObjCompany = await m_company.findPKey(inObjPerson.id_company, "99991231");

    //エラー情報
    let errors;

    //権限チェック
    if (req.user.role !== "社員") {
      errors.role = "社員権限のみ実行できます";
    }

    //入力チェック
    if (errors) {
      res.render("personform", {
        person: inObjPerson,
        company: retObjCompany,
        companies: null,
        mode: "delete",
        errors: errors,
      });
    } else {
      const retObjPerson = await m_person.remove(inObjPerson);
      // 会社に紐づいている場合は会社情報に戻る
      if (req.body.id_company) {
        res.redirect("/company/" + req.body.id_company);
      } else {
        res.redirect("/");
      }
    }
  })();
});

//個人情報の解約
router.post("/cancel", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjPerson = {};
    inObjPerson.id = req.body.id;
    inObjPerson.ymd_kaiyaku = req.body.selected_ymd_kaiyaku ? req.body.selected_ymd_kaiyaku : tool.getToday();
    inObjPerson.ymd_upd = tool.getToday();
    inObjPerson.id_upd = req.user.id;

    const retObjPerson = await m_person.cancel(inObjPerson);

    // 会社IDが設定されている場合は、会社情報へ遷移
    if (req.body.id_company && req.body.id_company !== "") {
      res.redirect("/company/" + req.body.id_company);
    } else {
      res.redirect("/");
    }
  })();
});

const validateData = (body) => {
  let isValidated = true;
  let errors = {};

  if (!body.kubun_person) {
    isValidated = false;
    errors.kubun_person = "個人区分が未入力です。";
  }
  if (!body.name) {
    isValidated = false;
    errors.name = "個人名が未入力です。";
  } else {
    if (body.name.length > 100) {
      isValidated = false;
      errors.name = "個人名は100桁以下で入力してください。";
    }
  }
  if (body.kana) {
    if (body.kana.length > 100) {
      isValidated = false;
      errors.kana = "個人名カナは100桁以下で入力してください。";
    }
  }
  if (body.telno) {
    if (body.telno.length > 20) {
      isValidated = false;
      errors.telno = "電話番号は20桁以下で入力してください。";
    }
  }
  if (body.telno_mobile) {
    if (body.telno_mobile.length > 20) {
      isValidated = false;
      errors.telno_mobile = "携帯電話番号は20桁以下で入力してください。";
    }
  }
  if (body.email) {
    if (body.email.length > 100) {
      isValidated = false;
      errors.email = "メールアドレスは100桁以下で入力してください。";
    }
  }
  if (body.no_yubin) {
    if (body.no_yubin.length !== 8) {
      isValidated = false;
      errors.no_yubin = "郵便番号は8桁（XXX-XXXX形式）で入力してください。";
    }
  }
  if (body.todoufuken) {
    if (body.todoufuken.length > 100) {
      isValidated = false;
      errors.todoufuken = "都道府県は100桁以下で入力してください。";
    }
  }
  if (body.address) {
    if (body.address.length > 200) {
      isValidated = false;
      errors.address = "住所は200桁以下で入力してください。";
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

const getPersonData = (body) => {
  let inObj = {};
  inObj.id = body.id;
  inObj.id_company = body.id_company;
  inObj.kubun_person = body.kubun_person;
  inObj.name = body.name;
  inObj.kana = body.kana;
  inObj.telno = body.telno;
  inObj.telno_mobile = body.telno_mobile;
  inObj.email = body.email;
  inObj.no_yubin = body.no_yubin;
  inObj.todoufuken = body.todoufuken;
  inObj.address = body.address;
  inObj.ymd_nyukyo = body.ymd_nyukyo;
  inObj.ymd_kaiyaku = body.ymd_kaiyaku;
  inObj.ymd_start = body.ymd_start;
  inObj.ymd_end = body.ymd_end;
  inObj.ymd_upd = body.ymd_upd;
  inObj.id_upd = body.id_upd;
  inObj.bikou = body.bikou;
  return inObj;
};

const isUpdatePersonData = (obj1, obj2) => {
  if ((tool.returnvalueWithoutNull(obj1.id_company) !== tool.returnvalueWithoutNull(obj2.id_company)) || 
  (tool.returnvalueWithoutNull(obj1.kubun_person) !== tool.returnvalueWithoutNull(obj2.kubun_person)) || 
  (tool.returnvalueWithoutNull(obj1.name) !== tool.returnvalueWithoutNull(obj2.name)) || 
  (tool.returnvalueWithoutNull(obj1.kana) !== tool.returnvalueWithoutNull(obj2.kana)) || 
  (tool.returnvalueWithoutNull(obj1.telno) !== tool.returnvalueWithoutNull(obj2.telno)) || 
  (tool.returnvalueWithoutNull(obj1.telno_mobile) !== tool.returnvalueWithoutNull(obj2.telno_mobile)) ||
  (tool.returnvalueWithoutNull(obj1.email) !== tool.returnvalueWithoutNull(obj2.email)) ||
  (tool.returnvalueWithoutNull(obj1.no_yubin) !== tool.returnvalueWithoutNull(obj2.no_yubin)) ||
  (tool.returnvalueWithoutNull(obj1.todoufuken) !== tool.returnvalueWithoutNull(obj2.todoufuken)) ||
  (tool.returnvalueWithoutNull(obj1.address) !== tool.returnvalueWithoutNull(obj2.address))
  ) {
    return true;    
  } else {
    return false;
  }
}

module.exports = router;
