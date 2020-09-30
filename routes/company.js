var express = require('express');
var router = express.Router();

const security = require('../util/security');
const tool = require('../util/tool');

const m_nyukyo = require('../model/nyukyos');
const m_company = require('../model/company');
const m_person = require('../model/person');
const m_relation_comroom = require('../model/relation_comroom');
const m_relation_comcabi = require('../model/relation_comcabi');
const m_relation_combicycle = require('../model/relation_combicycle');
const m_relation_comcar = require('../model/relation_comcar');
const m_sq = require('../model/sq');

// TOPページから「登録」ボタンでの遷移
router.get('/', security.authorize(), function (req, res, next) {
  m_nyukyo.findForSelect((err, retObj) => {
    if (err) { next(err); }
    res.render('companyform', {
      company: null,
      nyukyos: retObj,
      mode: 'insert',
      errors: null,
    });
  })
});

// TOPページから「会社リンク選択」での会社ページへの遷移
router.get('/:id', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.params.id;
  let company;
  let persons;
  let nyukyo;
  let cabinets;
  let freecabinets;
  let rooms;
  let nyukyocompanies;
  let bicycles;
  let freebicycles;
  let cars;
  let freecars;

  //会社情報の取得
  m_company.findPKey(inObj, (err, retObj) => {
    if (err) { next(err); }
    company = retObj;

    if (!company) {
      res.redirect('/');
    } else {

      //個人情報の取得
      let inObjP = {};
      inObjP.id_company = req.params.id;
      m_person.findByCompany(inObjP, (err, retObj) => {
        if (err) { next(err); }
        persons = retObj;

        //入居情報の取得
        // m_nyukyo.findPKey(company.id_nyukyo, (err, retObj) => {
        //   if (err) { next(err) };
        //   nyukyo = retObj;

          //入居番号の会社
          // m_company.findByNyukyo(company.id_nyukyo, (err, retObj) => {
          //   if (err) { next(err); }
          //   nyukyocompanies = retObj;

            //キャビネット情報の取得
            m_relation_comcabi.findByCompany(company.id, (err, retObj) => {
              // m_relation_nyucabi.findByNyukyo(company.id_nyukyo, (err, retObj) => {
              if (err) { next(err); }
              cabinets = retObj;

              //空いているキャビネット情報の取得
              m_relation_comcabi.findFree((err, retObj) => {
                // m_relation_nyucabi.findFree((err, retObj) => {
                if (err) { next(err); }
                freecabinets = retObj;

                //駐輪場情報
                m_relation_comcar.findByCompany(company.id, (err, retObj) => {
                  if (err) { next(err); }
                  cars = retObj;

                  //空いている駐輪場情報
                  m_relation_comcar.findFree((err, retObj) => {
                    if (err) { next(err); }
                    freecars = retObj;

                    //駐輪場情報
                    m_relation_combicycle.findByCompany(company.id, (err, retObj) => {
                      if (err) { next(err); }
                      bicycles = retObj;

                      //空いている駐輪場情報
                      m_relation_combicycle.findFree((err, retObj) => {
                        if (err) { next(err); }
                        freebicycles = retObj;

                        //部屋情報の取得
                        m_relation_comroom.findByCompany(inObj.id, (err, retObj) => {
                          if (err) { next(err); }
                          rooms = retObj;

                          //使用／未使用の区分をつけてすべての部屋情報の取得
                          m_relation_comroom.findForSelect((err, retObj) => {
                            // m_relation_comroom.findFree((err, retObj) => {
                            if (err) { next(err); };
                            res.render('company', {
                              company: company,
                              persons: persons,
                              // nyukyo: nyukyo,
                              // nyukyocompanies: nyukyocompanies,
                              cabinets: cabinets,
                              freecabinets: freecabinets,
                              rooms: rooms,
                              selectrooms: retObj,
                              bicycles: bicycles,
                              freebicycles: freebicycles,
                              cars: cars,
                              freecars: freecars,
                            });
                          });
                        });
                      });
                    });
                  });
              //   });
              // });
            });
          });
        });
      });
    }
  });
});

// 会社ページから「更新」リンクでの会社（編集）ページへの遷移
router.get('/update/:id', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.params.id;
  let company;
  m_company.findPKey(inObj, (err, retObj) => {
    if (err) { next(err); }
    company = retObj;
    m_nyukyo.findForSelect((err, retObj) => {
      if (err) { next(err); }
      res.render('companyform', {
        company: company,
        nyukyos: retObj,
        mode: 'update',
        errors: null,
      });
    });
  });
});

// 会社ページから「削除」リンクでの会社（編集）ページへの遷移
router.get('/delete/:id', security.authorize(), function (req, res, next) {
  let inObj = {};
  inObj.id = req.params.id;
  m_company.findPKey(inObj, (err, retObj) => {
    if (err) { next(err); }
    res.render('companyform', {
      company: retObj,
      mode: 'delete',
      errors: null,
    });
  });
});

// 会社情報の登録
router.post('/insert', security.authorize(), function (req, res, next) {

  let inObj = getCompanyData(req.body);
  inObj.ymd_start = tool.getToday();
  inObj.ymd_upd = tool.getToday();
  inObj.id_upd = req.user.id;

  //入力チェック
  const errors = validateData(req.body);
  if (errors) {
    m_nyukyo.findForSelect((err, retObj) => {
      if (err) { next(err) };
      res.render('companyform', {
        company: inObj,
        nyukyos: retObj,
        mode: 'insert',
        errors: errors,
      });
    });
    return;
  }

  //会社IDの採番号
  m_sq.getSqCompany((err, retObj) => {
    if (err) { next(err); }
    inObj.id = 'C' + ('00000' + retObj.no).slice(-5);
    m_company.insert(inObj, (err, retObj) => {
      //会社のidは自動採番とするため、Duplicateエラーは考慮不要
      if (err) { next(err); }
      res.redirect('/');
    });
  });
});

//会社情報の更新
router.post('/update', security.authorize(), function (req, res, next) {
  let inObj = getCompanyData(req.body);
  inObj.ymd_upd = tool.getToday();
  inObj.id_upd = req.user.id;

  //入力チェック
  const errors = validateData(req.body);
  if (errors) {
    m_nyukyo.findForSelect((err, retObj) => {
      if (err) { next(err) };
      res.render('companyform', {
        company: inObj,
        nyukyos: retObj,
        mode: 'update',
        errors: errors,
      });
    });
    return;
  }

  m_company.update(inObj, (err, retObj) => {
    if (err) { next(err); }
    if (retObj.changedRows === 0) {
      m_nyukyo.findForSelect((err, retObj) => {
        let errors = {};
        errors.common = '更新対象がすでに削除されています';
        res.render('companyform', {
          company: inObj,
          nyukyos: retObj,
          mode: 'update',
          errors: errors,
        });
      });
    } else {
      res.redirect('/company/' + inObj.id);
    }
  });
});

//会社情報の削除
router.post('/delete', security.authorize(), function (req, res, next) {

  let inObj = {};
  inObj.id = req.body.id;
  inObj.ymd_kaiyaku = req.body.ymd_kaiyaku;
  if (inObj.ymd_kaiyaku === '99991231') {
    inObj.ymd_kaiyaku = tool.getToday();
  }
  inObj.ymd_end = tool.getToday();

  m_company.remove(inObj, (err, retObj) => {
    if (err) { next(err) }
    if (retObj.changedRows === 0) {
      m_company.findPKey(inObj, (err, retObj) => {
        if (err) { next(err) };
        let errors = {};
        errors.common = '更新対象がすでに削除されています';
        res.render('companyform', {
          company: retObj,
          mode: 'delete',
          errors: errors,
        });
      });
    } else {
      res.redirect('/');
    }
  });
});

//会社情報の解約
router.post('/cancel', security.authorize(), function (req, res, next) {

  const id_company = req.body.id_company;
  let ymd_kaiyaku;

  if (req.body.selected_ymd_kaiyaku) {
    ymd_kaiyaku = req.body.selected_ymd_kaiyaku;
  } else {
    ymd_kaiyaku = tool.getToday();
  }

  let inObj = {};
  inObj.id = id_company;
  inObj.ymd_kaiyaku = ymd_kaiyaku;
  inObj.ymd_upd = tool.getToday();
  inObj.id_upd = req.user.id;

  //会社情報の解約
  m_company.cancel(inObj, (err, retObj) => {
    if (err) { next(err) }

    let inObjP = {};
    inObjP.id_company = id_company;
    inObjP.ymd_kaiyaku = ymd_kaiyaku;
    inObjP.ymd_upd = tool.getToday();
    inObjP.id_upd = req.user.id;

    //個人情報の解約
    m_person.cancelByCompany(inObjP, (err, retObj) => {
      if (err) { next(err) }

      let inObjCR = {};
      inObjCR.ymd_end = ymd_kaiyaku;
      inObjCR.ymd_upd = tool.getToday();
      inObjCR.id_upd = req.user.id;
      inObjCR.id_company = id_company;

      //会社⇔部屋情報の解約
      m_relation_comroom.cancelByCompany(inObjCR, (err, retObj) => {
        if (err) { next(err) }

        let inObjCC = {};
        inObjCC.id_company = id_company;
        inObjCC.ymd_end = ymd_kaiyaku;
        inObjCC.ymd_upd = tool.getToday();
        inObjCC.id_upd = req.user.id;

        //入居番号⇔キャビネットの解約
        m_relation_comcabi.cancelByCompany(inObjCC, (err, retObj) => {
          // m_relation_nyucabi.cancelByNyukyo(inObjNC, (err, retObj) => {
          if (err) { next(err) }
          res.redirect('/');
        });

      });
    });
  });
});

// 会社⇔部屋情報の追加
router.post('/addroom', security.authorize(), function (req, res, next) {

  const id_company = req.body.id_company;

  if (req.body.id_room !== '') {
    let relation_comroom = {};
    relation_comroom.id_company = id_company;
    relation_comroom.id_room = req.body.id_room;
    relation_comroom.ymd_start = tool.getToday();
    relation_comroom.ymd_upd = tool.getToday();
    relation_comroom.id_upd = req.user.id;
    m_relation_comroom.insert(relation_comroom, (err, retObj) => {
      if (err) { next(err); };
      res.redirect('/company/' + id_company);
    });
  } else {
    res.redirect('/company/' + id_company);
  }
});

// 会社⇔部屋情報の削除
router.get('/deleteroom/:id_company/:id_room/:no_seq', security.authorize(), function (req, res, next) {

  let relation_comroom = {};
  relation_comroom.id_company = req.params.id_company;
  relation_comroom.id_room = req.params.id_room;
  relation_comroom.no_seq = req.params.no_seq;
  relation_comroom.ymd_end = tool.getToday();
  relation_comroom.ymd_upd = tool.getToday();
  relation_comroom.id_upd = req.user.id;
  m_relation_comroom.remove(relation_comroom, (err, retObj) => {
    if (err) { next(err); };
    res.redirect('/company/' + req.params.id_company);
  });
});

// 会社⇔キャビネットの追加
router.post('/addcabinet', security.authorize(), function (req, res, next) {

  const id_company = req.body.id_company;

  if (req.body.id_cabinet !== '') {
    let relation_comcabi = {};
    relation_comcabi.id_company = id_company;
    relation_comcabi.id_cabinet = req.body.id_cabinet;
    relation_comcabi.ymd_start = tool.getToday();
    relation_comcabi.ymd_upd = tool.getToday();
    relation_comcabi.id_upd = req.user.id;
    m_relation_comcabi.insert(relation_comcabi, (err, retObj) => {
      if (err) { next(err) };
      res.redirect('/company/' + id_company);
    });
  } else {
    res.redirect('/company/' + id_company);
  }
});

// 会社⇔キャビネットの削除
router.get('/deletecabinet/:id_company/:id_cabinet/:no_seq', security.authorize(), function (req, res, next) {
  let relation_comcabi = {};
  relation_comcabi.id_company = req.params.id_company;
  relation_comcabi.id_cabinet = req.params.id_cabinet;
  relation_comcabi.no_seq = req.params.no_seq;
  relation_comcabi.ymd_end = tool.getToday();
  relation_comcabi.ymd_upd = tool.getToday();
  relation_comcabi.id_upd = req.user.id;
  m_relation_comcabi.remove(relation_comcabi, (err, retObj) => {
    if (err) { next(err) };
    res.redirect('/company/' + req.params.id_company);
  });
});

// 会社⇔駐輪場情報の追加
router.post('/addbicycle', security.authorize(), function (req, res, next) {

  const id_company = req.body.id_company;

  if (req.body.id_bicycle !== '') {
    let relation_combicycle = {};
    relation_combicycle.id_company = id_company;
    relation_combicycle.id_bicycle = req.body.id_bicycle;
    relation_combicycle.ymd_start = tool.getToday();
    relation_combicycle.ymd_upd = tool.getToday();
    relation_combicycle.id_upd = req.user.id;
    m_relation_combicycle.insert(relation_combicycle, (err, retObj) => {
      if (err) { next(err); };
      res.redirect('/company/' + id_company);
    })
  } else {
    res.redirect('/company/' + id_company);
  }

});

// 会社⇔駐輪場情報の削除
router.get('/deletebicycle/:id_company/:id_bicycle/:no_seq', security.authorize(), function (req, res, next) {
  let relation_combicycle = {};
  relation_combicycle.id_company = req.params.id_company;
  relation_combicycle.id_bicycle = req.params.id_bicycle;
  relation_combicycle.no_seq = req.params.no_seq;
  relation_combicycle.ymd_end = tool.getToday();
  relation_combicycle.ymd_upd = tool.getToday();
  relation_combicycle.id_upd = req.user.id;
  m_relation_combicycle.remove(relation_combicycle, (err, retObj) => {
    if (err) { next(err); };
    res.redirect('/company/' + req.params.id_company);
  });
});

// 会社⇔駐車場情報の追加
router.post('/addcar', security.authorize(), function (req, res, next) {

  const id_company = req.body.id_company;

  if (req.body.id_car !== '') {
    let relation_comcar = {};
    relation_comcar.id_company = id_company;
    relation_comcar.id_car = req.body.id_car;
    relation_comcar.ymd_start = tool.getToday();
    relation_comcar.ymd_upd = tool.getToday();
    relation_comcar.id_upd = req.user.id;
    m_relation_comcar.insert(relation_comcar, (err, retObj) => {
      if (err) { next(err); };
      res.redirect('/company/' + id_company);
    })
  } else {
    res.redirect('/company/' + id_company);
  }
});

// 会社⇔駐車場情報の削除
router.get('/deletecar/:id_company/:id_car/:no_seq', security.authorize(), function (req, res, next) {
  let relation_comcar = {};
  relation_comcar.id_company = req.params.id_company;
  relation_comcar.id_car = req.params.id_car;
  relation_comcar.no_seq = req.params.no_seq;
  relation_comcar.ymd_end = tool.getToday();
  relation_comcar.ymd_upd = tool.getToday();
  relation_comcar.id_upd = req.user.id;
  m_relation_comcar.remove(relation_comcar, (err, retObj) => {
    if (err) { next(err); };
    res.redirect('/company/' + req.params.id_company);
  });
});

function validateData(body) {

  let isValidated = true;
  let errors = {};

  if (!body.id_nyukyo) {
    isValidated = false;
    errors.id_nyukyo = "入居番号を選択してください。";
  }
  if (!body.kubun_company) {
    isValidated = false;
    errors.kubun_company = "会社区分が未入力です。";
  }
  if (!body.name) {
    isValidated = false;
    errors.name = "会社名が未入力です。";
  } else {
    if (body.name.length > 100) {
      isValidated = false;
      errors.name = "会社名は100桁以下で入力してください。";
    }
  }
  if (body.name_other) {
    if (body.name_other.length > 100) {
      isValidated = false;
      errors.name_other = "会社名（別名）は100桁以下で入力してください。";
    }
  }
  if (body.id_kaigi) {
    if (body.id_kaigi.length > 5) {
      isValidated = false;
      errors.id_kaigi = "会議室IDは5桁以下で入力してください。";
    }
  }
  if (body.kana) {
    if (body.kana.length > 100) {
      isValidated = false;
      errors.kana = "カナは100桁以下で入力してください。";
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

function getCompanyData(body) {
  let inObj = {};
  inObj.id = body.id;
  inObj.id_nyukyo = body.id_nyukyo;
  inObj.id_kaigi = body.id_kaigi;
  inObj.kubun_company = body.kubun_company;
  inObj.name = body.name;
  inObj.name_other = body.name_other;
  inObj.kana = body.kana;
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
