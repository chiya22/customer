const log4js = require("log4js");
const logger = log4js.configure('./config/log4js-config.json').getLogger();

const cron = require('node-cron');
const m_outai = require('../model/outais');
const m_yoyaku = require('../model/yoyakus');
const readline = require("readline");
const mail = require('./sendmail');
const iconv = require("iconv-lite");
const puppeteer = require("puppeteer");
const riyousha = require('../model/riyousha');
const fs = require("fs");
const url = 'http://192.168.1.19:3000/outai/';
const urlkaigi = 'http://192.168.1.19:3000/outaikaigi/';
// const url = 'http://192.168.1.51:3002/outai/';
// const urlkaigi = 'http://192.168.1.51:3002/outaikaigi/'

const url_yoyaku = 'https://www.yamori-yoyaku.jp/studio/OfficeLogin.htm';
const dlpath = 'C:\\download';
const login_id = '';
const login_passwd = '';

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

    // 会議室　利用者登録情報ダウンロード
    cron.schedule('15 09 * * 1-5', () => {

        (async () => {

            const browser = await puppeteer.launch({ headless: true });

            let page = await browser.newPage();

            const URL = url_yoyaku;
            await page.goto(URL, { waitUntil: "domcontentloaded" });

            // ログイン
            await page.type('input[name="in_office"]', login_id);
            await page.type('input[name="in_opassword"]', login_passwd);
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
            await newPage.type('input[name="in_managerpassword"]', login_passwd);
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
            newPageTouroku.on('dialog', async dialog => {
                await dialog.accept();
            });

            const beforeOneMontYYYYMM = getCurrentYYYYMM(-1);
            const startYYYY = beforeOneMontYYYYMM.slice(0, 6);
            const startMM = beforeOneMontYYYYMM.slice(-2);
            const currentYYYYMM = getCurrentYYYYMM(0);
            const currentYYYY = currentYYYYMM.slice(0, 6);
            const currentMM = currentYYYYMM.slice(-2);

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

            const a_tag = await newPageResult.$('a');
            if (a_tag) {
                await logger.info(`会議室マスタ情報をダウンロードしました：${new Date()}`);

                // ダウンロード先の設定
                await page._client.send(
                    'Page.setDownloadBehavior',
                    { behavior: 'allow', downloadPath: dlpath }
                );
                await a_tag.click();
                await page.waitForTimeout(10000);

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

    // 会議室　利用者情報取込
    cron.schedule('30 9 * * 1-5', () => {

        // ダウンロードディレクトリにあるcsvファイルを取得する
        let targetfilename = "";
        fs.readdirSync(dlpath).forEach((filename) => {
            // *mdl.csvのファイルの場合処理をする
            if (filename.slice(-7) === "mdl.csv") {
                targetfilename = filename;
                // csvファイルはShift-JISのため
                const src = fs
                    .createReadStream(dlpath + "\\" + filename)
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
                        dlpath + "\\" + targetfilename,
                        dlpath + "\\" + targetfilename + ".old",
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

    // 会議室　予約情報ダウンロード
    // 当月
    cron.schedule('0 23 * * 1-5', () => {
        dlinfo(0);
    })
    // 当月＋１
    cron.schedule('10 23 * * 1-5', () => {
        dlinfo(1);
    })
    // 当月＋２
    cron.schedule('20 23 * * 1-5', () => {
        dlinfo(2);
    })
    // 当月＋３
    cron.schedule('30 23 * * 1-5', () => {
        dlinfo(3);
    })
    // 当月＋４
    cron.schedule('40 23 * * 1-5', () => {
        dlinfo(4);
    })

    // 会議室　予約情報取込
    cron.schedule('5 23 * * 1-5', () => {
        setYoyakuInfo(0);
    });
    cron.schedule('15 23 * * 1-5', () => {
        setYoyakuInfo(1);
    });
    cron.schedule('25 23 * * 1-5', () => {
        setYoyakuInfo(2);
    });
    cron.schedule('35 23 * * 1-5', () => {
        setYoyakuInfo(3);
    });
    cron.schedule('45 23 * * 1-5', () => {
        setYoyakuInfo(4);
    });

    const dlinfo = (num) => {

        const addnum = num;

        (async () => {

            const browser = await puppeteer.launch({ headless: false });
    
            let page = await browser.newPage();
    
            const URL = url_yoyaku;
            await page.goto(URL, { waitUntil: "domcontentloaded" });
    
            // ログイン
            await page.type('input[name="in_office"]', login_id);
            await page.type('input[name="in_opassword"]', login_passwd);
            await page.click(
                "body > table > tbody > tr > td > table > tbody > tr:nth-child(1) > td > form > table:nth-child(2) > tbody > tr > td:nth-child(2) > input"
            );
    
            await page.waitForTimeout(1000);
            // await page.waitForNavigation({waitUntil: 'domcontentloaded'});
    
            // 「予約検索」をクリック
            const menu = await page.$(
                "body > table > tbody > tr > td > table > tbody > tr > td > table:nth-child(2) > tbody > tr:nth-child(8) > td:nth-child(2) > input[type=image]:nth-child(9)"
            );
            await menu.click();
    
            await page.waitForTimeout(2000);
    
            // 新しく開いたページを取得
            // let newPage = await getNewPage(page);
    
            // 新規予約確認タブをクリック
            const shinki = await page.$(
                "body > div > table:nth-child(3) > tbody > tr > th:nth-child(3) > a"
            )
            await shinki.click();
    
            await page.waitForTimeout(2000);
    
            // 現在の年月
            const currentYYYYMM = getCurrentYYYYMM(0);
            // 一年前の年月
            const current_YYYYMM_before = getCurrentYYYYMM(-12);
            // 現在の年月の末日
            const current_D_YYYYMM_matubi = new Date(currentYYYYMM.slice(0, 6), currentYYYYMM.slice(-2), 0).getDate();
    
            // 登録日・更新日を設定
            await page.select('select[name="s_tourokuYm"]', "" + current_YYYYMM_before);
            await page.select('select[name="s_tourokudd"]', '1');
            await page.select('select[name="e_tourokuYm"]', "" + currentYYYYMM);
            await page.select('select[name="e_tourokudd"]', "" + current_D_YYYYMM_matubi);
    
            // 利用日の年月
            const riyouYYYYMM = getCurrentYYYYMM(addnum);
            const riyou_D_YYYYMM_matubi =  new Date(riyouYYYYMM.slice(0, 6), riyouYYYYMM.slice(-2), 0).getDate();
    
            // 利用日を設定
            await page.select('select[name="s_riyouYm"]', "" + riyouYYYYMM);
            await page.select('select[name="s_riyoudd"]', '1');
            await page.select('select[name="e_riyouYm"]', "" + riyouYYYYMM);
            await page.select('select[name="e_riyoudd"]', "" + riyou_D_YYYYMM_matubi);
    
            //　検索のクリック
            await page.click(
                "body > div > form > table:nth-child(1) > tbody > tr > td:nth-child(4) > input"
            );
    
            await page.waitForTimeout(2000);
    
            // Promptが出たら必ずOKとする
            page.on('dialog', async dialog => {
                await dialog.accept();
            });
    
            // ダウンロード先の設定
            await page._client.send(
                'Page.setDownloadBehavior',
                { behavior: 'allow', downloadPath: dlpath }
            );
    
            await logger.info(`会議室予約情報をダウンロードしました：${new Date()}`);
    
            // 「全リストCSVダウンロード」をクリック
            await page.click(
                "body > div > form > table:nth-child(2) > tbody > tr > td:nth-child(2) > a"
            );
    
            await page.waitForTimeout(2000);
    
            await logger.info(`会議室予約情報をダウンロードしました：${new Date()}`);
    
            await browser.close();
    
        })();        
    }

    const setYoyakuInfo = (num) => {
        // ダウンロードディレクトリにあるcsvファイルを取得する
        let targetfilename = "";
        fs.readdirSync(dlpath).forEach((filename) => {
            // *mdl.csvのファイルの場合処理をする
            if ((filename.slice(0, 10) === "kakuninsho") && (filename.slice(-3) === 'csv')) {

                targetfilename = filename;

                let max_id_yoyaku = 1;

                // 当月のデータを削除
                m_yoyaku.deleteByMonth(getCurrentYYYYMM(num), (err, retObj) => {
                    if (err) { throw err };

                    // csvファイルはShift-JISのため
                    const src = fs
                        .createReadStream(dlpath + "\\" + filename)
                        .pipe(iconv.decodeStream("Shift_JIS"));

                    // 1行ごとに読み込む
                    const rl = readline.createInterface({
                        input: src,
                        output: process.stdout,
                        terminal: false,
                    });

                    // 1行ごとの処理
                    rl.on("line", (chunk) => {

                        logger.info(`${chunk}：${new Date()}`);
                        const linecontents = chunk.split(",");

                        // ヘッダーは飛ばす
                        if ((linecontents[0] !== '管理ID') && (linecontents[0] !== '')) {
                            let inObj = {};
                            inObj.id = 'Y' + linecontents[2].replace(/\//g, '').slice(0, 6) + ('' + '0000000000000' + max_id_yoyaku).slice(-14);
                            // inObj.id = max_id_yoyaku;
                            max_id_yoyaku += 1;
                            inObj.nm_room = linecontents[1];
                            inObj.ymd_yoyaku = linecontents[2].replace(/\//g, '');
                            inObj.time_start = linecontents[3];
                            inObj.time_end = linecontents[4];
                            inObj.price = linecontents[5];
                            if (linecontents[6] !== '') {
                                inObj.ymd_uketuke = linecontents[6].replace(/\//g, '');
                            } else {
                                inObj.ymd_uketuke = linecontents[6];
                            }
                            inObj.status_pay = linecontents[7];
                            inObj.nm_input = linecontents[8];
                            inObj.nm_riyousha = linecontents[9];
                            inObj.seishikinm_room = linecontents[10];
                            inObj.type_room = linecontents[11];
                            inObj.id_keiyaku = linecontents[12];
                            inObj.nm_keiyaku = linecontents[13];
                            inObj.nm_tantou = linecontents[14];
                            inObj.telno = linecontents[15];
                            inObj.faxno = linecontents[16];
                            inObj.email = linecontents[17];
                            inObj.kubun = linecontents[18];
                            inObj.address = linecontents[19];
                            inObj.quantity = linecontents[20];
                            inObj.unit = linecontents[21];
                            inObj.notes = linecontents[22];
                            inObj.bikou = linecontents[23];
                            m_yoyaku.insert(inObj, (err, retObj) => {
                                if (err) { throw err };
                                logger.info(`会議室予約情報ID：${inObj.id}`);
                            })
                        }
                    })
                    src.on("end", () => {
                        // 対象ファイルを処理した場合は対象ファイルをリネーム
                        fs.rename(
                            dlpath + "\\" + targetfilename,
                            dlpath + "\\" + targetfilename + ".old",
                            (err) => {
                                if (err) {
                                    logger.info(`${targetfilename}ファイルは存在しません：${new Date()}`);
                                    throw err;
                                }
                            }
                        );
                    })
                });
            }
        });
    }
    const getCurrentYYYYMM = (numM) => {

        const dt = new Date();
        const curYYYY = dt.getFullYear();
        const curMM = dt.getMonth();

        // 現在の日付の年月をもとに、月数を求める
        const fullMonth = (curYYYY * 12) + (curMM + 1)

        // 引数で設定された値を加算する
        const targetMonth = fullMonth + numM;

        // 年月を求める
        const retYYYY = Math.floor(targetMonth / 12);
        const retMM = targetMonth % 12;

        return "" + retYYYY + ("" + "0" + retMM).slice(-2);
    }
}

module.exports = {
    startcron,
}
