var express = require("express");
var router = express.Router();
var swaggerJSDoc = require("swagger-jsdoc");
var swaggerUi = require("swagger-ui-express");
var config = require("./config");
// swagger definition
var swaggerDefinition = {
  info: {
    title: "Free Service API",
    version: "1.0.0",
    description: "Free Service API Documentation",
  },
  host: config.swaggerHost,
  basePath: "/",
  schemes: ["http", "https"],
  securityDefinitions: {
    // Bearer: {
    //     type: "apiKey",
    //     name: "Authorization",
    //     in: "header",
    //     description: "Bearer space TOKEN from LOGIN API in [Bearer TOKEN] format"
    // }
  },
};

// options for the swagger docs
var options = {
  // import swaggerDefinitions
  swaggerDefinition: swaggerDefinition,
  // path to the API docs
  apis: ["routes/*.js", "routes/index/*.js"],
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);
// serve swagger
router.get("/swagger.json", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//export this router to use in our app.js
module.exports = router;
