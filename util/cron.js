const config = require("../config/app.config");
const log4js = require("log4js");
const logger = log4js.configure("./config/log4js-config.json").getLogger();

const cron = require("node-cron");

const m_outai = require("../model/outais");
const m_yoyaku = require("../model/yoyakus");
const m_riyousha = require("../model/riyoushas");
const m_perinfo = require("../model/perinfo");
const m_ischeckyoyaku = require("../model/ischeckyoyaku");

const readline = require("readline");
const mail = require("./sendmail");
const iconv = require("iconv-lite");
const puppeteer = require("puppeteer");
const tool = require("./tool");
const fs = require("fs");

/**
 * Trelloの情報を通知する
 */
const alertTrelloMail = async () => {

  let content = `毎日Trelloのタスクを確認し、更新しましょう！\r\n\r\n-----------------------------------------------------\r\n`;
  content += `https://trello.com/b/vTUUegIw/コンシェルジュ業務\r\n`;
  content += `https://trello.com/b/kJnhN0Kj/入退去関連\r\n`;

  //メール送信
  mail.send("タスク確認", content);

  logger.info(`cronより通知メールを送信しました（Trello）：${new Date()}`);

}

/**
 * 応対履歴の未完了情報を通知する
 */
const alertOutairirekiMail = async () => {
  query =
  'select * from(SELECT o.*,ua.name AS name_add, uu.name AS name_upd, ifnull(c.name, "会社指定なし") as name_company FROM outais o left outer JOIN companies c ON o.id_company = c.id LEFT OUTER JOIN users ua ON ua.id = o.id_add LEFT OUTER JOIN users uu ON uu.id = o.id_upd) ocu WHERE ocu.status != "完了" ORDER BY ocu.ymdhms_upd desc';
  const retObjoutai = await m_outai.setSQL(query);
  let content = `未完了の応対履歴一覧となります。\r\n内容を確認し、対応を行ってください。\r\n\r\n-----------------------------------------------------\r\n`;

  retObjoutai.forEach((outai) => {
    content += `会社：${outai.name_company}\r\nステータス：${outai.status}\r\n登録日時：${outai.ymdhms_add}\r\n登録者：${outai.name_add}\r\n更新日時：${outai.ymdhms_upd}\r\n更新者：${outai.name_upd}\r\n＜内容＞\r\n${outai.content}\r\n${config.url.outai}${outai.id}\r\n------------------------------------------------------\r\n`;
  });

  //メール送信
  mail.send("応対履歴一覧", content);

  logger.info(`cronより通知メールを送信しました（入居者）：${new Date()}`);
}

/**
 * 応対履歴（会議室）の未完了情報を通知する
 */
const alertOutairirekiKaigiMail = async () => {
  query =
  'select * from(SELECT o.*,ua.name AS name_add, uu.name AS name_upd, ifnull(r.name, "利用者指定なし") as name_riyousha FROM outaiskaigi o left outer JOIN riyoushas r ON o.id_riyousha = r.id LEFT OUTER JOIN users ua ON ua.id = o.id_add LEFT OUTER JOIN users uu ON uu.id = o.id_upd) oru WHERE oru.status != "完了" ORDER BY oru.ymdhms_upd desc';
  const retObjOutai = await m_outai.setSQL(query);
  let content = `未完了の応対履歴（会議室）一覧となります。\r\n内容を確認し、対応を行ってください。\r\n\r\n-----------------------------------------------------\r\n`;

  retObjOutai.forEach((outai) => {
    content += `利用者：${outai.name_riyousha}\r\nステータス：${outai.status}\r\n登録日時：${outai.ymdhms_add}\r\n登録者：${outai.name_add}\r\n更新日時：${outai.ymdhms_upd}\r\n更新者：${outai.name_upd}\r\n＜内容＞\r\n${outai.content}\r\n${config.url.outaikaigi}${outai.id}\r\n------------------------------------------------------\r\n`;
  });

  //メール送信
  mail.send("応対履歴一覧（会議室）", content);

  logger.info(
    `cronより通知メールを送信しました（会議室）：${new Date()}`
  );
}

/**
 * 会議室予約の未入金情報を通知する
 */
const alertMishuKaigiMail = async () => {

  const targetYYYYMMDD = tool.getYYYYMMDD7dayAfter();
  const query =
    'SELECT y.* FROM yoyakus y WHERE y.stat_shiharai <> "受" AND y.id_riyousha <> "00001" AND y.id_riyousha <> "10001"  AND y.ymd_riyou < ' +
    targetYYYYMMDD +
    ' ORDER BY y.ymd_riyou, y.id_riyousha';

  const retObjYoyaku = await m_yoyaku.setSQL(query);
  let content = `直近1週間における未入金の会議室予約情報一覧となります。\r\n内容を確認し、対応を行ってください。\r\n\r\n-----------------------------------------------------\r\n`;
  content += `利用日 | 利用者 | 会議室名 | 時間 | 金額 | 備考\r\n`;
  let content_nyukyo = `\r\n▼入居者まとめて請求対象\r\n利用日 | 利用者 | 会議室名 | 時間 | 金額 | 備考\r\n`;
  retObjYoyaku.forEach((yoyaku) => {
    // 入居者でかつ、利用日が過去の場合
    if (yoyaku.nm_riyousha.indexOf("■") !== -1) {
      content_nyukyo += `${tool.returndateWithslash(yoyaku.ymd_riyou)} | ${yoyaku.nm_riyousha}(${yoyaku.id_riyousha}) | ${yoyaku.nm_room} | ${yoyaku.time_yoyaku} | ${yoyaku.price.toLocaleString()} | ${tool.returnvalueWithoutNull(yoyaku.bikou)}\r\n`
    } else {
      content += `${tool.returndateWithslash(yoyaku.ymd_riyou)} | ${yoyaku.nm_riyousha}(${yoyaku.id_riyousha}) | ${yoyaku.nm_room} | ${yoyaku.time_yoyaku} | ${yoyaku.price.toLocaleString()} | ${tool.returnvalueWithoutNull(yoyaku.bikou)}\r\n`
    }
  });

  //メール送信
  mail.send("未入金会議室予約情報", content + content_nyukyo);

  logger.info(
    `cronより通知メールを送信しました（未入金会議室予約）：${new Date()}`
  );
}

/**
 * 監視対象となっている利用者の会議室予約情報を通知する
 */
const alertYoyakuKanshiMail = async () => {

  let content = `会議室予約情報の監視結果の一覧となります。\r\n\r\n-----------------------------------------------------\r\n`;
  content += `利用日 | 利用者(ID) | 会議室名 | 時間 | 金額 | 備考\r\n`;

  // 当日を設定
  const targetYYYYMMDD = tool.getYYYYMMDD(new Date());

  // 監視対象利用者の会議室予約が当日以降に存在するか確認する
  const retObjCheckYoyaku = await m_ischeckyoyaku.findwithYoyaku(targetYYYYMMDD);

  // 会議室予約情報が存在するかチェック
  if (retObjCheckYoyaku) {
    // 予約情報の出力
    retObjCheckYoyaku.forEach((yoyaku) => {
      content += `${tool.returndateWithslash(yoyaku.ymd_riyou)} | ${yoyaku.nm_riyousha}(${yoyaku.id_riyousha}) | ${yoyaku.nm_room} | ${yoyaku.time_yoyaku} | ${yoyaku.price.toLocaleString()} | ${tool.returnvalueWithoutNull(yoyaku.bikou)}\r\n`
    })
  }          
  
  //メール送信
  mail.send("会議室予約監視一覧", content);

  logger.info(
    `cronより通知メールを送信しました（会議室予約監視）：${new Date()}`
  );

}

// cron設定
const startcron = () => {
  if (config.cron.effective === "on") {

    // エラー検知
    cron.schedule(config.cron.checkErrInLogfile, () => {

      const logfilepath = process.cwd() + "\\logs\\crud.log";
      const logcontent = fs.readFileSync(logfilepath, "utf-8");
      const logcontentlist = logcontent.split("\r\n");
      const regexp = RegExp('err:', 'g')

      let mailbody = '';
      for (let i=0;i < logcontentlist.length; i++) {
        if (regexp.test(logcontentlist[i])) {
          mailbody += logcontentlist[i] + "\r\n";
        }
      }

      //メール送信
      if (mailbody !== '') {
        mail.sendByXserer("【入居者管理メール送信】エラー発生", mailbody);
        logger.info(`cronより通知メールを送信しました（エラーチェック）：${new Date()}`);
      } else {
        logger.info(`エラーはありませんでした：${new Date()}`);
      }

    });


    // Trelloタスクリンク通知メール
    cron.schedule(config.cron.trello, () => {
      alertTrelloMail();
    });

    // 応対履歴通知メール
    cron.schedule(config.cron.outai, () => {
      alertOutairirekiMail();
    })

    // 応対履歴（会議室）通知メール
    cron.schedule(config.cron.outaikaigi, () => {
      alertOutairirekiKaigiMail();
    })

    // 未入金情報通知メール
    cron.schedule(config.cron.mishukaigi, () => {
      alertMishuKaigiMail();
    })

    // 予約監視対象利用者の会議室予約確認
    cron.schedule(config.cron.checkyoyaku, () => {
      alertYoyakuKanshiMail();
    })

    // 会議室　利用者登録情報ダウンロード
    cron.schedule(config.cron.dlriyousha, () => {
      (async () => {
        const browser = await puppeteer.launch({ headless: true });

        let page = await browser.newPage();

        await page.goto(config.url.kanri, { waitUntil: "domcontentloaded" });

        // ログイン
        await page.type('input[name="in_office"]', config.login_id);
        await page.type('input[name="in_opassword"]', config.login_passwd);
        await page.click(
          "body > table > tbody > tr > td > table > tbody > tr:nth-child(1) > td > form > table:nth-child(2) > tbody > tr > td:nth-child(2) > input"
        );

        await page.waitForTimeout(1000);
        // await page.waitForNavigation({waitUntil: 'domcontentloaded'});

        // 管理画面から「管理者メニュー」をクリック
        const menu = await page.$(
          "body > table > tbody > tr > td > table > tbody > tr > td > table:nth-child(2) > tbody > tr:nth-child(3) > td:nth-child(2) > input[type=image]:nth-child(6)"
        );
        await menu.click();

        await page.waitForTimeout(2000);

        // 新しく開いたページを取得
        let newPage = await getNewPage(page);

        // パスワードの設定
        await newPage.type(
          'input[name="in_managerpassword"]',
          config.login_passwd
        );
        const inputElement = await newPage.$("input[type=submit]");
        await inputElement.click();

        await newPage.waitForTimeout(2000);

        // 「ダウンロード」のクリック
        await newPage.click(
          "body > div:nth-child(3) > table > tbody > tr > th:nth-child(6) > img"
        );

        await newPage.waitForTimeout(2000);

        // 「登録車情報ダウンロード」のクリック
        await newPage.click(
          "#inbody > div > div:nth-child(2) > div:nth-child(1) > div.waku_5 > img"
        );

        await newPage.waitForTimeout(2000);

        // 新しく開いたページを取得
        let newPageTouroku = await getNewPage(newPage);

        // Promptが出たら必ずOKとする
        newPageTouroku.on("dialog", async (dialog) => {
          await dialog.accept();
        });

        const beforeOneMontYYYYMM = getCurrentYYYYMM(-1);
        const startYYYY = beforeOneMontYYYYMM.slice(0, 4);
        const startMM = "" + Number(beforeOneMontYYYYMM.slice(-2));
        const currentYYYYMM = getCurrentYYYYMM(0);
        const currentYYYY = currentYYYYMM.slice(0, 4);
        const currentMM = "" + Number(currentYYYYMM.slice(-2));

        // 開始へ設定する年月
        await newPageTouroku.select('select[name="start_y"]', startYYYY);
        await newPageTouroku.select('select[name="start_m"]', startMM);
        await newPageTouroku.select('select[name="end_y"]', currentYYYY);
        await newPageTouroku.select('select[name="end_m"]', currentMM);
        // await newPageTouroku.select('select[name="end_y"]', '2020');
        // await newPageTouroku.select('select[name="end_m"]', '12');

        // 「項目名-全選択」をクリックする
        await newPageTouroku.click(
          "#inbody > form > table > tbody > tr:nth-child(2) > td.reserve_screen > a:nth-child(2)"
        );
        // 「登録者データ」をクリックする
        await newPageTouroku.click("#inbody > form > p > input.btn_150-30");

        await newPage.waitForTimeout(2000);

        // 新しく開いたページを取得
        let newPageResult = await getNewPage(newPageTouroku);

        const a_tag = await newPageResult.$("a");
        if (a_tag) {
          await logger.info(
            `会議室マスタ情報をダウンロードしました：${new Date()}`
          );

          // ダウンロード先の設定
          await page._client.send("Page.setDownloadBehavior", {
            behavior: "allow",
            downloadPath: config.dlpath,
          });
          await a_tag.click();
          await page.waitForTimeout(10000);
        } else {
          await logger.info(
            `会議室マスタ情報がありませんでした：${new Date()}`
          );
        }

        /**
         * 新しく開いたページを取得
         * @param {page} page もともと開いていたページ
         * @returns {page} 別タブで開いたページ
         */
        async function getNewPage(page) {
          const pageTarget = await page.target();
          const newTarget = await browser.waitForTarget(
            (target) => target.opener() === pageTarget
          );
          const newPage = await newTarget.page();
          await newPage.waitForSelector("body");
          return newPage;
        }

        await browser.close();
      })();
    });

    // 会議室　利用者情報取込
    cron.schedule(config.cron.setriyousha, () => {

      // ダウンロードディレクトリにあるcsvファイルを取得する
      let targetfilename = "";
      fs.readdirSync(config.dlpath).forEach((filename) => {

        // *mdl.csvのファイルの場合処理をする
        if (filename.slice(-7) === "mdl.csv") {
          targetfilename = filename;

          // csvファイルはShift-JISのため
          const src = fs
            .createReadStream(config.dlpath + "\\" + filename)
            .pipe(iconv.decodeStream("Shift_JIS"));

          src.on("data", (chunk) => {

            let detaillog = "";
            const lines = chunk.split("\n");
            lines.forEach((line) => {
              let linecontents = line.split(",");
              if (linecontents[0] !== "利用者" && linecontents[0] !== "") {
                logger.info(`更新前情報：${line}`);

                // linecontentsの項目
                // 00:利用者
                // 01:ふりがな
                // 02:生年月日
                // 03:性別
                // 04:郵便番号
                // 05:住所
                // 06:電話番号
                // 07:お知らせメール
                // 08:E-mail(1)
                // 09:E-mail(2)
                // 10:利用者区分
                // 11:ＶＩＰ区分
                // 12:施設管理番号
                // 13:有効期限
                // 14:備考
                // 15:登録日
                // 16:更新日

                // yyyy年mm月dd日　⇒　yyyymmdd
                const target_ymd_upd =
                  linecontents[16].slice(0, 4) +
                  linecontents[16].slice(5, 7) +
                  linecontents[16].slice(8, 10);
                const target_ymd_add =
                  linecontents[15].slice(0, 4) +
                  linecontents[15].slice(5, 7) +
                  linecontents[15].slice(8, 10);

                (async () => {
                  let inObj = {};
                  inObj.id = linecontents[12];
                  linecontents[0] = linecontents[0]
                    .replace(/ /g, "　")
                    .replace(/[*]/g, "＊");

                  const retObjRiyousha = await m_riyousha.findPKey(linecontents[12]);

                  // 新規登録用、更新用のオブジェクトを作成
                  inObj.id = linecontents[12];
                  if (
                    linecontents[0].indexOf("●") === -1 &&
                    linecontents[0].indexOf("■") === -1
                  ) {
                    inObj.kubun = "千代田区外";
                    if (linecontents[0].indexOf("◆") === -1) {
                      inObj.kubun2 = "中小企業・公共団体";
                    } else {
                      inObj.kubun2 = "大企業・任意団体・個人・その他";
                    }
                  } else {
                    if (linecontents[0].indexOf("■") !== -1) {
                      inObj.kubun = "入居者";
                      inObj.kubun2 = "";
                    } else {
                      inObj.kubun = "千代田区内";
                      if (linecontents[0].indexOf("◆") === -1) {
                        inObj.kubun2 = "中小企業・公共団体・個人";
                      } else {
                        inObj.kubun2 = "大企業・任意団体";
                      }
                    }
                  }
                  inObj.name = linecontents[0];
                  inObj.kana = linecontents[1];
                  inObj.sex = linecontents[3];
                  inObj.no_yubin = linecontents[4];
                  inObj.address = linecontents[5];
                  inObj.no_tel = linecontents[6];
                  inObj.mail1 = linecontents[8];
                  inObj.mail2 = linecontents[9];
                  inObj.kubun_riyousha = linecontents[10];
                  inObj.kubun_vip = linecontents[11];
                  inObj.bikou = linecontents[14];
                  inObj.ymd_add = target_ymd_add;
                  inObj.ymd_upd = target_ymd_upd;

                  // すでに利用者が存在している場合
                  if (retObjRiyousha) {
                    if (!retObjRiyousha.ymd_upd) {
                      retObjRiyousha.ymd_upd = '';
                    }
                    // 更新されているかを判別する
                    if (target_ymd_add !== retObjRiyousha.ymd_add || target_ymd_upd !== retObjRiyousha.ymd_upd) {
                      const retObjRiyoushaupdate = await m_riyousha.update(inObj);
                      if (retObjRiyoushaupdate.changedRows === 0) {
                        logger.info(`更新対象が存在しません：${inObj.id}`);
                      } else {
                        detaillog =
                          inObj.id +
                          "," +
                          inObj.kubun +
                          "," +
                          inObj.kubun2 +
                          "," +
                          inObj.name +
                          "," +
                          inObj.kana +
                          "," +
                          inObj.sex +
                          "," +
                          inObj.no_yubin +
                          "," +
                          inObj.address +
                          "," +
                          inObj.no_tel +
                          "," +
                          inObj.mail1 +
                          "," +
                          inObj.mail2 +
                          "," +
                          inObj.kubun_riyousha +
                          "," +
                          inObj.kubun_vip +
                          "," +
                          inObj.bikou +
                          "," +
                          inObj.ymd_add +
                          "," +
                          inObj.ymd_upd +
                          "\n";
                        logger.info(`会議室利用者情報更新ログ：${detaillog}`);
                      }
                    } else {
                      logger.info(`会議室利用者情報更新ログ：更新なし`);
                    }

                    // 利用者に存在しない場合
                  } else {
                    const retObjRiyoushainsert = await m_riyousha.insert(inObj);
                    detaillog =
                      inObj.id +
                      "," +
                      inObj.kubun +
                      "," +
                      inObj.kubun2 +
                      "," +
                      inObj.name +
                      "," +
                      inObj.kana +
                      "," +
                      inObj.sex +
                      "," +
                      inObj.no_yubin +
                      "," +
                      inObj.address +
                      "," +
                      inObj.no_tel +
                      "," +
                      inObj.mail1 +
                      "," +
                      inObj.mail2 +
                      "," +
                      inObj.kubun_riyousha +
                      "," +
                      inObj.kubun_vip +
                      "," +
                      inObj.bikou +
                      "," +
                      inObj.ymd_add +
                      "," +
                      inObj.ymd_upd +
                      "\n";
                    logger.info(`会議室利用者情報登録ログ：${detaillog}`);
                  }
                })();
              }
            });
          });

          src.on("end", () => {
            // 対象ファイルを処理した場合は対象ファイルをリネーム
            fs.rename(
              config.dlpath + "\\" + targetfilename,
              config.dlpath + "\\" + targetfilename + ".old",
              (err) => {
                if (err) {
                  logger.info(
                    `${targetfilename}ファイルは存在しません：${new Date()}`
                  );
                  throw err;
                }
              }
            );
          });
        }
      });
    });

    // 会議室　予約情報ダウンロード
    // 当月－１
    cron.schedule(config.cron.dlyoyaku_minus1, () => {
      // cron.schedule('0 23 * * 1-5', () => {
      dlinfo(-1);
    });
    // 当月
    cron.schedule(config.cron.dlyoyaku_0, () => {
      // cron.schedule('0 23 * * 1-5', () => {
      dlinfo(0);
    });
    // 当月＋１
    cron.schedule(config.cron.dlyoyaku_1, () => {
      dlinfo(1);
    });
    // 当月＋２
    cron.schedule(config.cron.dlyoyaku_2, () => {
      dlinfo(2);
    });
    // 当月＋３
    cron.schedule(config.cron.dlyoyaku_3, () => {
      dlinfo(3);
    });
    // 当月＋４
    cron.schedule(config.cron.dlyoyaku_4, () => {
      dlinfo(4);
    });

    // 会議室　予約情報初期化
    cron.schedule(config.cron.clearyoyaku_minus1, () => {
      // cron.schedule('5 23 * * 1-5', () => {
      clearYoyakuInfo(-1);
    });
    cron.schedule(config.cron.clearyoyaku_0, () => {
      // cron.schedule('5 23 * * 1-5', () => {
      clearYoyakuInfo(0);
    });
    cron.schedule(config.cron.clearyoyaku_1, () => {
      clearYoyakuInfo(1);
    });
    cron.schedule(config.cron.clearyoyaku_2, () => {
      clearYoyakuInfo(2);
    });
    cron.schedule(config.cron.clearyoyaku_3, () => {
      clearYoyakuInfo(3);
    });
    cron.schedule(config.cron.clearyoyaku_4, () => {
      clearYoyakuInfo(4);
    });

    // 会議室　予約情報取込
    cron.schedule(config.cron.setyoyaku_minus1, () => {
      // cron.schedule('5 23 * * 1-5', () => {
      setYoyakuInfo(-1);
    });
    cron.schedule(config.cron.setyoyaku_0, () => {
      // cron.schedule('5 23 * * 1-5', () => {
      setYoyakuInfo(0);
    });
    cron.schedule(config.cron.setyoyaku_1, () => {
      setYoyakuInfo(1);
    });
    cron.schedule(config.cron.setyoyaku_2, () => {
      setYoyakuInfo(2);
    });
    cron.schedule(config.cron.setyoyaku_3, () => {
      setYoyakuInfo(3);
    });
    cron.schedule(config.cron.setyoyaku_4, () => {
      setYoyakuInfo(4);
    });

    // 会議室稼働率情報設定
    cron.schedule(config.cron.calcperyoyaku_minus1, () => {
      setPerInfo(-1);
    });
    cron.schedule(config.cron.calcperyoyaku_0, () => {
      setPerInfo(0);
    });
    cron.schedule(config.cron.calcperyoyaku_1, () => {
      setPerInfo(1);
    });
    cron.schedule(config.cron.calcperyoyaku_2, () => {
      setPerInfo(2);
    });
    cron.schedule(config.cron.calcperyoyaku_3, () => {
      setPerInfo(3);
    });
    cron.schedule(config.cron.calcperyoyaku_4, () => {
      setPerInfo(4);
    });

  };
};


//　◆予約情報ダウンロード
const dlinfo = async (num) => {

  logger.info(`予約情報ダウンロード開始：${num}`);

  const addnum = num;
  // (async () => {
    const browser = await puppeteer.launch({ headless: true });

    let page = await browser.newPage();

    await page.goto(config.url.kanri, { waitUntil: "domcontentloaded" });

    // ログイン
    await page.type('input[name="in_office"]', config.login_id);
    await page.type('input[name="in_opassword"]', config.login_passwd);
    await page.click(
      "body > table > tbody > tr > td > table > tbody > tr:nth-child(1) > td > form > table:nth-child(2) > tbody > tr > td:nth-child(2) > input"
    );

    await page.waitForTimeout(1000);
    // await page.waitForNavigation({waitUntil: 'domcontentloaded'});

    // 管理画面から「管理者メニュー」をクリック
    const menu = await page.$(
      "body > table > tbody > tr > td > table > tbody > tr > td > table:nth-child(2) > tbody > tr:nth-child(3) > td:nth-child(2) > input[type=image]:nth-child(6)"
    );
    await menu.click();

    await page.waitForTimeout(2000);

    // 新しく開いたページを取得
    let newPage = await getNewPage(page);

    // パスワードの設定
    await newPage.type(
      'input[name="in_managerpassword"]',
      config.login_passwd
    );
    const inputElement = await newPage.$("input[type=submit]");
    await inputElement.click();

    await newPage.waitForTimeout(2000);

    // 「ダウンロード」のクリック
    await newPage.click(
      "body > div:nth-child(3) > table > tbody > tr > th:nth-child(6) > img"
    );

    await newPage.waitForTimeout(2000);

    // 「予約情報ダウンロード」のクリック
    await newPage.click(
      "#inbody > div > div:nth-child(2) > div:nth-child(2) > div.waku_5 > img"
    );

    await newPage.waitForTimeout(2000);

    // 新しく開いたページを取得
    let newPageTouroku = await getNewPage(newPage);

    // Promptが出たら必ずOKとする
    newPageTouroku.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    const inYYYYMM = getCurrentYYYYMM(addnum);
    const inYYYY_MM = inYYYYMM.slice(0, 4) + "-" + inYYYYMM.slice(4, 6);
    const in_DD_matubi = new Date(
      inYYYYMM.slice(0, 4),
      inYYYYMM.slice(-2),
      0
    ).getDate();

    await logger.info(`対象年月日：${inYYYY_MM}`);
    await logger.info(`末日：${in_DD_matubi}`);

    await newPageTouroku.select('select[name="in_month"]', inYYYY_MM);
    await newPageTouroku.select('select[name="in_sday"]', "1");
    await newPageTouroku.select(
      'select[name="in_eday"]',
      "" + Number(in_DD_matubi)
    );

    // 「項目名-全選択」をクリックする
    await newPageTouroku.click(
      "#inbody > table > tbody > tr:nth-child(3) > td.reserve_screen > a:nth-child(2)"
    );
    await newPageTouroku.click(
      "#inbody > table > tbody > tr:nth-child(4) > td.reserve_screen > a:nth-child(2)"
    );

    // 「予約データ」をクリックする
    await newPageTouroku.click(
      "#inbody > p:nth-child(4) > input:nth-child(1)"
    );

    await newPage.waitForTimeout(2000);

    // 新しく開いたページを取得
    let newPageResult = await getNewPage(newPageTouroku);

    let a_tag = await newPageResult.$("a");
    const input_tag = await newPageResult.$("body > div > table > tbody > tr:nth-child(5) > th > input.redbtn_180-30");

    for (let i = 0; i<10; i++) {
      if (a_tag) {
        // ダウンロード先の設定
        await page._client.send("Page.setDownloadBehavior", {
          behavior: "allow",
          downloadPath: "C:\\download\\customer",
          // downloadPath: config.dlpath,
        });
        await a_tag.click();
        await logger.info(`予約情報をダウンロードしました：${inYYYY_MM}：${new Date()}`);
        await page.waitForTimeout(10000);
        break;
      } else {
        if (input_tag) {
          await newPageResult.click(
            "body > div > table > tbody > tr:nth-child(5) > th > input.redbtn_180-30"
          );
          await page.waitForTimeout(10000);
          // ダウンロードリンクが表示されているかもしれないので取り直す
          a_tag = await newPageResult.$("a");
        } else {
          await logger.info(`予約情報がありませんでした：${inYYYY_MM}：${new Date()}`);
          break;
        }
      }
    }

    await browser.close();

    /**
     * 新しく開いたページを取得
     * @param {page} page もともと開いていたページ
     * @returns {page} 別タブで開いたページ
     */
    async function getNewPage(page) {
      const pageTarget = await page.target();
      const newTarget = await browser.waitForTarget(
        (target) => target.opener() === pageTarget
      );
      const newPage = await newTarget.page();
      await newPage.waitForSelector("body");
      return newPage;
    }
  // })();

  logger.info(`予約情報ダウンロード終了：${num}`);
};

// ◆予約情報初期化
const clearYoyakuInfo = async (num) => {
  logger.info(`予約情報初期化開始：${num}`);
  // (async () => {
    // 当月のデータを削除
    const retObjYoyakudelete = await m_yoyaku.deleteByMonth(getCurrentYYYYMM(num));
    logger.info(`予約情報を初期化しました：${getCurrentYYYYMM(num)}`);
  // })();
  logger.info(`予約情報初期化終了：${num}`);
}

// ◆予約情報取込
const setYoyakuInfo = async (num) => {

  logger.info(`予約情報取込開始：${num}`);

  // ダウンロードディレクトリにあるcsvファイルを取得する
  let targetfilename = "";
  fs.readdirSync(config.dlpath).forEach((filename) => {

    // *mdl.csvのファイルの場合処理をする
    if (filename.slice(-7) === "rdl.csv") {

      targetfilename = filename;
      let max_id_yoyaku = 1;

      // csvファイルはShift-JISのため
      const src = fs
        .createReadStream(config.dlpath + "\\" + filename)
        .pipe(iconv.decodeStream("Shift_JIS"));

      // 1行ごとに読み込む
      const rl = readline.createInterface({
        input: src,
        output: process.stdout,
        terminal: false,
      });

      // 1行ごとの処理
      rl.on("line", (chunk) => {
        const linecontents = chunk.split(",");

        // ヘッダーは飛ばす
        if (linecontents[0] !== "登録日" && linecontents[0] !== "") {
          let inObj = {};
          inObj.id =
            "Y" +
            linecontents[1].replace(/\-/g, "").slice(0, 6) +
            ("" + "0000000000000" + max_id_yoyaku).slice(-14);
          // inObj.id = max_id_yoyaku;
          max_id_yoyaku += 1;
          inObj.ymd_add = linecontents[0].replace(/\-/g, "");
          inObj.ymd_riyou = linecontents[1].replace(/\-/g, "");
          if (linecontents[2] !== "") {
            inObj.ymd_upd = linecontents[2].replace(/\-/g, "");
          } else {
            inObj.ymd_upd = linecontents[2];
          }
          inObj.nm_kubun_room = linecontents[3];
          inObj.nm_room = linecontents[4];
          inObj.time_yoyaku = linecontents[5];
          inObj.time_start = linecontents[5]
            .slice(0, 5)
            .replace(/:/g, "");
          inObj.time_end = linecontents[5].slice(6, 11).replace(/:/g, "");
          inObj.id_riyousha = linecontents[6];
          inObj.nm_riyousha = linecontents[7];
          inObj.kana_riyousha = linecontents[8];
          inObj.no_yubin = linecontents[9];
          inObj.address = linecontents[10];
          inObj.email = linecontents[11];
          inObj.telno = linecontents[12];
          inObj.mokuteki = linecontents[13];
          inObj.nm_uketuke = linecontents[14];
          inObj.num_person = linecontents[15];
          inObj.price = linecontents[16];
          inObj.stat_shiharai = linecontents[17];
          inObj.bikou = linecontents[18];
          inObj.kubun_day = tool.getDayKubun(inObj.ymd_riyou);
          if (inObj.nm_room.slice(0, 3) === "会議室") {
            inObj.kubun_room = 1;
          } else if (inObj.nm_room.slice(0, 6) === "プロジェクト") {
            inObj.kubun_room = 3;
          } else {
            inObj.kubun_room = 2;
          }
          (async () => {
            const retObjYoyakuinsert = await m_yoyaku.insert(inObj);
            logger.info(`会議室予約情報ID：${inObj.id}`);
          })();
        }
      });
      src.on("end", () => {
        // 対象ファイルを処理した場合は対象ファイルをリネーム
        fs.rename(
          config.dlpath + "\\" + targetfilename,
          config.dlpath + "\\" + targetfilename + ".old",
          (err) => {
            if (err) {
              logger.info(
                `${targetfilename}ファイルは存在しません：${new Date()}`
              );
              throw err;
            }
          }
        );
      });
    }
  });
  logger.info(`予約情報取込終了：${num}`);
};

// ◆会議室稼働率情報設定
const setPerInfo = async (addnum) => {
  // (async () => {

    const yyyymm = getCurrentYYYYMM(addnum);

    // 現在の月の稼働時間を求める
    // ◆平日
    const weekdayTimeAll = tool.getHourbyYYYYMM(yyyymm, 1, 1);
    const weekdayTime45 = tool.getHourbyYYYYMM(yyyymm, 1, 2);
    const weekdayTimeMtg = tool.getHourbyYYYYMM(yyyymm, 1, 3);
    const weekdayTimePrj = tool.getHourbyYYYYMM(yyyymm, 1, 4);
    // ◆土日祝日
    const holidayTimeAll = tool.getHourbyYYYYMM(yyyymm, 2, 1);
    const holidayTime45 = tool.getHourbyYYYYMM(yyyymm, 2, 2);
    const holidayTimeMtg = tool.getHourbyYYYYMM(yyyymm, 2, 3);
    const holidayTimePrj = tool.getHourbyYYYYMM(yyyymm, 2, 4);

    let inObj = {};
    inObj.yyyymm = yyyymm;
    const retObjYoyakucalc = await m_yoyaku.calcTime(inObj);
    let weekdayWorktimeAll = 0;
    let weekdayWorktime45 = 0;
    let weekdayWorktimeMtg = 0;
    let weekdayWorktimePrj = 0;
    let holidayWorktimeAll = 0;
    let holidayWorktime45 = 0;
    let holidayWorktimeMtg = 0;
    let holidayWorktimePrj = 0;

    retObjYoyakucalc.forEach((row) => {
      if (row.kubun_room === "1" && row.kubun_day === "1") {
        weekdayWorktime45 = row.totaltime;
      } else if (row.kubun_room === "1" && row.kubun_day === "2") {
        holidayWorktime45 = row.totaltime;
      } else if (row.kubun_room === "2" && row.kubun_day === "1") {
        weekdayWorktimeMtg = row.totaltime;
      } else if (row.kubun_room === "2" && row.kubun_day === "2") {
        holidayWorktimeMtg = row.totaltime;
      } else if (row.kubun_room === "3" && row.kubun_day === "1") {
        weekdayWorktimePrj = row.totaltime;
      } else if (row.kubun_room === "3" && row.kubun_day === "2") {
        holidayWorktimePrj = row.totaltime;
      }
    });

    weekdayWorktimeAll =
      weekdayWorktime45 + weekdayWorktimeMtg + weekdayWorktimePrj;
    holidayWorktimeAll =
      holidayWorktime45 + holidayWorktimeMtg + holidayWorktimePrj;

    inObj.per_all_all =
      Math.round(
        ((weekdayWorktimeAll + holidayWorktimeAll) /
          (weekdayTimeAll + holidayTimeAll)) *
        100 *
        100
      ) / 100;
    inObj.per_all_weekday =
      Math.round((weekdayWorktimeAll / weekdayTimeAll) * 100 * 100) / 100;
    inObj.per_all_holiday =
      Math.round((holidayWorktimeAll / holidayTimeAll) * 100 * 100) / 100;

    inObj.per_45_all =
      Math.round(
        ((weekdayWorktime45 + holidayWorktime45) /
          (weekdayTime45 + holidayTime45)) *
        100 *
        100
      ) / 100;
    inObj.per_45_weekday =
      Math.round((weekdayWorktime45 / weekdayTime45) * 100 * 100) / 100;
    inObj.per_45_holiday =
      Math.round((holidayWorktime45 / holidayTime45) * 100 * 100) / 100;

    inObj.per_mtg_all =
      Math.round(
        ((weekdayWorktimeMtg + holidayWorktimeMtg) /
          (weekdayTimeMtg + holidayTimeMtg)) *
        100 *
        100
      ) / 100;
    inObj.per_mtg_weekday =
      Math.round((weekdayWorktimeMtg / weekdayTimeMtg) * 100 * 100) / 100;
    inObj.per_mtg_holiday =
      Math.round((holidayWorktimeMtg / holidayTimeMtg) * 100 * 100) / 100;

    inObj.per_prj_all =
      Math.round(
        ((weekdayWorktimePrj + holidayWorktimePrj) /
          (weekdayTimePrj + holidayTimePrj)) *
        100 *
        100
      ) / 100;
    inObj.per_prj_weekday =
      Math.round((weekdayWorktimePrj / weekdayTimePrj) * 100 * 100) / 100;
    inObj.per_prj_holiday =
      Math.round((holidayWorktimePrj / holidayTimePrj) * 100 * 100) / 100;

    inObj.ymd_add = tool.getToday();

    const retObjPerinforemove = await m_perinfo.remove(inObj);
    const retObjPerinfoinsert = await m_perinfo.insert(inObj);
    logger.info(
      `${inObj.yyyymm}のレコードを登録しました：${new Date()}`
    );
  // })();
};

const getCurrentYYYYMM = (numM) => {
  const dt = new Date();
  const curYYYY = dt.getFullYear();
  const curMM = dt.getMonth() + 1;

  // 現在の日付の年月をもとに、月数を求める
  const fullMonth = (curYYYY * 12) + curMM;

  // 引数で設定された値を加算する
  const targetMonth = fullMonth + numM;

  // 年月を求める
  const retYYYY = (targetMonth % 12 === 0 ? Math.floor(targetMonth / 12) - 1 : Math.floor(targetMonth / 12));
  const retMM = (targetMonth % 12 === 0 ? 12 : targetMonth % 12);

  return "" + retYYYY + ("" + "0" + retMM).slice(-2);
};

module.exports = {
  startcron,
  dlinfo,
  clearYoyakuInfo,
  setYoyakuInfo,
  setPerInfo,
  alertTrelloMail,
  alertOutairirekiMail,
  alertOutairirekiKaigiMail,
  alertYoyakuKanshiMail,
  alertMishuKaigiMail,
};
