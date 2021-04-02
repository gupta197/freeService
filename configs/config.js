module.exports = {
  PORT: process.env.PORT,
  HOST_URL: process.env.HOST_URL,
  swaggerHost: process.env.SWAGGER_HOST,
  i18n: {
    locales: ["en"],
    updateFiles: false,
    directory: __dirname + "/locales",
  },
  mailerSettings: {
    host: process.env.EMAIL_SERVICE,
    port: process.env.EMAIL_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  },
  fromEmail: process.env.FROM_EMAIL,
};
