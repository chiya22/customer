var express = require("express");
var router = express.Router();

const security = require("../../util/security");
const tool = require("../../util/tool");

const m_car = require("../../model/cars");

// TOPページ
router.get("/", security.authorize(), (req, res) => {
  (async () => {
    const retObjCar = await m_car.findForAdmin();
    res.render("admin/cars", {
      cars: retObjCar,
    });
  })();
});

// メニューから登録画面（carForm）へ
router.get("/insert", security.authorize(), (req, res) => {
  res.render("admin/carform", {
    car: null,
    mode: "insert",
    message: null,
  });
});

//部屋IDを指定して更新画面（carForm）へ
router.get("/update/:id", security.authorize(), (req, res) => {
  (async () => {
    const retObjCar = await m_car.findPKey(req.params.id);
    res.render("admin/carform", {
      car: retObjCar,
      mode: "update",
      message: null,
    });
  })();
});

//部屋情報の登録
router.post("/insert", security.authorize(), (req, res) => {
  (async () => {
    let inObjCar = {};
    inObjCar.id = req.body.id;
    inObjCar.name = req.body.name;
    inObjCar.bikou = req.body.bikou;
    inObjCar.ymd_start = tool.getToday();
    inObjCar.ymd_upd = tool.getToday();
    inObjCar.id_upd = req.user.id;
    try {
      const retObjCar = await m_car.insert(inObjCar);
      res.redirect(req.baseUrl);
    } catch (err) {
      if (err.errno == 1062) {
        res.render("admin/carform", {
          car: null,
          mode: "insert",
          message: "駐車場【" + inObjCar.id + "】はすでに存在しています",
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
    let inObjCar = {};
    inObjCar.id = req.body.id;
    inObjCar.name = req.body.name;
    inObjCar.bikou = req.body.bikou;
    inObjCar.ymd_start = req.body.ymd_start;
    inObjCar.ymd_end = req.body.ymd_end;
    inObjCar.before_ymd_end = req.body.before_ymd_end;
    inObjCar.ymd_upd = tool.getToday();
    inObjCar.id_upd = req.user.id;
    const retObjCar = await m_car.update(inObjCar);
    //更新時に対象レコードが存在しない場合
    if (retObjCar.changedRows === 0) {
      res.render("admin/carform", {
        car: inObjCar,
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
    let inObjCar = {};
    inObjCar.id = req.body.id;
    inObjCar.id_upd = req.user.id;
    try {
      const retObjCar = await m_car.remove(inObjCar);
      res.redirect(req.baseUrl);
    } catch (err) {
      if (err.errno === 1451) {
        try {
          const retObjCar_again = m_room.findPKey(inObjCar.id);
          res.render("admin/carform", {
            car: retObjCar_again,
            mode: "update",
            message: "削除対象の駐車場は使用されています",
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
