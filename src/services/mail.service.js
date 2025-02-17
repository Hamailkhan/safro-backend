const nodemailer = require("nodemailer");
const { config } = require("../config/server.config");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: true,
  auth: {
    appName: "Safro",
    user: "hamailkhan213@gmail.com",
    pass: config.appPassword,
  },
});

const sendEmail = async (data) => {
  try {
    const response = await transporter.sendMail({
      ...data,
    });

    return response;
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
};

module.exports = {
  sendEmail,
};
