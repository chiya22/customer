var express = require('express');
var router = express.Router();
const security = require('../../util/security');

/* GET home page. */
router.get('/', security.authorize(), function (req, res, next) {
  res.render('admin/admin', {
  });
});

module.exports = router;
