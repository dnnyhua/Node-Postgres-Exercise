/** BizTime express application. */


const express = require("express");
const app = express();
app.use(express.json()); // middleware to parse JSON; THIS NEEDS TO BE PLACED BEFORE THE ROUTES
const ExpressError = require("./expressError")

const companiesRoutes = require('./routes/companies')
app.use('/companies', companiesRoutes)

const invoicesRoutes = require('./routes/invoices')
app.use('/invoices', invoicesRoutes)



/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */



app.use(function (err, req, res, next) {
  // the default status is 500 Internal Server Error
  let status = err.status || 500;

  // set the status and alert the user
  return res.status(status).json({
    error: {
      message: err.message,
      status: status
    }
  });
});






module.exports = app;
