var express = require('express');
var router = express.Router();

var connection = require('../db/mysqlconfig.js');
const security = require('../util/security');

// TOPページ
router.get('/:id', security.authorize(), function (req, res, next) {
  const id_person = req.params.id;
  connection.query('select * from persons where id = "' + id_person + '"', function (error, results, fields) {
    if (error) throw error;
    res.render('person', {
      person: results[0],
    });
  });
});

module.exports = router;
