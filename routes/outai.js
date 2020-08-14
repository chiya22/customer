var express = require('express');
var router = express.Router();

const security = require('../util/security');
const tool = require('../util/tool');

const m_sq = require('../model/sq');
const m_outai = require('../model/outais');
const m_company = require('../model/company');


//すべての応対履歴一覧表示へ
router.get('/', security.authorize(), function (req, res, next) {

  let inObj = {};
  inObj.id = req.params.id_company;
  m_outai.find(inObj, (err, retObj) => {
    if (err) { next(err) };
    res.render('outais', {
      outais: retObj,
      errors: null,
    });
  });
});

//会社IDをもとに応対履歴一覧表示へ
router.get('/company/:id_company', security.authorize(), function (req, res, next) {

  let inObj = {};
  inObj.id = req.params.id_company;
  m_outai.findByCompany(inObj, (err, retObj) => {
    if (err) { next(err) };
    res.render('outais', {
      outais: retObj,
      errors: null,
    });
  });
});

//応対履歴IDをもとに応対履歴情報表示へ
router.get('/:id_outai', security.authorize(), function (req, res, next) {

  let outai = {};

  let inObj = {};
  inObj.id = req.params.id_outai;
  m_outai.findPKey(inObj, (err, retObj) => {
    if (err) { next(err) };
    outai = retObj;

    if (outai.id_company) {
      let inObjC = {};
      inObjC.id = outai.id_company;
      m_company.findPKey(inObjC, (err, retObj) => {
        if (err) { next(err) };
        res.render('outai', {
          outai: outai,
          selectCompany: retObj,
          errors: null,
        });
      });
    } else {
      res.render('outai', {
        outai: outai,
        selectCompany: null,
        errors: null,
      });
    }
  });
});

//応対履歴情報表示から「更新」ボタンで応対履歴を更新するフォームへ
router.get('/update/:id_outai', security.authorize(), function (req, res, next) {

  let outai = {};
  let companies = {};

  let inObj = {};
  inObj.id = req.params.id_outai;
  m_outai.findPKey(inObj, (err, retObj) => {
    if (err) { next(err) };
    outai = retObj;

    m_company.findForSelect((err, retObj) => {
      if (err) { next(err) };
      companies = retObj;

      if (outai.id_company) {
        let inObjC = {};
        inObjC.id = outai.id_company;
        m_company.findPKey(inObjC, (err, retObj) => {
          if (err) { next(err) };
          res.render('outaiform', {
            outai: outai,
            companies: companies,
            selectCompany: retObj,
            mode: 'update',
            errors: null,
          });
        });
      } else {
        res.render('outaiform', {
          outai: outai,
          companies: companies,
          selectCompany: null,
          mode: 'update',
          errors: null,
        });
      };
    });
  });
});

//会社IDをもとに応対履歴を追加するフォームへ
router.get('/insert/:id_company', security.authorize(), function (req, res, next) {

  let company = {};

  if (req.params.id_company) {
    let inObj = {};
    inObj.id = req.params.id_company;

    m_company.findPKey(inObj, (err, retObj) => {
      if (err) { next(err) };
      company = retObj;

      m_company.findForSelect((err, retObj) => {
        if (err) { next(err) };
        res.render('outaiform', {
          outai: null,
          companies: retObj,
          selectCompany: company,
          mode: 'insert',
          errors: null,
        });
      });
    });

  } else {
    m_company.findForSelect((err, retObj) => {
      if (err) { next(err) };
      res.render('outaiform', {
        outai: null,
        companies: retObj,
        selectCompany: null,
        mode: 'insert',
        errors: null,
      });
    });
  }
});

// 応対履歴情報の登録
router.post('/insert', security.authorize(), function (req, res, next) {

  let inObj = getRirekiData(req.body);
  inObj.ymd_add = tool.getToday();
  inObj.ymd_upd = tool.getToday();
  inObj.id_add = req.user.id;
  inObj.id_upd = req.user.id;

  //エラー情報
  let errors;

  //入力チェック
  errors = validateData(req.body);

  if (errors) {

    //すでに会社を選択している場合
    if (inObj.id_company) {

      let company = {};

      let inObjC = {};
      inObjC.id = inObj.id_company;

      m_company.findPKey( inObjC, (err, retObj) => {
        if (err) { next(err) };
        company = retObj;

        m_company.findForSelect((err, retObj) => {
          if (err) { next(err) };
          res.render('outaiform', {
            outai: inObj,
            companies: retObj,
            selectCompany: company,
            mode: 'insert',
            errors: errors,
          });
        });
      });

    //会社を選択していない場合
    } else {
      m_company.findForSelect((err, retObj) => {
        if (err) { next(err) };
        res.render('outaiform', {
          outai: inObj,
          companies: retObj,
          selectCompany: null,
          mode: 'insert',
          errors: errors,
        });
      });
    }
    return;
  }

  //応対履歴IDの採番号
  m_sq.getSqOutai((err, retObj) => {
    if (err) { next(err); }
    inObj.id = 'O' + ('000000000' + retObj.no).slice(-9);
    m_outai.insert(inObj, (err, retObj) => {
      //個人のidは自動採番とするため、Duplicateエラーは考慮不要
      if (err) { next(err); }
      if (inObj.id_company) {
        res.redirect('/outai/' + inObj.id);
      } else {
        res.redirect('/outai');
      }
    });
  });
});

//応対履歴情報の更新
router.post('/update', security.authorize(), function (req, res, next) {
  let inObj = getRirekiData(req.body);
  inObj.ymd_upd = tool.getToday();
  inObj.id_upd = req.user.id;

  //エラー情報
  let errors;

  //入力チェック
  errors = validateData(req.body);
  if (errors) {
    m_company.findForSelect((err, retObj) => {
      if (err) { next(err) };
      res.render('outaiform', {
        outai: inObj,
        companies: retObj,
        mode: 'update',
        errors: errors,
      });
    });
    return;
  }

  m_outai.update(inObj, (err, retObj) => {
    if (err) { next(err); }
    if (retObj.changedRows === 0) {
      let errors = {};
      errors.common = '更新対象はすでに削除されています';
      m_company.findForSelect((err, retObj) => {
        if (err) { next(err) };
        res.render('outaiform', {
          outai: inObj,
          companies: retObj,
          mode: 'update',
          errors: errors,
        });
      });
    } else {
      if (inObj.id_company) {
        res.redirect('/outai/' + inObj.id);
      } else {
        res.redirect('/outai');
      }
    }
  });
});

function validateData(body) {

  let isValidated = true;
  let errors = {};

  if (!body.content) {
    isValidated = false;
    errors.content = "内容が未入力です。";
  } else {
    if (body.content.length > 1000) {
      isValidated = false;
      errors.content = "内容は1000桁以下で入力してください。";
    }
  }

  return isValidated ? undefined : errors;
}

function getRirekiData(body) {
  let inObj = {};
  inObj.id = body.id;
  inObj.id_company = body.id_company;
  inObj.content = body.content;
  inObj.status = body.status;
  inObj.ymd_add = body.ymd_add;
  inObj.id_add = body.id_add;
  inObj.ymd_upd = body.ymd_upd;
  inObj.id_upd = body.id_upd;
  return inObj;
}

module.exports = router;
