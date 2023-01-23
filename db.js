/** Database setup for BizTime. */

const {Client} = require("pg");



let DB_URI = {
    host: "localhost",
    user: "dnnyhua",
    password: "1123",
    database: ""
  }
  
DB_URI.database = (process.env.NODE_ENV === "test") ? "biztime_test": "biztime";

let db = new Client(DB_URI);

db.connect();

module.exports = db;