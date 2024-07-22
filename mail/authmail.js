const mail = require("nodemailer");

const transporter = mail.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "kevicota.cm@gmail.com",
    pass: "thjq rqpr nggi kkpt",
  },
});

const sendCode = async function (email, code) {
  const info = await transporter.sendMail({
    from: '"Anime"<kevicota.cm@gmail.com>',
    to: `${email}`,
    subject: "Verification code",
    text: `Code: ${code}`,
    html: `Your code is<b> ${code}</b>`,
  });
  console.log("Message sent: %s", info.messageId);
};

module.exports = { sendCode };
