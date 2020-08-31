var express = require('express');
var router = express.Router();

const security = require('../util/security');
const tool = require('../util/tool');

const m_sq = require('../model/sq');
const m_outai = require('../model/outais');
const m_company = require('../model/company');
const connection = require('../db/mysqlconfig.js');


//応対履歴検索画面の初期表示
router.get('/', security.authorize(), function (req, res, next) {

  m_company.findForSelect((err, retObj) => {
    if (err) { next(err) };
    res.render('outais', {
      results: null,
      searchvalue: null,
      selectCompany: null,
      companies: retObj,
      page_current: 0,
      page_max: 0,
      count_all: 0,
      includecomplete: null,
    });
  });

});

const count_perpage = 20;

//検索文字列を指定して、応対履歴検索
router.post('/', security.authorize(), function (req, res, next) {

  const searchvalue = req.body.searchvalue;        //検索文字列
  const pagecount_current = req.body.page_current; //現在表示されているページ
  const page_action = req.body.pageaction;         //ページングアクション

  const id_company = req.body.id_company;
  const includecomplete = req.body.includecomplete;

  //ページングアクションにより、表示対象のページ数を確定する
  let pagecount_target;
  if (page_action === 'next') {
    pagecount_target = parseInt(pagecount_current) + 1;
  } else if (page_action === 'prev') {
    pagecount_target = parseInt(pagecount_current) - 1;
  } else {
    pagecount_target = 1;
  }
  //表示開始位置を確定する
  const offset = (pagecount_target - 1) * count_perpage;

  let query;
  let query2;
  if (id_company) {
    if (includecomplete) {
      query = 'select count(*) as count_all from outais where id_company = "' + id_company + '" and content like "%' + searchvalue + '%"'
      query2 = 'select o.*, u1.name as name_add, u2.name as name_upd, ifnull(c.name,"会社指定なし") as name_company from ( select * from outais where id_company = "' + id_company + '" and content like "%' + searchvalue + '%" ) as o left outer join users as u1 on o.id_add = u1.id left outer join users as u2 on o.id_upd = u2.id left outer join companies as c on o.id_company = c.id order by o.ymdhms_upd desc limit ' + count_perpage + ' offset ' + offset
    } else {
      query = 'select count(*) as count_all from outais where id_company = "' + id_company + '" and status != "完了" and content like "%' + searchvalue + '%"'
      query2 = 'select o.*, u1.name as name_add, u2.name as name_upd, ifnull(c.name,"会社指定なし") as name_company from ( select * from outais where id_company = "' + id_company + '" and status != "完了" and content like "%' + searchvalue + '%" ) as o left outer join users as u1 on o.id_add = u1.id left outer join users as u2 on o.id_upd = u2.id left outer join companies as c on o.id_company = c.id order by o.ymdhms_upd desc limit ' + count_perpage + ' offset ' + offset
    }
  } else {
    if (includecomplete) {
      query = 'select count(*) as count_all from outais where content like "%' + searchvalue + '%"'
      query2 = 'select o.*, u1.name as name_add, u2.name as name_upd, ifnull(c.name,"会社指定なし") as name_company from ( select * from outais where content like "%' + searchvalue + '%" ) as o left outer join users as u1 on o.id_add = u1.id left outer join users as u2 on o.id_upd = u2.id left outer join companies as c on o.id_company = c.id order by o.ymdhms_upd desc limit ' + count_perpage + ' offset ' + offset
    } else {
      query = 'select count(*) as count_all from outais where status != "完了" and content like "%' + searchvalue + '%"'
      query2 = 'select o.*, u1.name as name_add, u2.name as name_upd, ifnull(c.name,"会社指定なし") as name_company from ( select * from outais where status != "完了" and content like "%' + searchvalue + '%" ) as o left outer join users as u1 on o.id_add = u1.id left outer join users as u2 on o.id_upd = u2.id left outer join companies as c on o.id_company = c.id order by o.ymdhms_upd desc limit ' + count_perpage + ' offset ' + offset
    }
  }

  connection.query(query, function (error, results, fields) {
    if (error) { next(error) };
    let count_all;
    count_all = results[0].count_all;
    let pagecount_max = parseInt(count_all / count_perpage);
    if ((count_all % count_perpage) > 0) {
      pagecount_max += 1;
    }
    connection.query(query2, function (error, results, fields) {
      if (error) { next(error) };
      let outais = results;
      let companies;
      m_company.findForSelect((err, retObj) => {
        if (error) { next(error) };
        companies = retObj;
        if (id_company) {
          let inObjC = {};
          inObjC.id = id_company;
          m_company.findPKey(inObjC, (err, retObj) => {
            if (error) { next(error) };
            res.render('outais', {
              results: outais,
              searchvalue: searchvalue,
              selectCompany: retObj,
              companies: companies,
              page_current: pagecount_target,
              page_max: pagecount_max,
              count_all: count_all,
              includecomplete: includecomplete,
            });
          });
        } else {
          res.render('outais', {
            results: outais,
            searchvalue: searchvalue,
            selectCompany: null,
            companies: companies,
            page_current: pagecount_target,
            page_max: pagecount_max,
            count_all: count_all,
            includecomplete: includecomplete,
          });
        }
      });
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
});

// 応対履歴情報の登録
router.post('/insert', security.authorize(), function (req, res, next) {

  let inObj = getRirekiData(req.body);
  inObj.ymdhms_add = tool.getTodayTime();
  inObj.ymdhms_upd = tool.getTodayTime();
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

      m_company.findPKey(inObjC, (err, retObj) => {
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
      res.redirect('/outai');
    });
  });
});

//応対履歴情報の更新
router.post('/update', security.authorize(), function (req, res, next) {
  let inObj = getRirekiData(req.body);
  inObj.ymdhms_upd = tool.getTodayTime();
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
      res.redirect('/outai');
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
  inObj.ymdhms_add = body.ymdhms_add;
  inObj.id_add = body.id_add;
  inObj.ymdhms_upd = body.ymdhms_upd;
  inObj.id_upd = body.id_upd;
  return inObj;
}

module.exports = router;
