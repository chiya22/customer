
const config = require("../config/app.config");
const log4js = require("log4js");
const logger = log4js.configure('./config/log4js-config.json').getLogger();

const cron = require('node-cron');

const m_outai = require('../model/outais');
const m_yoyaku = require('../model/yoyakus');
const m_riyousha = require('../model/riyousha');

const readline = require("readline");
const mail = require('./sendmail');
const iconv = require("iconv-lite");
const puppeteer = require("puppeteer");
const tool = require('./tool');
const fs = require("fs");

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
                content += `会社：${outai.name_company}\r\nステータス：${outai.status}\r\n登録日時：${outai.ymdhms_add}\r\n登録者：${outai.name_add}\r\n更新日時：${outai.ymdhms_upd}\r\n更新者：${outai.name_upd}\r\n＜内容＞\r\n${outai.content}\r\n${config.url.outai}${outai.id}\r\n------------------------------------------------------\r\n`
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
                content += `利用者：${outai.name_riyousha}\r\nステータス：${outai.status}\r\n登録日時：${outai.ymdhms_add}\r\n登録者：${outai.name_add}\r\n更新日時：${outai.ymdhms_upd}\r\n更新者：${outai.name_upd}\r\n＜内容＞\r\n${outai.content}\r\n${config.url.outaikaigi}${outai.id}\r\n------------------------------------------------------\r\n`
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
            await newPage.type('input[name="in_managerpassword"]', config.login_passwd);
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
            const startYYYY = beforeOneMontYYYYMM.slice(0, 4);
            const startMM = beforeOneMontYYYYMM.slice(-2);
            const currentYYYYMM = getCurrentYYYYMM(0);
            const currentYYYY = currentYYYYMM.slice(0, 4);
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
                    { behavior: 'allow', downloadPath: config.dlpath }
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
                            m_riyousha.findPKey(inObj, (err, retObj) => {
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

                                        m_riyousha.update(inObj, (err, retObj) => {
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

                                    m_riyousha.insert(inObj, (err, retObj) => {
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
                        config.dlpath + "\\" + targetfilename,
                        config.dlpath + "\\" + targetfilename + ".old",
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
        // cron.schedule('0 23 * * 1-5', () => {
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
        // cron.schedule('5 23 * * 1-5', () => {
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

    // 会議室稼働率情報設定
    cron.schedule('50 23 * * 1-5', () => {
        setPerInfo(0);
    });

    //　予約情報ダウンロード
    const dlinfo = (num) => {

        const addnum = num;

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
            await newPage.type('input[name="in_managerpassword"]', config.login_passwd);
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
            newPageTouroku.on('dialog', async dialog => {
                await dialog.accept();
            });

            const inYYYYMM = getCurrentYYYYMM(addnum);
            const inYYYY_MM = inYYYYMM.slice(0, 4) + '-' + inYYYYMM.slice(4, 6)
            const in_DD_matubi = new Date(inYYYYMM.slice(0, 4), inYYYYMM.slice(-2), 0).getDate();

            await newPageTouroku.select('select[name="in_month"]', inYYYY_MM);
            await newPageTouroku.select('select[name="in_sday"]', "1");
            await newPageTouroku.select('select[name="in_eday"]', "" + Number(in_DD_matubi));

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

            const a_tag = await newPageResult.$('a');
            if (a_tag) {
                await logger.info(`予約情報をダウンロードしました：${new Date()}`);

                // ダウンロード先の設定
                await page._client.send(
                    'Page.setDownloadBehavior',
                    { behavior: 'allow', downloadPath: config.dlpath }
                );
                await a_tag.click();
                await page.waitForTimeout(10000);

            } else {
                await logger.info(`予約情報がありませんでした：${new Date()}`);
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

        })();
    }

    // 予約情報取込
    const setYoyakuInfo = (num) => {
        // ダウンロードディレクトリにあるcsvファイルを取得する
        let targetfilename = "";
        fs.readdirSync(config.dlpath).forEach((filename) => {
            // *mdl.csvのファイルの場合処理をする
            if ((filename.slice(-7) === 'rdl.csv')) {

                targetfilename = filename;

                let max_id_yoyaku = 1;

                // 当月のデータを削除
                m_yoyaku.deleteByMonth(getCurrentYYYYMM(num), (err, retObj) => {
                    if (err) { throw err };

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

                        logger.info(`${chunk}：${new Date()}`);
                        const linecontents = chunk.split(",");

                        // ヘッダーは飛ばす
                        if ((linecontents[0] !== '登録日') && (linecontents[0] !== '')) {
                            let inObj = {};
                            inObj.id = 'Y' + linecontents[1].replace(/\-/g, '').slice(0, 6) + ('' + '0000000000000' + max_id_yoyaku).slice(-14);
                            // inObj.id = max_id_yoyaku;
                            max_id_yoyaku += 1;
                            inObj.ymd_add = linecontents[0].replace(/\-/g, '');
                            inObj.ymd_riyou = linecontents[1].replace(/\-/g, '');
                            if (linecontents[2] !== '') {
                                inObj.ymd_upd = linecontents[2].replace(/\-/g, '');
                            } else {
                                inObj.ymd_upd = linecontents[2];
                            }
                            inObj.nm_kubun_room = linecontents[3];
                            inObj.nm_room = linecontents[4];
                            inObj.time_yoyaku = linecontents[5];
                            inObj.time_start = linecontents[5].slice(0, 5).replace(/:/g, '');
                            inObj.time_end = linecontents[5].slice(6, 11).replace(/:/g, '');
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
                            inObj.bikou = linecontents[17];
                            inObj.kubun_day = tool.getDayKubun(inObj.ymd_riyou);
                            if (inObj.nm_room.slice(0,3) === '会議室') {
                                inObj.kubun_room = 1
                            } else if (inObj.nm_room.slice(0,6) === 'プロジェクト') {
                                inObj.kubun_room = 3
                            } else {
                                inObj.kubun_room = 2
                            }
                            m_yoyaku.insert(inObj, (err, retObj) => {
                                if (err) { throw err };
                                logger.info(`会議室予約情報ID：${inObj.id}`);
                            })
                        }
                    })
                    src.on("end", () => {
                        // 対象ファイルを処理した場合は対象ファイルをリネーム
                        fs.rename(
                            config.dlpath + "\\" + targetfilename,
                            config.dlpath + "\\" + targetfilename + ".old",
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

    // 会議室稼働率情報設定
    const setPerInfo = (addnum) => {

        const yyyymm = getCurrentYYYYMM(addnum);

        // 現在の月の稼働時間を求める
        // ◆全体
        const allTimeAll = tool.getHourbyYYYYMM(yyyymm, 1, 1) + tool.getHourbyYYYYMM(yyyymm, 2, 1);
        const allTime45 = tool.getHourbyYYYYMM(yyyymm, 1, 2) + tool.getHourbyYYYYMM(yyyymm, 2, 2);
        const allTimeMtg = tool.getHourbyYYYYMM(yyyymm, 1, 3) + tool.getHourbyYYYYMM(yyyymm, 2, 3);
        const allTimePrj = tool.getHourbyYYYYMM(yyyymm, 1, 4) + tool.getHourbyYYYYMM(yyyymm, 2, 4);

        let inObj = {};
        inObj.yyyymm = yyyymm;
        inObj.kubun_room = 1;
        m_yoyaku.calcTime(inObj, (err, retObj) => {
            if (err) { throw err };
            const retAll = retObj;
            inObj.kubun_room = 2;
            m_yoyaku.calcTime(inObj, (err, retObj) => {
                if (err) { throw err };
                const ret45 = retObj;
                inObj.kubun_room = 3;
                m_yoyaku.calcTime(inObj, (err, retObj) => {
                    if (err) { throw err };
                    const retMtg = retObj;
                    inObj.kubun_room = 4;
                    m_yoyaku.calcTime(inObj, (err, retObj) => {
                        if (err) { throw err };
                        // [0]がある場合、[1]がある場合、どちらもない場合もあるよ
                        const retPrj = retObj;
                        const perAll = ((retAll[0].totaltime + retAll[1].totaltime) / allTimeAll) * 100;
                        const per45 = ((ret45[0].totaltime + ret45[1].totaltime) / allTime45) * 100;
                        const perMtg = ((retMtg[0].totaltime + retMtg[1].totaltime) / allTimeMtg) * 100;
                        const perPrj = ((retPrj[0].totaltime + retPrj[1].totaltime) / allTimePrj) * 100;
                    });
                });
            });
        });
    }

}

module.exports = {
    startcron,
}
