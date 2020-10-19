const nodemailer = require('nodemailer');

const log4js = require("log4js");
const logger = log4js.configure('./config/log4js-config.json').getLogger();

const send = (title, content) => {

    // SMTP情報
    const smtp_config = {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'gmail-user',
            pass: 'gmail-password',
        },
    }

    let transporter = nodemailer.createTransport(smtp_config);

    // メール情報
    let message = {
        from: 'sendFrom',
        to: 'sendTo',
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