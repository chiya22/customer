const nodemailer = require('nodemailer');
const config = require("../config/app.config");

const log4js = require("log4js");
const logger = log4js.configure('./config/log4js-config.json').getLogger();

const send = (title, content) => {

    // 認証情報
    const auth = {
        type         : 'OAuth2',
        user         : process.env.MAIL_USER,
        clientId     : process.env.CLIENT_ID,
        clientSecret : process.env.CLIENT_SECRET,
        refreshToken : process.env.REFRESH_TOKEN
    };

    // トランスポート
    const smtp_config = {
        service : 'gmail',
        auth    : auth
    };    

    let transporter = nodemailer.createTransport(smtp_config);

    // メール情報
    let message = {
        from: process.env.MAIL_FROM,
        to: process.env.MAIL_TO,
        subject: title,
        text: content,
    };

    // メール送信
    transporter.sendMail(message, function (err, response) {
        if (err) {
            logger.info(`[err]${err}`);
        }
    });
}

// XServerを使用してメール送信
const sendByXserer = (title, content) => {

    // トランスポート
    const smtp_config = {
        host: process.env.MAIL_ADMIN_HOST,
        port: process.env.MAIL_ADMIN_PORT,
        secure: true,
        auth: {
            user: process.env.MAIL_ADMIN_USER,
            pass: process.env.MAIL_ADMIN_PASSWORD,
        },
    };    

    let transporter = nodemailer.createTransport(smtp_config);

    // メール情報
    let message = {
        from: process.env.MAIL_ADMIN_FROM,
        to: process.env.MAIL_ADMIN_TO,
        subject: title,
        text: content,
    };

    // メール送信
    transporter.sendMail(message, function (err, response) {
        if (err) {
            logger.info(`[err]${err}`);
        }
    });
}

module.exports = {
    send,
    sendByXserer,
};