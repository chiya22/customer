var express = require("express");
var router = express.Router();

const security = require("../../util/security");
const tool = require("../../util/tool");

const m_telno = require("../../model/telnos");

// TOPページ
router.get("/", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjTelno = await m_telno.findForAdmin();
    res.render("admin/telnos", {
    telnos: retObjTelno,
    });
  })();
});

// メニューから登録画面（telnoForm）へ
router.get("/insert", security.authorize(), (req, res, next) => {
  res.render("admin/telnoform", {
    telno: null,
    mode: "insert",
    message: null,
  });
});

//電話番号を指定して更新画面（telnoForm）へ
router.get("/update/:telno", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjTelno = await m_telno.findPKey(req.params.telno, '99991231');
    res.render("admin/telnoform", {
      telno: retObjTelno,
      mode: "update",
      message: null,
    });
  })();
});

//電話番号情報の登録
router.post("/insert", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjTelno = {};
    inObjTelno.telno = req.body.telno;
    inObjTelno.kubun = req.body.kubun;
    inObjTelno.place = req.body.place;
    inObjTelno.bikou = req.body.bikou;
    inObjTelno.ymd_start = tool.getToday();
    inObjTelno.ymd_upd = tool.getToday();
    inObjTelno.id_upd = req.user.id;
    try {
      const retObjTelno = await m_telno.insert(inObjTelno);
      res.redirect(req.baseUrl);
    } catch (err) {
      if (err.errno === 1062) {
        res.render("admin/telnoform", {
          telno: null,
          mode: "insert",
          message: "電話番号【" + inObjTelno.telno + "】はすでに存在しています",
        });
      } else {
        throw err;
      }
    }
  })();
});

//電話番号情報の更新
router.post("/update", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjTelno = {};
    inObjTelno.telno = req.body.telno;
    inObjTelno.kubun = req.body.kubun;
    inObjTelno.place = req.body.place;
    inObjTelno.bikou = req.body.bikou;
    inObjTelno.ymd_start = req.body.ymd_start;
    inObjTelno.ymd_end = req.body.ymd_end;
    inObjTelno.ymd_upd = tool.getToday();
    inObjTelno.id_upd = req.user.id;
    inObjTelno.before_ymd_end = req.body.before_ymd_end;
    const retObjTelno = await m_telno.update(inObjTelno);
    //更新時に対象レコードが存在しない場合
    if (retObjTelno.changedRows === 0) {
      res.render("admin/telnoform", {
        telno: inObj,
        mode: "update",
        message: "更新対象がすでに削除されています",
      });
    } else {
      res.redirect(req.baseUrl);
    }
  })();
});

//電話番号情報の削除
router.post("/delete", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjTelno = {};
    inObjTelno.telno = req.body.telno;
    inObjTelno.id_upd = req.user.id;

    try {
      const retObjTelno = await m_telno.remove(inObjTelno);
      res.redirect(req.baseUrl);
    } catch (err) {
      // 外部制約参照エラーの場合
      if (err && err.errno === 1451) {
        try {
          const retObjTelno_again = await m_telno.findPKey(inObjTelno.telno);
          res.render("admin/telnoform", {
            telno: retObjTelno_again,
            mode: "update",
            message: "削除対象の電話番号は使用されています",
          });
        } catch (err) {
          throw err;
        }
      } else {
        throw err;
      }
    }
  })();
});

module.exports = router;
