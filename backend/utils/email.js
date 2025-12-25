const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

/*
    e.g. : sendEmail(['test@uuuuuu.com'], 'Hello world!', '<strong>It works!</strong>')
*/
async function sendEmail(client_mail, mail_subject, mail_text) {
    return resend.emails.send({
        from: 'ROSCA <onboarding@resend.dev>',
        to: client_mail,
        subject: mail_subject,
        html: mail_text,
    });
}

module.exports = { sendEmail };
