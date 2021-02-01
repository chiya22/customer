const log4js = require("log4js");
const logger = log4js.configure('./config/log4js-config.json').getLogger();

const cron = require('node-cron');
const m_outai = require('../model/outais');
const mail = require('./sendmail');
const iconv = require("iconv-lite");
const puppeteer = require("puppeteer");
const riyousha = require('../model/riyousha');
const fs = require("fs");
const url = 'http://192.168.1.19:3000/outai/';
const urlkaigi = 'http://192.168.1.19:3000/outaikaigi/';
// const url = 'http://192.168.1.51:3002/outai/';
// const urlkaigi = 'http://192.168.1.51:3002/outaikaigi/'


// cron設定
const startcron = () => {

    // 月曜日から金曜日の朝9:00に通知メールを送信する
    cron.schedule('0 9 * * 1-5', () => {
        query = 'select * from(SELECT o.*,ua.name AS name_add, uu.name AS name_upd, ifnull(c.name, "会社指定なし") as name_company FROM outais o left outer JOIN companies c ON o.id_company = c.id LEFT OUTER JOIN users ua ON ua.id = o.id_add LEFT OUTER JOIN users uu ON uu.id = o.id_upd) ocu WHERE ocu.status != "完了" ORDER BY ocu.ymdhms_upd desc'
        m_outai.selectSQL(query, (err, retObj) => {
            if (err) { next(err) };
            let outais = retObj;
            let content = `未完了の応対履歴一覧となります。\r\n内容を確認し、対応を行ってください。\r\n\r\n-----------------------------------------------------\r\n`;

            outais.forEach(outai => {
                content += `会社：${outai.name_company}\r\nステータス：${outai.status}\r\n登録日時：${outai.ymdhms_add}\r\n登録者：${outai.name_add}\r\n更新日時：${outai.ymdhms_upd}\r\n更新者：${outai.name_upd}\r\n＜内容＞\r\n${outai.content}\r\n${url}${outai.id}\r\n------------------------------------------------------\r\n`
            });

            //メール送信
            mail.send("応対履歴一覧", content)

            logger.info(`cronより通知メールを送信しました：${new Date()}`);
        });
    });

    cron.schedule('0 9 * * 1-5', () => {
        query = 'select * from(SELECT o.*,ua.name AS name_add, uu.name AS name_upd, ifnull(r.name, "利用者指定なし") as name_riyousha FROM outaiskaigi o left outer JOIN riyoushas r ON o.id_riyousha = r.id LEFT OUTER JOIN users ua ON ua.id = o.id_add LEFT OUTER JOIN users uu ON uu.id = o.id_upd) oru WHERE oru.status != "完了" ORDER BY oru.ymdhms_upd desc'
        m_outai.selectSQL(query, (err, retObj) => {
            if (err) { next(err) };
            let outais = retObj;
            let content = `未完了の応対履歴（会議室）一覧となります。\r\n内容を確認し、対応を行ってください。\r\n\r\n-----------------------------------------------------\r\n`;

            outais.forEach(outai => {
                content += `利用者：${outai.name_riyousha}\r\nステータス：${outai.status}\r\n登録日時：${outai.ymdhms_add}\r\n登録者：${outai.name_add}\r\n更新日時：${outai.ymdhms_upd}\r\n更新者：${outai.name_upd}\r\n＜内容＞\r\n${outai.content}\r\n${urlkaigi}${outai.id}\r\n------------------------------------------------------\r\n`
            });

            //メール送信
            mail.send("応対履歴一覧（会議室）", content)

            logger.info(`cronより通知メールを送信しました（会議室）：${new Date()}`);
        });
    });

    // 毎分実行
    cron.schedule('15 09 * * 1-5', () => {

        (async () => {

            const browser = await puppeteer.launch({ headless: true });

            let page = await browser.newPage();

            const URL = "https://www.yamori-yoyaku.jp/studio/OfficeLogin.htm";
            await page.goto(URL, { waitUntil: "domcontentloaded" });

            // ログイン
            await page.type('input[name="in_office"]', "");
            await page.type('input[name="in_opassword"]', "");
            await page.click(
                "body > table > tbody > tr > td > table > tbody > tr:nth-child(1) > td > form > table:nth-child(2) > tbody > tr > td:nth-child(2) > input"
            );

            await page.waitFor(1000);
            // await page.waitForNavigation({waitUntil: 'domcontentloaded'});

            // 管理画面から「管理者メニュー」をクリック
            const menu = await page.$(
                "body > table > tbody > tr > td > table > tbody > tr > td > table:nth-child(2) > tbody > tr:nth-child(3) > td:nth-child(2) > input[type=image]:nth-child(6)"
            );
            await menu.click();

            await page.waitFor(2000);

            // 新しく開いたページを取得
            let newPage = await getNewPage(page);

            // パスワードの設定
            await newPage.type('input[name="in_managerpassword"]', "");
            const inputElement = await newPage.$("input[type=submit]");
            await inputElement.click();

            await newPage.waitFor(2000);

            // 「ダウンロード」のクリック
            await newPage.click(
                "body > div:nth-child(3) > table > tbody > tr > th:nth-child(6) > img"
            );

            await newPage.waitFor(2000);

            // 「登録車情報ダウンロード」のクリック
            await newPage.click(
                "#inbody > div > div:nth-child(2) > div:nth-child(1) > div.waku_5 > img"
            );

            await newPage.waitFor(2000);

            // 新しく開いたページを取得
            let newPageTouroku = await getNewPage(newPage);

            // Promptが出たら必ずOKとする
            newPageTouroku.on('dialog', async dialog => {
                await dialog.accept();
            });

            // 開始は現在より1ヶ月前とする
            const dt = new Date();
            const current_y = dt.getFullYear();
            const current_m = dt.getMonth();
            let set_y;
            let set_m;
            if (current_m === 0) {
                set_y = current_y - 1
                set_m = 12
            } else {
                set_y = current_y
                set_m = current_m + 1
            }
            await newPageTouroku.select('select[name="start_y"]', set_y.toString());
            await newPageTouroku.select('select[name="start_m"]', set_m.toString());
            await newPageTouroku.select('select[name="end_y"]', set_y.toString());
            await newPageTouroku.select('select[name="end_m"]', set_m.toString());
            // await newPageTouroku.select('select[name="end_y"]', '2020');
            // await newPageTouroku.select('select[name="end_m"]', '12');

            // 「項目名-全選択」をクリックする
            await newPageTouroku.click(
                "#inbody > form > table > tbody > tr:nth-child(2) > td.reserve_screen > a:nth-child(2)"
            );
            // 「登録者データ」をクリックする
            await newPageTouroku.click("#inbody > form > p > input.btn_150-30");

            await newPage.waitFor(2000);

            // 新しく開いたページを取得
            let newPageResult = await getNewPage(newPageTouroku);

            const a_tag = await newPageResult.$('a');
            if (a_tag) {
                await logger.info(`会議室マスタ情報をダウンロードしました：${new Date()}`);

                // ダウンロード先の設定
                const dlpath = 'C:\\download';
                await page._client.send(
                  'Page.setDownloadBehavior',
                  { behavior: 'allow', downloadPath: dlpath }
                );
                await a_tag.click();
                await page.waitFor(10000);

            } else {
                await logger.info(`会議室マスタ情報がありませんでした：${new Date()}`);
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
    })

    cron.schedule('30 9 * * 1-5', () => {

        const downloadfilepath = "C:\\download";

        // ダウンロードディレクトリにあるcsvファイルを取得する
        let targetfilename = "";
        fs.readdirSync(downloadfilepath).forEach((filename) => {
            // *mdl.csvのファイルの場合処理をする
            if (filename.slice(-7) === "mdl.csv") {
                targetfilename = filename;
                // csvファイルはShift-JISのため
                const src = fs
                    .createReadStream(downloadfilepath + "\\" + filename)
                    .pipe(iconv.decodeStream("Shift_JIS"));
                src.on("data", (chunk) => {
                    let detaillog = "";
                    const lines = chunk.split("\n");
                    lines.forEach((line) => {
                        let linecontents = line.split(",");
                        if ((linecontents[0] !== '利用者') && (linecontents[0] !== '')) {

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
                            const target_ymd_upd = linecontents[16].slice(0, 4) + linecontents[16].slice(5, 7) + linecontents[16].slice(8, 10)
                            const target_ymd_add = linecontents[15].slice(0, 4) + linecontents[15].slice(5, 7) + linecontents[15].slice(8, 10)

                            let inObj = {};
                            inObj.id = linecontents[12];
                            linecontents[0] = (linecontents[0].replace(/ /g, "　").replace(/[*]/g, "＊"));
                            riyousha.findPKey(inObj, (err, retObj) => {
                                if (err) { throw err };

                                // 新規登録用、更新用のオブジェクトを作成
                                inObj.id = linecontents[12];
                                if ((linecontents[0].indexOf('●') === -1) && (linecontents[0].indexOf('■') === -1)) {
                                    inObj.kubun = "千代田区外";
                                    if (linecontents[0].indexOf("◆") === -1) {
                                        inObj.kubun2 = "中小企業・公共団体";
                                    } else {
                                        inObj.kubun2 = "大企業・任意団体・個人・その他";
                                    }
                                } else {
                                    if (linecontents[0].indexOf("■") !== -1) {
                                        inObj.kubun = "入居者";
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
                                if (retObj) {

                                    // 更新されているかを判別する
                                    if ((target_ymd_add !== retObj.ymd_add) || (target_ymd_upd !== retObj.ymd_upd)) {

                                        riyousha.update(inObj, (err, retObj) => {
                                            if (err) { throw err };
                                            if (retObj.changedRows === 0) {
                                                logger.info(`更新対象が存在しません：${inObj.id}`);
                                            } else {
                                                detaillog = inObj.id + ',' + inObj.kubun + ',' + inObj.kubun2 + ',' + inObj.name + ',' + inObj.kana + ',' + inObj.sex + ',' + inObj.no_yubin + ',' + inObj.address + ',' + inObj.no_tel + ',' + inObj.mail1 + ',' + inObj.mail2 + ',' + inObj.kubun_riyousha + ',' + inObj.kubun_vip + ',' + inObj.bikou + ',' + inObj.ymd_add + ',' + inObj.ymd_upd + '\n';
                                                logger.info(`会議室利用者情報更新ログ：${detaillog}`);
                                            }
                                        })
                                    }

                                    // 利用者に存在しない場合
                                } else {

                                    riyousha.insert(inObj, (err, retObj) => {
                                        if (err) { throw err };
                                        detaillog = inObj.id + ',' + inObj.kubun + ',' + inObj.kubun2 + ',' + inObj.name + ',' + inObj.kana + ',' + inObj.sex + ',' + inObj.no_yubin + ',' + inObj.address + ',' + inObj.no_tel + ',' + inObj.mail1 + ',' + inObj.mail2 + ',' + inObj.kubun_riyousha + ',' + inObj.kubun_vip + ',' + inObj.bikou + ',' + inObj.ymd_add + ',' + inObj.ymd_upd + '\n';
                                        logger.info(`会議室利用者情報登録ログ：${detaillog}`);
                                    })
                                }
                            });
                        }
                    });
                });

                src.on("end", () => {
                    // 対象ファイルを処理した場合は対象ファイルをリネーム
                    fs.rename(
                        downloadfilepath + "\\" + targetfilename,
                        downloadfilepath + "\\" + targetfilename + ".old",
                        (err) => {
                            if (err) {
                                logger.info(`${targetfilename}ファイルは存在しません：${new Date()}`);
                                throw err;
                            }
                        }
                    );
                });
            }
        });
    });
}

module.exports = {
    startcron,
}
