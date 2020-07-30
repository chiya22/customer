var express = require('express');
var router = express.Router();

const security = require('../util/security');
const tool = require('../util/tool');

const m_company = require('../model/company');
const m_person = require('../model/person');
const m_sq = require('../model/sq');

// 会社ページより「個人登録」をクリック
router.get('/add/:id_company', security.authorize(), function (req, res, next) {

  let company = {};

  //会社情報
  let inObj = {};
  inObj.id = req.params.id_company;
  m_company.findPKey(inObj, (err, retObj) => {
    if (err) { next(err) };
    company = retObj;

    //会社セレクト情報
    let inObjP = {};
    inObjP.id_company = req.params.id_company;
    m_company.findForSelect((err, retObj) => {
      if (err) { next(err) };
      res.render('personform', {
        person: inObjP,
        company: company,
        companies: retObj,
        mode: 'insert',
        errors: null,
      });
    });
  })
});

// TOPページから「個人リンク選択」での個人ページへ遷移
router.get('/:id', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.params.id;
  let person;
  m_person.findPKey(inObj, (err, retObj) => {
    if (err) { next(err); }
    person = retObj;
    if (person.id_company) {
      let inObjC = {};
      inObjC.id = person.id_company;
      m_company.findPKey(inObjC, (err, retObj) => {
        if (err) { next(err); }
        res.render('person', {
          person: person,
          companyname: retObj.name,
        });
      })
    } else {
      res.render('person', {
        person: person,
        companyname: null,
      });
    }
  });
});

// 個人ページから「更新」リンクでの個人（編集）ページへの遷移
router.get('/update/:id', security.authorize(), function (req, res, next) {
  let companies;
  let person;

  //個人情報
  let inObj = {};
  inObj.id = req.params.id;
  m_person.findPKey(inObj, (err, retObj) => {
    if (err) { next(err) };
    person = retObj;

    //会社情報
    let inObjC = {};
    inObjC.id = person.id_company;
    m_company.findPKey(inObjC, (err, retObj) => {
      if (err) { next(err) };
      company = retObj;

      //会社セレクト情報
      m_company.findForSelect((err, retObj) => {
        if (err) { next(err) };
        res.render('personform', {
          person: person,
          company: company,
          companies: retObj,
          mode: 'update',
          errors: null,
        });
      });
    });
  });
});

// 個人ページから「削除」リンクでの個人（編集）ページへの遷移
router.get('/delete/:id', security.authorize(), function (req, res, next) {

  //個人情報
  let person = {};
  let inObj = {};
  inObj.id = req.params.id;
  m_person.findPKey(inObj, (err, retObj) => {
    if (err) { next(err) };
    person = retObj;

    //会社情報
    let inObjC = {};
    inObjC.id = person.id_company;
    m_company.findPKey(inObj, (err, retObj) => {
      if (err) { next(err); }
      res.render('personform', {
        person: person,
        company: retObj,
        companies: null,
        mode: 'delete',
        errors: null,
      });
    });
  });
});

// 個人情報の登録
router.post('/insert', security.authorize(), function (req, res, next) {
  let inObj = getPersonData(req.body);
  inObj.ymd_start = tool.getToday();
  inObj.ymd_upd = tool.getToday();
  inObj.id_upd = req.user;

  //入力チェック
  const errors = validateData(req.body);
  if (errors) {

    //会社情報
    let company = {};
    let inObjC = {};
    inObjC.id = inObj.id_company;
    m_company.findPKey(inObjC, (err, retObj) => {
      if (err) { next(err) };
      company = retObj;

      //会社セレクト情報
      m_company.findForSelect((err, retObj) => {
        if (err) { next(err) };
        res.render('personform', {
          person: inObj,
          company: company,
          companies: retObj,
          mode: 'insert',
          errors: errors,
        });
      });
    });
    return;
  }

  //個人IDの採番号
  m_sq.getSqPerson((err, retObj) => {
    if (err) { next(err); }
    inObj.id = 'P' + ('00000' + retObj.no).slice(-5);
    m_person.insert(inObj, (err, retObj) => {
      //個人のidは自動採番とするため、Duplicateエラーは考慮不要
      if (err) { next(err); }
      if (inObj.id_company) {
        res.redirect('/company/' + inObj.id_company);
      } else {
        res.redirect('/');
      }
    });
  });
});

//個人情報の更新
router.post('/update', security.authorize(), function (req, res, next) {
  let inObj = getPersonData(req.body);
  inObj.ymd_upd = tool.getToday();
  inObj.id_upd = req.user;

  //会社情報
  let company = {};
  let inObjC = {};
  inObjC.id = inObj.id_company;
  m_company.findPKey(inObjC, (err, retObj) => {
    if (err) { next(err) };
    company = retObj;
  });

  //入力チェック
  const errors = validateData(req.body);
  if (errors) {
    m_company.findForSelect((err, retObj) => {
      if (err) { next(err) };
      res.render('personform', {
        person: inObj,
        company: company,
        companies: retObj,
        mode: 'update',
        errors: errors,
      });
    });
    return;
  }

  m_person.update(inObj, (err, retObj) => {
    if (err) { next(err); }
    if (retObj.changedRows === 0) {
      m_company.findForSelect((err, retObj) => {
        if (err) { next(err); }
        let errors = {};
        errors.common = '更新対象はすでに削除されています';
        res.render('personform', {
          person: inObj,
          company: company,
          companies: retObj,
          mode: 'update',
          errors: errors,
        });
      });
    } else {
      if (inObj.id_company) {
        res.redirect('/company/' + inObj.id_company);
      } else {
        res.redirect('/');
      }
    }
  });
});

//個人情報の削除
router.post('/delete', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.body.id;
  inObj.ymd_kaiyaku = req.body.ymd_kaiyaku;
  if (inObj.ymd_kaiyaku === '99991231') {
    inObj.ymd_kaiyaku = tool.getToday();
  }
  inObj.ymd_end = tool.getToday();

  m_person.remove(inObj, (err, retObj) => {
    if (err) { next(err); }
    if (inObj.id_company) {
      res.redirect('/company/' + inObj.id_company);
    } else {
      res.redirect('/');
    }
  });
});

//個人情報の解約
router.post('/cancel', security.authorize(), function (req, res, next) {

  let inObj = {};
  inObj.id = req.body.id;
  inObj.ymd_kaiyaku = tool.getToday();
  inObj.ymd_upd = tool.getToday();
  inObj.id_upd = req.user;

  m_person.cancel(inObj, (err, retObj) => {
    if (err) { next(err) }
    if ((req.body.id_company) && (req.body.id_company !== '')) {
      res.redirect('/company/' + req.body.id_company);
    } else {
      res.redirect('/');
    }
  });
});


function validateData(body) {

  let isValidated = true;
  let errors = {};

  if (!body.kubun_person) {
    isValidated = false;
    errors.kubun_person = "個人区分が未入力です。";
  }
  if (!body.name) {
    isValidated = false;
    errors.name = "個人名が未入力です。";
  } else {
    if (body.name.length > 100) {
      isValidated = false;
      errors.name = "個人名は100桁以下で入力してください。";
    }
  }
  if (body.kana) {
    if (body.kana.length > 100) {
      isValidated = false;
      errors.kana = "個人名カナは100桁以下で入力してください。";
    }
  }
  if (body.telno) {
    if (body.telno.length > 20) {
      isValidated = false;
      errors.telno = "電話番号は20桁以下で入力してください。";
    }
  }
  if (body.telno_mobile) {
    if (body.telno_mobile.length > 20) {
      isValidated = false;
      errors.telno_mobile = "携帯電話番号は20桁以下で入力してください。";
    }
  }
  if (body.email) {
    if (body.email.length > 20) {
      isValidated = false;
      errors.email = "メールアドレスは100桁以下で入力してください。";
    }
  }
  if (body.no_yubin) {
    if (body.no_yubin.length !== 8) {
      isValidated = false;
      errors.no_yubin = "郵便番号は8桁（XXX-XXXX形式）で入力してください。";
    }
  }
  if (body.todoufuken) {
    if (body.todoufuken.length > 100) {
      isValidated = false;
      errors.todoufuken = "都道府県は100桁以下で入力してください。";
    }
  }
  if (body.address) {
    if (body.address.length > 200) {
      isValidated = false;
      errors.address = "住所は200桁以下で入力してください。";
    }
  }
  if (!body.ymd_nyukyo) {
    isValidated = false;
    errors.ymd_nyukyo = "入居年月日が未入力です。";
  }
  if (body.bikou) {
    if (body.bikou.length > 100) {
      isValidated = false;
      errors.bikou = "備考は1000桁以下で入力してください。";
    }
  }

  return isValidated ? undefined : errors;
}

function getPersonData(body) {
  let inObj = {};
  inObj.id = body.id;
  inObj.id_company = body.id_company;
  inObj.kubun_company = body.kubun_company;
  inObj.kubun_person = body.kubun_person;
  inObj.name = body.name;
  inObj.kana = body.kana;
  inObj.telno = body.telno;
  inObj.telno_mobile = body.telno_mobile;
  inObj.email = body.email;
  inObj.no_yubin = body.no_yubin;
  inObj.todoufuken = body.todoufuken;
  inObj.address = body.address;
  inObj.ymd_nyukyo = body.ymd_nyukyo;
  inObj.ymd_kaiyaku = body.ymd_kaiyaku;
  inObj.ymd_start = body.ymd_start;
  inObj.ymd_end = body.ymd_end;
  inObj.ymd_upd = body.ymd_upd;
  inObj.id_upd = body.id_upd;
  inObj.bikou = body.bikou;
  return inObj;
}

module.exports = router;
