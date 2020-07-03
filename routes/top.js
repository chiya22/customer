var express = require('express');
var router = express.Router();

var connection = require('../db/mysqlconfig.js');
const security = require('../util/security');

// TOPページ
router.get('/', security.authorize(), function (req, res, next) {
  res.render('top', {
    searchvalue: null,
        results: null,
  });
});

//検索文字列を指定して、会社検索
router.post('/', security.authorize(), function (req, res, next) {
  const searchvalue = req.body.searchvalue;
  connection.query('(select "company" AS kubun, c.id, c.name, c.kana from companies as c where (c.name like "%' + searchvalue + '%") or (c.kana like "%' + searchvalue + '%")) union all (select "person" AS kubun, p.id, p.name, p.kana from persons as p where (p.name like "%' + searchvalue + '%") or (p.kana like "%' + searchvalue + '%"))', function (error, results, fields) {
    if (error) throw error;
    res.render('top', {
      searchvalue: searchvalue,
      results: results,
    });
  });
});

module.exports = router;
