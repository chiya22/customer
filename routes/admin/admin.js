var express = require('express');
var router = express.Router();
const security = require('../../util/security');

const m_person = require('../../model/person');
const m_nyukyo = require('../../model/nyukyos');

/* GET home page. */
router.get('/', security.authorize(), function (req, res, next) {
  res.render('admin/admin', {
  });
});

/* 個人リストダウンロード（名前順） */
router.post('/download/persons', function (req, res, next) {

  m_nyukyo.findWithRoom((err, retObj) => {
    if (err) { next(err) };
    const roominfoList = retObj;

    m_person.findForDownload((err, retObj) => {
      if (err) { next(err) };

      csv = '入居者番号,部屋,会社名・屋号,ふりがな（会社名）,利用者名,ふりがな（利用者名）,登録,携帯電話' + '\r\n';
      retObj.forEach((obj) => {
        let name_room = [];
        roominfoList.forEach( roominfo => {
          if (roominfo.id_nyukyo === obj.id_nyukyo) {
            name_room.push(roominfo.name_room);
          }
        });
        obj.name_room = name_room.join('/');
        csv += obj.id_nyukyo + ',' + obj.name_room + ',' + obj.name_company + ',' + obj.kana_company + ',' + obj.name_person + ',' + obj.kana_person + ',' + obj.kubun_person + ',' + obj.telno_mobile + '\r\n';
      });
    
      res.setHeader('Content-disposition', 'attachment; filename=data.csv');
      res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
    
      res.status(200).send(csv);
      // res.redirect(req.baseUrl + '/admin');
    })
  })
});

/* 個人リストダウンロード（入居者番号順） */
router.post('/download/personsordernyukyo', function (req, res, next) {

  m_nyukyo.findWithRoom((err, retObj) => {
    if (err) { next(err) };
    const roominfoList = retObj;

    m_person.findForDownloadOrderNyukyo((err, retObj) => {
      if (err) { next(err) };

      csv = '入居者番号,部屋,会社名・屋号,ふりがな（会社名）,利用者名,ふりがな（利用者名）,登録,携帯電話' + '\r\n';
      retObj.forEach((obj) => {
        let name_room = [];
        roominfoList.forEach( roominfo => {
          if (roominfo.id_nyukyo === obj.id_nyukyo) {
            name_room.push(roominfo.name_room);
          }
        });
        obj.name_room = name_room.join('/');
        csv += obj.id_nyukyo + ',' + obj.name_room + ',' + obj.name_company + ',' + obj.kana_company + ',' + obj.name_person + ',' + obj.kana_person + ',' + obj.kubun_person + ',' + obj.telno_mobile + '\r\n';
      });
    
      res.setHeader('Content-disposition', 'attachment; filename=data.csv');
      res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
    
      res.status(200).send(csv);
      // res.redirect(req.baseUrl + '/admin');
    })
  })
});


module.exports = router;
