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
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
  },
  cron: {
    // クーロン有効設定
    effective: "on",
    // Trelloタスク確認
    trello: "0 9 * * 1-5",
    // 通知メール（応対履歴、会議室）
    outai: "0 9 * * 1-5",
    // 通知メール（応対履歴）
    outaikaigi: "2 9 * * 1-5",
    // 通知メール（未入金会議室予約情報）
    mishukaigi: "4 9 * * 1-5",
    // 会議室利用者情報ダウンロード
    dlriyousha: "15 09 * * 1-5",
    // 会議室利用者情報取込
    setriyousha: "30 9 * * 1-5",
    // 会議室予約情報ダウンロード
    // 会議室予約情報初期化
    // 会議室予約情報取込
    dlyoyaku_minus1: "0 22 * * *",
    clearyoyaku_minus1: "10 22 * * *",
    setyoyaku_minus1: "15 22 * * *",
    dlyoyaku_0: "25 22 * * *",
    clearyoyaku_0: "35 22 * * *",
    setyoyaku_0: "40 22 * * *",
    dlyoyaku_1: "50 22 * * *",
    clearyoyaku_1: "0 23 * * *",
    setyoyaku_1: "5 23 * * *",
    dlyoyaku_2: "15 23 * * *",
    clearyoyaku_2: "25 23 * * *",
    setyoyaku_2: "30 23 * * *",
    dlyoyaku_3: "40 23 * * *",
    clearyoyaku_3: "50 23 * * *",
    setyoyaku_3: "55 23 * * *",
    dlyoyaku_4: "5 0 * * *",
    clearyoyaku_4: "15 0 * * *",
    setyoyaku_4: "20 0 * * *",
    // 会議室稼働率計算
    calcperyoyaku_minus1: "30 0 * * *",
    calcperyoyaku_0: "35 0 * * *",
    calcperyoyaku_1: "40 0 * * *",
    calcperyoyaku_2: "45 0 * * *",
    calcperyoyaku_3: "50 0 * * *",
    calcperyoyaku_4: "55 0 * * *",
  }
};
