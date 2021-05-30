var express = require("express");
var router = express.Router();

const security = require("../../util/security");
const tool = require("../../util/tool");

const m_cabinet = require("../../model/cabinet");

// TOPページ
router.get("/", security.authorize(), (req, res) => {
  (async () => {
    const retObjCabinet = await m_cabinet.findForAdmin();
    res.render("admin/cabinets", {
      cabinets: retObjCabinet,
    });
  })();
});

// メニューから登録画面（cabinetForm）へ
router.get("/insert", security.authorize(), (req, res) => {
  res.render("admin/cabinetform", {
    cabinet: null,
    mode: "insert",
    message: null,
  });
});

//キャビネットIDを指定して更新画面（cabinetForm）へ
router.get("/update/:id", security.authorize(), (req, res) => {
  (async () => {
    const retObjCabinet = await m_cabinet.findPKey(req.params.id);
    res.render("admin/cabinetform", {
      cabinet: retObjCabinet,
      mode: "update",
      message: null,
    });
  })();
});

//キャビネット情報の登録
router.post("/insert", security.authorize(), (req, res) => {
  (async () => {
    let inObjCabinet = {};
    inObjCabinet.id = req.body.id;
    inObjCabinet.id_nyukyo = req.body.id_nyukyo;
    inObjCabinet.place = req.body.place;
    inObjCabinet.name = req.body.name;
    inObjCabinet.ymd_start = tool.getToday();
    inObjCabinet.ymd_upd = tool.getToday();
    inObjCabinet.id_upd = req.user.id;
    try {
      const retObjCabinet = await m_cabinet.insert(inObjCabinet);
      res.redirect(req.baseUrl);
    } catch (err) {
      if (err.errno === 1062) {
        res.render("admin/cabinetform", {
          cabinet: null,
          mode: "insert",
          message: "キャビネット【" + inObjCabinet.id + "】はすでに存在しています",
        });
      } else {
        throw err;
      }
    }
  })();
});

//キャビネット情報の更新
router.post("/update", security.authorize(), (req, res) => {
  (async () => {
    let inObjCabinet = {};
    inObjCabinet.id = req.body.id;
    inObjCabinet.place = req.body.place;
    inObjCabinet.name = req.body.name;
    inObjCabinet.ymd_start = req.body.ymd_start;
    inObjCabinet.ymd_end = req.body.ymd_end;
    inObjCabinet.ymd_upd = tool.getToday();
    inObjCabinet.id_upd = req.user.id;
    inObjCabinet.before_ymd_end = req.body.before_ymd_end;
    const retObjCabinet = await m_cabinet.update(inObjCabinet);
    //更新時に対象レコードが存在しない場合
    if (retObjCabinet.changedRows === 0) {
      res.render("admin/cabinetform", {
        cabinet: inObjCabinet,
        mode: "update",
        message: "更新対象がすでに削除されています",
      });
    } else {
      res.redirect(req.baseUrl);
    }
  })();
});

//キャビネット情報の削除
router.post("/delete", security.authorize(), (req, res) => {
  (async () => {
    let inObjCabinet = {};
    inObjCabinet.id = req.body.id;
    inObjCabinet.id_upd = req.user.id;
    try {
      const retObjCabinet = await m_cabinet.remove(inObjCabinet);
      res.redirect(req.baseUrl);
    } catch (err) {
      // 外部制約参照エラーの場合
      if (err.errno === 1451) {
        try {
          const retObjCabinet_again = await m_cabinet.findPKey(inObjCabinet.id);
          res.render("admin/cabinetform", {
            cabinet: retObjCabinet_again,
            mode: "update",
            message: "削除対象のキャビネットは使用されています",
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
