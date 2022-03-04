var express = require("express");
var router = express.Router();

const security = require("../../util/security");
const tool = require("../../util/tool");
const cron = require("../../util/cron");

const m_perinfo = require("../../model/perinfo");

/**
 * 会議室稼働率画面へ
 */
 router.get("/", security.authorize(), (req, res, next) => {
  (async () => {
    const retObjPer = await m_perinfo.selectAll();
    res.render("admin/top", {
      results: retObjPer,
    });
  })();
});

//部屋情報の登録
router.post("/recovery", security.authorize(), (req, res, next) => {

  (async () => {

    const yyyymm_recovery = req.body.yyyymm_target;
    const yyyymm_current = tool.getYYYYMMDD(new Date());
    const num = yyyymm_recovery - yyyymm_current.slice(0,6);

    await cron.dlinfo(num);

    await cron.clearYoyakuInfo(num);
  
    await cron.setYoyakuInfo(num);
  
    await tool.sleep(10000);

    await cron.setPerInfo(num);
        
    await res.redirect(req.baseUrl);

  })();

});

module.exports = router;
