var express = require("express");
var router = express.Router();

const security = require("../../util/security");
const tool = require("../../util/tool");

const m_room = require("../../model/rooms");

// TOPページ
router.get("/", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjRomm = await m_room.findForAdmin();
    res.render("admin/rooms", {
      rooms: retObjRomm,
    });
  })();
});

// メニューから登録画面（roomForm）へ
router.get("/insert", security.authorize(), (req, res, next) => {
  res.render("admin/roomform", {
    room: null,
    mode: "insert",
    message: null,
  });
});

//部屋IDを指定して更新画面（roomForm）へ
router.get("/update/:id", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjRoom = await m_room.findPKey(req.params.id);
    res.render("admin/roomform", {
      room: retObjRoom,
      mode: "update",
      message: null,
    });
  })();
});

//部屋情報の登録
router.post("/insert", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjRoom = {};
    inObjRoom.id = req.body.id;
    inObjRoom.place = req.body.place;
    inObjRoom.floor = req.body.floor;
    inObjRoom.person = req.body.person;
    inObjRoom.name = req.body.name;
    inObjRoom.ymd_start = tool.getToday();
    inObjRoom.ymd_upd = tool.getToday();
    inObjRoom.id_upd = req.user.id;
    try {
      const retObjRoom = await m_room.insert(inObjRoom);
      res.redirect(req.baseUrl);
    } catch (err) {
      if (err.errno === 1062) {
        res.render("admin/roomform", {
          room: null,
          mode: "insert",
          message: "部屋【" + inObjRoom.id + "】はすでに存在しています",
        });
      } else {
        throw err;
      }
    }
  })();
});

//部屋情報の更新
router.post("/update", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjRoom = {};
    inObjRoom.id = req.body.id;
    inObjRoom.place = req.body.place;
    inObjRoom.floor = req.body.floor;
    inObjRoom.person = req.body.person;
    inObjRoom.name = req.body.name;
    inObjRoom.ymd_start = req.body.ymd_start;
    inObjRoom.ymd_end = req.body.ymd_end;
    inObjRoom.ymd_upd = tool.getToday();
    inObjRoom.id_upd = req.user.id;
    inObjRoom.before_ymd_end = req.body.before_ymd_end;
    const retObjRoom = await m_room.update(inObjRoom);
    //更新時に対象レコードが存在しない場合
    if (retObjRoom.changedRows === 0) {
      res.render("admin/roomform", {
        room: inObj,
        mode: "update",
        message: "更新対象がすでに削除されています",
      });
    } else {
      res.redirect(req.baseUrl);
    }
  })();
});

//部屋情報の削除
router.post("/delete", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjRoom = {};
    inObjRoom.id = req.body.id;
    inObjRoom.id_upd = req.user.id;

    try {
      const retObjRoom = await m_room.remove(inObjRoom);
      res.redirect(req.baseUrl);
    } catch (err) {
      // 外部制約参照エラーの場合
      if (err && err.errno === 1451) {
        try {
          const retObjRoom_again = await m_room.findPKey(inObjRoom.id);
          res.render("admin/roomform", {
            room: retObjRoom_again,
            mode: "update",
            message: "削除対象の部屋は使用されています",
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
