const log4js = require("log4js");
const logger = log4js.configure('./config/log4js-config.json').getLogger();

const cron = require('node-cron');
const m_outai = require('../model/outais');
const mail = require('./sendmail');

// cron設定
const startcron = () => {

    // 月曜日から金曜日の朝9:00に通知メールを送信する
    cron.schedule('0 9 * * 1-5', () => {
        query = 'select * from(SELECT o.*,ua.name AS name_add, uu.name AS name_upd, ifnull(c.name, "会社指定なし") as name_company FROM outais o left outer JOIN companies c ON o.id_company = c.id LEFT OUTER JOIN users ua ON ua.id = o.id_add LEFT OUTER JOIN users uu ON uu.id = o.id_upd) ocu WHERE ocu.status != "完了" ORDER BY ocu.ymdhms_upd desc'
        m_outai.selectSQL(query, (err, retObj) => {
            if (err) { next(err) };
            let outais = retObj;
            let content = `未完了の応対履歴一覧となります。\r\n内容を確認し、対応を行ってください。\r\n\r\n-----------------------------------------------------\r\n`;
            let url = 'http://192.168.1.19:3000/outai/'

            outais.forEach(outai => {
                content += `会社：${outai.name_company}\r\nステータス：${outai.status}\r\n登録日時：${outai.ymdhms_add}\r\n登録者：${outai.name_add}\r\n更新日時：${outai.ymdhms_upd}\r\n更新者：${outai.name_upd}\r\n＜内容＞\r\n${outai.content}\r\n${url}${outai.id}\r\n------------------------------------------------------\r\n`
            });

            //メール送信
            mail.send("応対履歴一覧", content)

            logger.info(`cronより通知メールを送信しました：${new Date()}`);
        });
    });
}

module.exports = {
    startcron,
}
