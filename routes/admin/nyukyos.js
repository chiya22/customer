var express = require("express");
var router = express.Router();

const security = require("../../util/security");
const tool = require("../../util/tool");

const m_nyukyo = require("../../model/nyukyos");

// TOPページ
router.get("/", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjNyukyo = await m_nyukyo.findForAdmin();
    res.render("admin/nyukyos", {
      nyukyos: retObjNyukyo,
    });
  })();
});

// メニューから登録画面（nyukyoForm）へ
router.get("/insert", security.authorize(), (req, res, next) => {
  res.render("admin/nyukyoform", {
    nyukyo: null,
    mode: "insert",
    message: null,
  });
});

//入居番号IDを指定して更新画面（nyukyoForm）へ
router.get("/update/:id", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjNyukyo = await m_nyukyo.findPKey(req.params.id);
    res.render("admin/nyukyoform", {
      nyukyo: retObjNyukyo,
      mode: "update",
      message: null,
    });
  })();
});

//入居番号情報の登録
router.post("/insert", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjNyukyo = {};
    inObjNyukyo.id = req.body.id;
    inObjNyukyo.ymd_start = tool.getToday();
    inObjNyukyo.ymd_upd = tool.getToday();
    inObjNyukyo.id_upd = req.user.id;
    try {
      const retObjNyukyo = await m_nyukyo.insert(inObjNyukyo);
      res.redirect(req.baseUrl);
    } catch (err) {
      if (err && err.errno === 1062) {
        res.render("admin/nyukyoform", {
          nyukyo: null,
          mode: "insert",
          message: "入居番号" + inObjNyukyo.id + "はすでに存在しています",
        });
      } else {
        throw err;
      }
    }
  })();
});

//入居番号情報の更新
router.post("/update", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjNyukyo = {};
    inObjNyukyo.id = req.body.id;
    inObjNyukyo.ymd_start = req.body.ymd_start;
    inObjNyukyo.ymd_end = req.body.ymd_end;
    inObjNyukyo.ymd_upd = tool.getToday();
    inObjNyukyo.id_upd = req.user.id;
    inObjNyukyo.before_ymd_end = req.body.before_ymd_end;

    const retObjNyukyo = await m_nyukyo.update(inObjNyukyo);
    //更新時に対象レコードが存在しない場合
    if (retObjNyukyo.changedRows === 0) {
      res.render("admin/nyukyoform", {
        nyukyo: inObj,
        mode: "update",
        message: "更新対象がすでに削除されています",
      });
    } else {
      res.redirect(req.baseUrl);
    }
  })();
});

//入居番号情報の削除
router.post("/delete", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjNyukyo = {};
    inObjNyukyo.id = req.body.id;
    inObjNyukyo.id_upd = req.user.id;

    try {
      const retObjNyukyo = await m_nyukyo.remove(inObjNyukyo);
      res.redirect(req.baseUrl);
    } catch (err) {
      if (err.errno === 1451) {
        try {
          const retObjNyukyo_again = await m_nyukyo.findPKey(inObjNyukyo.id);
          res.render("admin/nyukyoform", {
            nyukyo: retObjNyukyo_again,
            mode: "update",
            message: "削除対象の入居番号は使用されています",
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
