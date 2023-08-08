var express = require("express");
var router = express.Router();

const security = require("../../util/security");
const tool = require("../../util/tool");

const ischeckyoyaku = require("../../model/ischeckyoyaku");

// TOPページ
router.get("/", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjisCheckYoyaku = await ischeckyoyaku.findAllWithName();
    res.render("admin/ischeckyoyaku", {
    ischeckyoyakus: retObjisCheckYoyaku,
    });
  })();
});

module.exports = router;
