var express = require('express');
var router = express.Router();

var connection = require('../db/mysqlconfig.js');
const security = require('../util/security');

// TOPページ
router.get('/:id', security.authorize(), function (req, res, next) {
  const id_company = req.params.id;
  let company;
  connection.query('select * from companies where id = "' + id_company + '"', function (error, results, fields) {
    if (error) throw error;
    company = results[0];
    connection.query('select * from persons where id_company = "' + id_company + '"', function (error, results, fields) {
      res.render('company', {
        company: company,
        persons: results,
      });
    });
  });
});

module.exports = router;
