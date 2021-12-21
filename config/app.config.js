if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
module.exports = {
  port: 3000,
  url: {
    outai: process.env.URL_OUTAI,
    outaikaigi: process.env.URL_OUTAIKAIGI,
    kanri: process.env.URL_KANRI,
  },
  dlpath: process.env.DL_PATH,
  login_id: process.env.YOYAKU_ID,
  login_passwd: process.env.YOYAKU_PASSWORD,
  mail: {
      smtp: {
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
      },
      user: process.env.MAIL_USER,
      passwd: process.env.MAIL_PASSWORD,
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
  },
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
  },
  cron: {
    // クーロン有効設定
    effective: "off",
    // Trelloタスク確認
    trello: "0 9 * * 1-5",
    // 通知メール（応対履歴、会議室）
    outai: "0 9 * * 1-5",
    // 通知メール（応対履歴）
    outaikaigi: "0 9 * * 1-5",
    // 通知メール（未入金会議室予約情報）
    mishukaigi: "0 9 * * 1-5",
    // 会議室利用者情報ダウンロード
    dlriyousha: "15 09 * * 1-5",
    // 会議室利用者情報取込
    setriyousha: "30 9 * * 1-5",
    // 会議室予約情報ダウンロード
    dlyoyaku_minus1: "25 23 * * *",
    dlyoyaku_0: "30 23 * * *",
    dlyoyaku_1: "35 23 * * *",
    dlyoyaku_2: "40 23 * * *",
    dlyoyaku_3: "45 23 * * *",
    dlyoyaku_4: "50 23 * * *",
    // 会議室予約情報取込
    setyoyaku_minus1: "28 23 * * *",
    setyoyaku_0: "33 23 * * *",
    setyoyaku_1: "38 23 * * *",
    setyoyaku_2: "43 23 * * *",
    setyoyaku_3: "48 23 * * *",
    setyoyaku_4: "53 23 * * *",
    // 会議室稼働率計算
    calcperyoyaku_minus1: "35 23 * * *",
    calcperyoyaku_0: "55 23 * * *",
    calcperyoyaku_1: "56 23 * * *",
    calcperyoyaku_2: "57 23 * * *",
    calcperyoyaku_3: "58 23 * * *",
    calcperyoyaku_4: "59 23 * * *",
  }
};
