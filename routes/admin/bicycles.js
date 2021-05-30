var express = require("express");
var router = express.Router();

const security = require("../../util/security");
const tool = require("../../util/tool");

const m_bicycle = require("../../model/bicycles");

// TOPページ
router.get("/", security.authorize(), (req, res) => {
  (async () => {
    const retObjBicycle = await m_bicycle.findForAdmin();
    res.render("admin/bicycles", {
      bicycles: retObjBicycle,
    });
  })();
});

// メニューから登録画面（bicycleForm）へ
router.get("/insert", security.authorize(), (req, res) => {
  res.render("admin/bicycleform", {
    bicycle: null,
    mode: "insert",
    message: null,
  });
});

//部屋IDを指定して更新画面（roomForm）へ
router.get("/update/:id", security.authorize(), (req, res) => {
  (async () => {
    const retObjBicycle = await m_bicycle.findPKey(req.params.id);
    res.render("admin/bicycleform", {
      bicycle: retObjBicycle,
      mode: "update",
      message: null,
    });
  })();
});

//部屋情報の登録
router.post("/insert", security.authorize(), (req, res) => {
  (async () => {
    let inObjBicycle = {};
    inObjBicycle.id = req.body.id;
    inObjBicycle.name = req.body.name;
    inObjBicycle.bikou = req.body.bikou;
    inObjBicycle.ymd_start = tool.getToday();
    inObjBicycle.ymd_upd = tool.getToday();
    inObjBicycle.id_upd = req.user.id;
    try {
      const retObjBicycle = await m_bicycle.insert(inObjBicycle);
      res.redirect(req.baseUrl);
    } catch (err) {
      if (err.errno === 1062) {
        res.render("admin/bicycleform", {
          bicycle: null,
          mode: "insert",
          message: "駐輪場【" + inObjBicycle.id + "】はすでに存在しています",
        });
      } else {
        throw err;
      }
    }
  })();
});

//部屋情報の更新
router.post("/update", security.authorize(), (req, res) => {
  (async () => {
    let inObjBicycle = {};
    inObjBicycle.id = req.body.id;
    inObjBicycle.name = req.body.name;
    inObjBicycle.bikou = req.body.bikou;
    inObjBicycle.ymd_start = req.body.ymd_start;
    inObjBicycle.ymd_end = req.body.ymd_end;
    inObjBicycle.before_ymd_end = req.body.before_ymd_end;
    inObjBicycle.ymd_upd = tool.getToday();
    inObjBicycle.id_upd = req.user.id;
    const retObjBicycle = await m_bicycle.update(inObjBicycle);
    //更新時に対象レコードが存在しない場合
    if (retObjBicycle.changedRows === 0) {
      res.render("admin/bicycleform", {
        bicycle: inObjBicycle,
        mode: "update",
        message: "更新対象がすでに削除されています",
      });
    } else {
      res.redirect(req.baseUrl);
    }
  })();
});

//部屋情報の削除
router.post("/delete", security.authorize(), (req, res) => {
  (async () => {
    let inObjBicycle = {};
    inObjBicycle.id = req.body.id;
    inObjBicycle.id_upd = req.user.id;
    try {
      const retObjBicycle = await m_bicycle.remove(inObjBicycle);
      res.redirect(req.baseUrl);
    } catch (err) {
      // 外部制約参照エラーの場合
      if (err.errno === 1451) {
        try {
          const retObjBicycle_again = await m_room.findPKey(inObjBicycle.id);
          res.render("admin/bicycleform", {
            bicycle: retObjBicycle_again,
            mode: "update",
            message: "削除対象の駐輪場は使用されています",
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
