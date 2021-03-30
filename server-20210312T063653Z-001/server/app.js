const config = require("config");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes");
const http = require("http");
const bluebird = require("bluebird");
const mongoose = require("mongoose");
const path = require("path");
var exphbs = require("express-handlebars");

const swaggerUi = require('swagger-ui-express');
const  openApiDocumentation = require('./openApiDocumentation.json');


// TODO: add a stripe key

const uuid = require("uuid/v4");

require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_PUBLISH_KEY);

// middelware
const app = express();
_startServer();


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocumentation));


async function _startServer() {
  app.engine("handlebars", exphbs());
  app.set("view engine", "handlebars");

  app.use(cors());
  app.use(
    bodyParser.json({
      limit: "100mb",
    })
  );
  app.use(
    bodyParser.urlencoded({
      limit: "100mb", //TODO: study this
      extended: true,
    })
  );

  app.get("/test1", (req, res) => {
    res.send("hello world");
  });
  // app.use('/upload',express.static('public/test'))

  // app.use('/test', express.static(__dirname+ '/uploads/usersProfile'))

  // stripe setup
  // app.post("/payment", (req, res) => {
  //   const { prodcut, token } = req.body;
  //   console.log("PRODUCT", product);
  //   console.log("PRODUCT", price);

  //   const idempontencyKey = uuid();
  //   return stripe.customers
  //     .create({
  //       email: token.email,
  //       source: token.id,
  //     })
  //     .then((customer) => {
  //       stripe.charges.create(
  //         {
  //           amount: product.price * 100,
  //           currency: "usd",
  //           customer: customers.id,
  //           receipt_email: token.email,
  //           description: product.name,
  //           shipping: {
  //             name: token.card.name,
  //             address: {
  //               country: token.card.address_country,
  //             },
  //           },
  //         },
  //         { idempontencyKey }
  //       );
  //     })
  //     .then((result) => {
  //       res.status(200).json({ result });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // });

  app.use(
    "/getProductImg",
    express.static(path.join(__dirname, "uploads", "products"))
  );
  app.use("/", routes);
  mongoose.Promise = bluebird;

  // temp for otp

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true, //TODO: study this
      useCreateIndex: true, //TODO: study this
      useFindAndModify: false, //TODO: study this
      useUnifiedTopology: true,
    });
    // if few functions are deprecated, that shows warnings, to prevent this above settings are required
    console.log(
      "Successfully Connected to the Mongodb at " + process.env.MONGODB_URI
    );
    await http.createServer(app).listen(process.env.PORT || 3005, function () {
      //TODO: We can do some task after server is ready
      // You Will learn this in actual project
    });
    console.log("Express server listening on port " + process.env.PORT);
  } catch (e) {
    console.log(e);
  }
}
