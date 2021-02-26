const express = require('express');
const router = express.Router();
const security = require('../util/security');
const perinfo = require("../model/perinfo");

// const log4js = require("log4js");
// const logger = log4js.configure('./config/log4js-config.json').getLogger();

// index
router.get('/', security.authorize(), function (req, res, next) {

  perinfo.findAll((err,retObj) => {
    if (err) { throw err};
    res.render('top', {
      results: retObj,
    });
  })
});

module.exports = router;
