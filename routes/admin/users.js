var express = require("express");
var router = express.Router();

const security = require("../../util/security");
const hash = require("../../util/hash").digest;
const tool = require("../../util/tool");

const users = require("../../model/users");

// TOPページ
router.get("/", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjUser = await users.find();
    res.render("admin/users", {
      users: retObjUser,
    });
  })();
});

// メニューから登録画面（usersForm）へ
router.get("/insert", security.authorize(), (req, res, next) => {
  res.render("admin/userform", {
    user: null,
    mode: "insert",
    message: null,
  });
});

//ユーザIDを指定して更新画面（usersForm）へ
router.get("/update/:id", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjUser = await users.findPKey(req.params.id);
    res.render("admin/userform", {
      user: retObjUser[0],
      mode: "update",
      message: null,
    });
  })();
});

//ユーザ情報の登録
router.post("/insert", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjUser = {};
    inObjUser.id = req.body.id;
    inObjUser.name = req.body.name;
    inObjUser.pwd = hash(req.body.password);
    inObjUser.role = req.body.role;
    inObjUser.ymd_start = tool.getToday();
    inObjUser.ymd_upd = tool.getToday();
    inObjUser.id_upd = req.user.id;

    try {
      const retObjUsers = await users.insert(inObjUser);
      res.redirect(req.baseUrl);
    } catch (err) {
      if (err.errno === 1062) {
        res.render("admin/userform", {
          user: inObjUser,
          mode: "insert",
          message: "ユーザー【" + inObjUser.id + "】はすでに存在しています",
        });
      } else {
        throw err;
      }
    }
  })();
});

//ユーザ情報の更新
router.post("/update/update", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjUser = {};
    inObjUser.id = req.body.id;
    inObjUser.name = req.body.name;
    inObjUser.password = hash(req.body.password);
    inObjUser.role = req.body.role;
    inObjUser.ymd_start = req.body.ymd_start;
    inObjUser.ymd_end = req.body.ymd_end;
    inObjUser.ymd_upd = tool.getToday();
    inObjUser.id_upd = req.user.id;
    inObjUser.before_ymd_end = req.body.before_ymd_end;
    const retObjUser = await users.update(inObjUser);
    //更新時に対象レコードが存在しない場合
    if (retObjUser.changedRows === 0) {
      res.render("admin/userform", {
        user: inObjUser,
        mode: "update",
        message: "更新対象がすでに削除されています",
      });
    } else {
      res.redirect(req.baseUrl);
    }
  })();
});

//ユーザ情報の削除
router.post("/update/delete", security.authorize(), (req, res, next) => {
  (async () => {
    let inObjUser = {};
    inObjUser.id = req.body.id;
    inObjUser.id_upd = req.user.id;
    try {
      const retObjUser = await users.remove(inObjUser);
      res.redirect(req.baseUrl);
    } catch (err) {
      if (err && err.errno === 1451) {
        try {
          const retObjUser_again = await ussers.findPKey(inObjUser.id);
          res.render("admin/userform", {
            user: retObjUser_again[0],
            mode: "update",
            message: "削除対象のユーザーは使用されています",
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
