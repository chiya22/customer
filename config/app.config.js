module.exports = {
  url: {
    outai: "http://192.168.1.51:3000/outai/",
    outaikaigi: "http://192.168.1.51:3000/outaikaigi/",
    kanri: "https://www.yamori-yoyaku.jp/studio/OfficeLogin.htm",
  },
  dlpath: "C:\\download\\cutomer",
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
      user: "",
      password: "",
      database: "pfs",
      port: 58020,
  },
  port: 3000,
};
