module.exports = {
  port: 3000,
  url: {
    outai: "http://192.168.1.51:3000/outai/",
    outaikaigi: "http://192.168.1.51:3000/outaikaigi/",
    kanri: "https://www.yamori-yoyaku.jp/studio/OfficeLogin.htm",
  },
  dlpath: "C:\\download\\customer",
  login_id: "",
  login_passwd: "",
  mail: {
      smtp: {
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
      },
      user: "",
      passwd: "",
      from: "",
      to: "",
  },
  db: {
      host:"localhost",
      user: "pfs",
      password: "",
      database: "pfs",
      port: 58020,
//      port: 3306,
  },
  cron: {
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
    dlyoyaku_0: "30 23 * * *",
    dlyoyaku_1: "35 23 * * *",
    dlyoyaku_2: "40 23 * * *",
    dlyoyaku_3: "45 23 * * *",
    dlyoyaku_4: "50 23 * * *",
    // 会議室予約情報取込
    setyoyaku_0: "33 23 * * *",
    setyoyaku_1: "38 23 * * *",
    setyoyaku_2: "43 23 * * *",
    setyoyaku_3: "48 23 * * *",
    setyoyaku_4: "53 23 * * *",
    // 会議室稼働率計算
    calcperyoyaku_0: "55 23 * * *",
    calcperyoyaku_1: "56 23 * * *",
    calcperyoyaku_2: "57 23 * * *",
    calcperyoyaku_3: "58 23 * * *",
    calcperyoyaku_4: "59 23 * * *",
  }
};
