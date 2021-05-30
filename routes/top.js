const express = require("express");
const router = express.Router();
const security = require("../util/security");
const perinfo = require("../model/perinfo");

// index
router.get("/", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjPer = await perinfo.selectAll();
    res.render("top", {
      results: retObjPer,
    });
  })();
});

module.exports = router;
