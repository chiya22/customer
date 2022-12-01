var express = require("express");
var router = express.Router();
const security = require("../../util/security");

const m_person = require("../../model/persons");
const m_nyukyo = require("../../model/nyukyos");
const m_company = require("../../model/companies");
const m_yoyaku = require("../../model/yoyakus");

const tool = require("../../util/tool");
const cron = require("../../util/cron");

const iconv = require('iconv-lite');
// const { cron } = require("../../config/app.config");

/* GET home page. */
router.get("/", security.authorize(), (req, res, next) => {
  res.render("admin/admin", {});
});

/* 個人リストダウンロード（名前順） */
router.post("/download/persons", (req, res, next) => {
  (async () => {
    const retObjNyukyoWithRoom = await m_nyukyo.findWithRoom();
    const retObjDownload = await m_person.findForDownload();

    let csv =
      "入居者番号,部屋,会社名・屋号,ふりがな（会社名）,利用者名,ふりがな（利用者名）,登録,携帯電話" +
      "\r\n";
    retObjDownload.forEach((obj) => {
      let name_room = [];
      retObjNyukyoWithRoom.forEach((roominfo) => {
        if (roominfo.id_nyukyo === obj.id_nyukyo) {
          name_room.push(roominfo.name_room);
        }
      });
      obj.name_room = name_room.join("/");
      csv +=
        obj.id_nyukyo +
        "," +
        obj.name_room +
        "," +
        obj.name_company +
        "," +
        obj.kana_company +
        "," +
        obj.name_person +
        "," +
        obj.kana_person +
        "," +
        obj.kubun_person +
        "," +
        obj.telno_mobile +
        "\r\n";
    });

    res.setHeader("Content-disposition", "attachment; filename=persons.csv");
    res.setHeader("Content-Type", "text/csv; charset=UTF-8");
    res.status(200).send(csv);
  })();
});

/* 個人リストダウンロード（入居者番号順） */
router.post("/download/personsordernyukyo", (req, res, next) => {
  (async () => {
    const retObjNyukyoWithRoom = await m_nyukyo.findWithRoom();
    const retObjDownload = await m_person.findForDownloadOrderNyukyo();
    csv =
      "入居者番号,部屋,会社名・屋号,ふりがな（会社名）,利用者名,ふりがな（利用者名）,登録,携帯電話" +
      "\r\n";
    retObjDownload.forEach((obj) => {
      let name_room = [];
      retObjNyukyoWithRoom.forEach((roominfo) => {
        if (roominfo.id_nyukyo === obj.id_nyukyo) {
          name_room.push(roominfo.name_room);
        }
      });
      obj.name_room = name_room.join("/");
      csv +=
        obj.id_nyukyo +
        "," +
        obj.name_room +
        "," +
        obj.name_company +
        "," +
        obj.kana_company +
        "," +
        obj.name_person +
        "," +
        obj.kana_person +
        "," +
        obj.kubun_person +
        "," +
        obj.telno_mobile +
        "\r\n";
    });

    res.setHeader("Content-disposition", "attachment; filename=persons_orderbynyukyo_.csv");
    res.setHeader("Content-Type", "text/csv; charset=UTF-8");
    res.status(200).send(csv);
  })();
});

/* 正面パネル会社リストダウンロード */
router.post("/download/companiespanelinfo", (req, res, next) => {
  (async () => {
    const retObjCompanyuPanelinfo = await m_company.findForDispPanel();
    csv =
      "行, 会社名・屋号,ふりがな,入居者番号,入居年月日,解約年月日" +
      "\r\n";
    retObjCompanyuPanelinfo.forEach((obj) => {
      csv +=
        obj.line +
        "," +
        obj.name +
        "," +
        obj.kana +
        "," +
        obj.id_nyukyo +
        "," +
        obj.ymd_nyukyo +
        "," +
        obj.ymd_kaiyaku +
        "\r\n";
    });

    res.setHeader("Content-disposition", "attachment; filename=companypanelinfo.csv");
    res.setHeader("Content-Type", "text/csv; charset=UTF-8");
    res.status(200).send(csv);
  })();
});

/* 入金済予約情報ダウンロード */
router.post("/download/yoyakunyukinzumi", (req, res, next) => {
  (async () => {
    const target_yyyymm = req.body.target_yyyymm;
    const retObjYoyakuNyukinZumi = await m_yoyaku.downloadNyukinZumi(target_yyyymm);
    csv =
      "ID, 登録年月日,利用年月日,更新年月日,部屋区分名,部屋名,予約時間,開始時間,終了時間,利用者ID,利用者名,利用者名（カナ）,郵便番号,住所,メールアドレス,電話番号,目的,受付者,人数,価格,支払状況,備考" +
      "\r\n";
      retObjYoyakuNyukinZumi.forEach((obj) => {
      csv +=
        obj.id +
        "," +
        tool.returndateWithslash(obj.ymd_add) +
        "," +
        tool.returndateWithslash(obj.ymd_riyou) +
        "," +
        (obj.ymd_upd? tool.returndateWithslash(obj.ymd_upd):'') +
        "," +
        obj.nm_kubun_room +
        "," +
        obj.nm_room +
        "," +
        obj.time_yoyaku +
        "," +
        obj.time_start +
        "," +
        obj.time_end +
        "," +
        obj.id_riyousha +
        "," +
        obj.nm_riyousha +
        "," +
        obj.kana_riyousha +
        "," +
        obj.no_yubin +
        "," +
        obj.address +
        "," +
        obj.email +
        "," +
        obj.telno +
        "," +
        obj.mokuteki +
        "," +
        obj.nm_uketuke +
        "," +
        obj.num_person +
        "," +
        obj.price +
        "," +
        obj.stat_shiharai +
        "," +
        (obj.bikou?obj.bikou:'') +
        "\r\n";
    });

    res.setHeader("Content-disposition", "attachment; filename=yoyakunyukinzumi.csv");
    res.setHeader("Content-Type", "text/csv; charset=UTF-8");
    res.status(200).send(iconv.encode(csv, "Shift_JIS"));
  })();
});

//通知メールのリカバリー
router.get("/mailrecovery", security.authorize(), (req, res, next) => {

  (async () => {

    await cron.alertTrelloMail();

    await cron.alertOutairirekiMail();

    await cron.alertOutairirekiKaigiMail();

    await cron.alertMishuKaigiMail();

    await cron.alertYoyakuKanshiMail();
            
    await res.redirect(req.baseUrl);

  })();

});

module.exports = router;
