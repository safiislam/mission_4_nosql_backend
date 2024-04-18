import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (email: string, html: string) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: config.NODE_ENV === "production", // Use `true` for port 465, `false` for all other ports
        auth: {
            user: "safiislam04@gmail.com",
            pass: "jslo eiwu cnox ohhk",
        },
    });

    // send mail with defined transport object
    await transporter.sendMail({
        from: '"Change the password 👻" <safiislam04@gmail.com>', // sender address
        to: `${email}`, // list of receivers
        subject: "Reset Password", // Subject line
        text: "Hello world?", // plain text body
        html: `${html}`, // html body
    });


}