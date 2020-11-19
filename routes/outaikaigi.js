var express = require('express');
var router = express.Router();

const security = require('../util/security');
const tool = require('../util/tool');

const m_sq = require('../model/sq');
const m_outai = require('../model/outaiskaigi');
const m_riyousha = require('../model/riyousha');

//応対履歴（会議室）検索画面の初期表示
router.get('/', security.authorize(), function (req, res, next) {

  m_riyousha.findForSelect((err, retObj) => {
    if (err) { next(err) };
    res.render('outaiskaigi', {
      results: null,
      searchvalue: null,
      selectRiyousha: null,
      riyoushas: retObj,
      page_current: 0,
      page_max: 0,
      count_all: 0,
      includecomplete: null,
    });
  });
});

const count_perpage = 20;

//検索文字列を指定して、応対履歴（会議室）検索
router.post('/', security.authorize(), function (req, res, next) {

  const searchvalue = req.body.searchvalue;        //検索文字列
  const pagecount_current = req.body.page_current; //現在表示されているページ
  const page_action = req.body.pageaction;         //ページングアクション

  const id_riyousha = req.body.id_riyousha;
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
  if (id_riyousha) {
    if (includecomplete) {
      query = 'select COUNT(*) as count_all FROM ( SELECT o.*,r.name as name_riyousha FROM outaiskaigi o left outer JOIN riyoushas r ON o.id_riyousha = r.id ) oru WHERE oru.id_riyousha = "' + id_riyousha + '" and (oru.content LIKE "%' + searchvalue + '%" OR oru.name_riyousha LIKE "%' + searchvalue + '%" )'
      query2 = 'select * from(SELECT o.*,ua.name AS name_add, uu.name AS name_upd, ifnull(r.name, "利用者指定なし") as name_riyousha FROM outaiskaigi o left outer JOIN riyoushas r ON o.id_riyousha = r.id LEFT OUTER JOIN users ua ON ua.id = o.id_add LEFT OUTER JOIN users uu ON uu.id = o.id_upd) oru WHERE oru.id_riyousha = "' + id_riyousha + '" AND ( oru.content LIKE "%' + searchvalue + '%" OR oru.name_riyousha LIKE "%' + searchvalue + '%") ORDER BY oru.ymdhms_upd desc limit ' + count_perpage + ' offset ' + offset
    } else {
      query = 'select COUNT(*) as count_all FROM ( SELECT o.*,r.name as name_riyousha FROM outaiskaigi o left outer JOIN riyoushas r ON o.id_riyousha = r.id ) oru WHERE oru.id_riyousha = "' + id_riyousha + '" and oru.status != "完了" and (oru.content LIKE "%' + searchvalue + '%" OR oru.name_riyousha LIKE "%' + searchvalue + '%" )'
      query2 = 'select * from(SELECT o.*,ua.name AS name_add, uu.name AS name_upd, ifnull(r.name, "利用者指定なし") as name_riyousha FROM outaiskaigi o left outer JOIN riyoushas r ON o.id_riyousha = r.id LEFT OUTER JOIN users ua ON ua.id = o.id_add LEFT OUTER JOIN users uu ON uu.id = o.id_upd) oru WHERE oru.id_riyousha = "' + id_riyousha + '" AND oru.status != "完了" AND ( oru.content LIKE "%' + searchvalue + '%" OR oru.name_riyousha LIKE "%' + searchvalue + '%") ORDER BY oru.ymdhms_upd desc limit ' + count_perpage + ' offset ' + offset
    }
  } else {
    if (includecomplete) {
      query = 'select COUNT(*) as count_all FROM ( SELECT o.*,r.name as name_riyousha FROM outaiskaigi o left outer JOIN riyoushas r ON o.id_riyousha = r.id ) oru WHERE (oru.content LIKE "%' + searchvalue + '%" OR oru.name_riyousha LIKE "%' + searchvalue + '%" )'
      query2 = 'select * from(SELECT o.*,ua.name AS name_add, uu.name AS name_upd, ifnull(r.name, "利用者指定なし") as name_riyousha FROM outaiskaigi o left outer JOIN riyoushas r ON o.id_riyousha = r.id LEFT OUTER JOIN users ua ON ua.id = o.id_add LEFT OUTER JOIN users uu ON uu.id = o.id_upd) oru WHERE ( oru.content LIKE "%' + searchvalue + '%" OR oru.name_riyousha LIKE "%' + searchvalue + '%") ORDER BY oru.ymdhms_upd desc limit ' + count_perpage + ' offset ' + offset
    } else {
      query = 'select COUNT(*) as count_all FROM ( SELECT o.*,r.name as name_riyousha FROM outaiskaigi o left outer JOIN riyoushas r ON o.id_riyousha = r.id ) oru WHERE oru.status != "完了" and (oru.content LIKE "%' + searchvalue + '%" OR oru.name_riyousha LIKE "%' + searchvalue + '%" )'
      query2 = 'select * from(SELECT o.*,ua.name AS name_add, uu.name AS name_upd, ifnull(r.name, "利用者指定なし") as name_riyousha FROM outaiskaigi o left outer JOIN riyoushas r ON o.id_riyousha = r.id LEFT OUTER JOIN users ua ON ua.id = o.id_add LEFT OUTER JOIN users uu ON uu.id = o.id_upd) oru WHERE oru.status != "完了" AND ( oru.content LIKE "%' + searchvalue + '%" OR oru.name_riyousha LIKE "%' + searchvalue + '%") ORDER BY oru.ymdhms_upd desc limit ' + count_perpage + ' offset ' + offset
    }
  }

  m_outai.selectSQL(query, (err, retObj) => {
    if (err) { next(err) };
    let count_all;
    count_all = retObj[0].count_all;
    let pagecount_max = parseInt(count_all / count_perpage);
    if ((count_all % count_perpage) > 0) {
      pagecount_max += 1;
    }
    m_outai.selectSQL(query2, (err, retObj) => {
      if (err) { next(err) };
      let outais = retObj;
      let riyoushas;
      m_riyousha.findForSelect((err, retObj) => {
        if (err) { next(err) };
        riyoushas = retObj;
        if (id_riyousha) {
          let inObjR = {};
          inObjR.id = id_riyousha;
          m_riyousha.findPKey(inObjR, (err, retObj) => {
            if (err) { next(err) };
            res.render('outaiskaigi', {
              results: outais,
              searchvalue: searchvalue,
              selectRiyousha: retObj,
              riyoushas: riyoushas,
              page_current: pagecount_target,
              page_max: pagecount_max,
              count_all: count_all,
              includecomplete: includecomplete,
            });
          });
        } else {
          res.render('outaiskaigi', {
            results: outais,
            searchvalue: searchvalue,
            selectRiyousha: null,
            riyoushas: riyoushas,
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

    if (outai.id_riyousha) {
      let inObjR = {};
      inObjR.id = outai.id_riyousha;
      m_riyousha.findPKey(inObjR, (err, retObj) => {
        if (err) { next(err) };
        res.render('outaikaigi', {
          outaikaigi: outai,
          selectRiyousha: retObj,
          errors: null,
        });
      });
    } else {
      res.render('outaikaigi', {
        outaikaigi: outai,
        selectRiyousha: null,
        errors: null,
      });
    }
  });
});

//応対履歴情報表示から「更新」ボタンで応対履歴を更新するフォームへ
router.get('/update/:id_outai', security.authorize(), function (req, res, next) {

  let outai = {};
  let riyoushas = {};

  let inObj = {};
  inObj.id = req.params.id_outai;
  m_outai.findPKey(inObj, (err, retObj) => {
    if (err) { next(err) };
    outai = retObj;

    m_riyousha.findForSelect((err, retObj) => {
      if (err) { next(err) };
      riyoushas = retObj;

      if (outai.id_riyousha) {
        let inObjR = {};
        inObjR.id = outai.id_riyousha;
        m_riyousha.findPKey(inObjR, (err, retObj) => {
          if (err) { next(err) };
          res.render('outaikaigiform', {
            outaikaigi: outai,
            riyoushas: riyoushas,
            selectRiyousha: retObj,
            mode: 'update',
            errors: null,
          });
        });
      } else {
        res.render('outaikaigiform', {
          outaikaigi: outai,
          riyoushas: riyoushas,
          selectRiyousha: null,
          mode: 'update',
          errors: null,
        });
      };
    });
  });
});

//会社IDをもとに応対履歴を追加するフォームへ
router.get('/insert/:id_riyousha', security.authorize(), function (req, res, next) {

  let riyousha = {};

  let inObj = {};
  inObj.id = req.params.id_riyousha;

  m_riyousha.findPKey(inObj, (err, retObj) => {
    if (err) { next(err) };
    riyousha= retObj;

    m_riyousha.findForSelect((err, retObj) => {
      if (err) { next(err) };
      res.render('outaikaigiform', {
        outaikaigi: null,
        riyoushas: retObj,
        selectRiyousha: riyousha,
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

  //利用者情報
  let riyousha = {};
  let inObjR = {};
  inObjR.id = inObj.id_riyousha;

  //入力チェック
  errors = validateData(req.body);

  if (errors) {

    //すでに会社を選択している場合
    if (inObj.id_riyousha) {

      m_riyousha.findPKey(inObjR, (err, retObj) => {
        if (err) { next(err) };
        riyousha = retObj;

        m_riyousha.findForSelect((err, retObj) => {
          if (err) { next(err) };
          res.render('outaikaigiform', {
            outai: inObj,
            riyoushas: retObj,
            selectRiyousha: riyousha,
            mode: 'insert',
            errors: errors,
          });
        });
      });

      //会社を選択していない場合
    } else {
      m_riyousha.findForSelect((err, retObj) => {
        if (err) { next(err) };
        res.render('outaikaigiform', {
          outaikaigi: inObj,
          riyoushas: retObj,
          selectRiyousha: null,
          mode: 'insert',
          errors: errors,
        });
      });
    }
    return;
  }

  //応対履歴IDの採番号
  m_sq.getSqOutaikaigi((err, retObj) => {
    if (err) { next(err); }
    inObj.id = 'O' + ('000000000' + retObj.no).slice(-9);
    m_outai.insert(inObj, (err, retObj) => {
      //個人のidは自動採番とするため、Duplicateエラーは考慮不要
      if (err) { next(err); }
      res.redirect('/outaikaigi');
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
    m_riyousha.findForSelect((err, retObj) => {
      if (err) { next(err) };
      res.render('outaikaigiform', {
        outaikaigi: inObj,
        riyoushas: retObj,
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
      m_riyousha.findForSelect((err, retObj) => {
        if (err) { next(err) };
        res.render('outaikaigiform', {
          outaikaigi: inObj,
          riyoushas: retObj,
          mode: 'update',
          errors: errors,
        });
      });
    } else {
      res.redirect('/outaikaigi');
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
  inObj.id_riyousha = body.id_riyousha;
  inObj.content = body.content;
  inObj.status = body.status;
  inObj.ymdhms_add = body.ymdhms_add;
  inObj.id_add = body.id_add;
  inObj.ymdhms_upd = body.ymdhms_upd;
  inObj.id_upd = body.id_upd;
  return inObj;
}

module.exports = router;
