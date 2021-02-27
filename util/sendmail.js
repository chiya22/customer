const nodemailer = require('nodemailer');
const config = require("../config/app.config");

const log4js = require("log4js");
const logger = log4js.configure('./config/log4js-config.json').getLogger();

const send = (title, content) => {

    // SMTP情報
    const smtp_config = {
        host: config.mail.smtp.host,
        port: config.mail.smtp.port,
        secure: config.mail.smtp.secure,
        auth: {
            user: config.mail.user,
            pass: config.mail.passwd,
        },
    }

    let transporter = nodemailer.createTransport(smtp_config);

    // メール情報
    let message = {
        from: config.mail.from,
        to: config.mail.to,
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
};