const tool = require('../util/tool');
const knex = require("../db/knex.js").connect();

/**
 * 
 * @param {*} id 
 * @param {*} ymd_end 
 * @returns company キーに一致した会社情報1件
 */
const findPKey = async (id, ymd_end) => {
    try {
        const retObj = await knex.from("companies").where({ id: id, ymd_end: ymd_end })
        return retObj[0];
    } catch (err) {
        throw err;
    }
};

/**
 * 
 * @returns company[]　有効な会社情報すべて
 */
const find = async () => {
    try {
        const retObj = await knex.from("companies").where({ ymd_end: "99991231" }).orderBy("id", "asc");
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

/**
 * セレクトボックス用
 * @returns obj[] →　ymd_kaiyaku, id, kubun_company, id_nyukyo, name, ymd_nyukyo, ymd_kaiyaku
 */
const findForSelect = async () => {
    try {
        const query = 'SELECT  CASE ymd_kaiyaku WHEN "99991231" THEN "" ELSE "解約" END AS kaiyakuKubun, id, kubun_company, id_nyukyo, name, ymd_nyukyo, ymd_kaiyaku FROM  companies WHERE  ymd_end = "99991231" ORDER BY kaiyakuKubun asc, id_nyukyo asc'
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
}

/**
 * 
 * @param {*} id_nyukyo 
 * @returns company[] 入居番号に紐づいた有効な会社情報（終了年月日に日付が設定されていない対象）
 */
const findByNyukyo = async (id_nyukyo) => {
    try {
        return await knex.from('companies').where({ id_nyukyo: id_nyukyo, ymd_end: '99991231' }).orderBy("ymd_kaiyaku", "asc")
    } catch(err) {
        throw err;
    }
};

/**
 * 
 * @param {*} id_nyukyo 
 * @returns company[] 入居番号に紐づいた解約されていない会社情報
 */
const findByNyukyoWithoutKaiyaku = async (id_nyukyo) => {
    try {
        return await knex.from('companies').where({ id_nyukyo: id_nyukyo, ymd_kaiyaku: '99991231' }).orderBy("ymd_kaiyaku", "asc");
    } catch(err) {
        throw err;
    }
};

/**
 * 会社情報の「名前」「かな」に対して曖昧検索を行う
 * @param {*} likevalue 検索文字列
 * @returns company[] 「名前」「かな」に検索文字列が設定されている有効な会社情報
 */
const findLikeCount = async (likevalue)=> {
    try {
        const query = 'SELECT  count(*) AS count_all FROM  companies WHERE  ((name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%")) AND  ymd_end = "99991231"';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

/**
 * 
 * @param {*} likevalue 検索文字列
 * @param {*} percount 取得件数
 * @param {*} offset 一覧取得の開始位置
 * @returns company[] 「名前」「かな」に検索文字列が設定されている有効な会社情報で、指定された開始位置らから指定された件数分取得したもの
 */
const findLikeForPaging = async (likevalue, percount, offset) => {
    try {
        const query = 'SELECT  * FROM  companies WHERE  ((name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%")) AND  ymd_end = "99991231" LIMIT ' + percount + ' OFFSET ' + offset + ' OREDER BY id asc';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

/**
 * 
 * @param {*} inObj 登録用companyオブジェクト
 * @returns SQL実行結果
 */
const insert = async (inObj) => {
    try {
        const query = 'INSERT INTO companies VALUES ("' + inObj.id + '",' + tool.returnvalue(inObj.id_nyukyo) + ',' + tool.returnvalue(inObj.id_kaigi) + ',"' + inObj.kubun_company + '","' + inObj.name + '", "' + inObj.name_other + '", ' + tool.returnvalue(inObj.kana) + ',"' + inObj.ymd_nyukyo + '","99991231","' + inObj.ymd_start + '","99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '", ' + tool.returnvalue(inObj.bikou) + ')';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

/**
 * 
 * @param {*} inObj 更新用companyオブジェクト
 * @returns SQL実行結果
 */
const update = async (inObj) => {
    try {
        const query = 'UPDATE companies SET kubun_company = ' + tool.returnvalue(inObj.kubun_company) + ', id_nyukyo = ' + tool.returnvalue(inObj.id_nyukyo) + ', id_kaigi = ' + tool.returnvalue(inObj.id_kaigi) + ', name = ' + tool.returnvalue(inObj.name) + ', name_other = ' + tool.returnvalue(inObj.name_other) + ', kana = ' + tool.returnvalue(inObj.kana) + ', bikou = ' + tool.returnvalue(inObj.bikou) + ', ymd_nyukyo = "' + inObj.ymd_nyukyo + '", ymd_kaiyaku = "' + inObj.ymd_kaiyaku + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" WHERE  id = "' + inObj.id + '" AND  ymd_end = "99991231"';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

/**
 * 指定されたidの会社情報に対して、終了年月日と解約年月日を設定する
 * @param {*} inObj 削除用companyオブジェクト id, ymd_end, ymd_kaiyaku
 * @returns SQL実行結果
 */
const remove = async (inObj) => {
    try {
        const query = 'UPDATE companies SET ymd_end = "' + inObj.ymd_end + '", ymd_kaiyaku = "' + inObj.ymd_kaiyaku + '" WHERE  id = "' + inObj.id + '" AND  ymd_end ="99991231"';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

/**
 * 指定されたidの会社情報に対して、解約年月日と更新ID、更新年月日を設定する
 * @param {*} inObj 解約用companyオブジェクト id, id_upd, ymd_kaiyaku, ymd_upd
 * @returns SQL実行結果
 */
const cancel = async (inObj) => {
    try {
        const query = 'UPDATE companies SET ymd_kaiyaku = "' + inObj.ymd_kaiyaku + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" WHERE  id = ' + tool.returnvalue(inObj.id) + ' AND  ymd_end = "99991231"';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

/**
 * 表示パネル用の情報取得（会社区分が「その他」「市町村」は除く）
 * @returns 会社情報の一覧（会社名ふりがなの最初の1文字,会社名、会社名かな、入居者番号、入居年月日、解約年月日）
 */
const findForDispPanel = async () => {
    try {
        const query = 'SELECT LEFT(c.kana, 1) as line, c.name, c.kana, c.id_nyukyo, c.ymd_nyukyo, c.ymd_kaiyaku FROM companies c WHERE (c.kubun_company <> "その他" and c.kubun_company <> "市町村") AND c.ymd_kaiyaku = "99991231" order BY c.kana';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
}

/**
 * 渡されたSQLを実行する
 * @param {*} sql 
 * @returns SQL実行結果
 */
const setSQL = async (sql) => {
    try {
        const retObj = await knex.raw(sql)
        return retObj[0];
    } catch (e) {
        throw e;
    }
};

module.exports = {
    find,
    findPKey,
    findForSelect,
    findByNyukyo,
    findByNyukyoWithoutKaiyaku,
    findLikeCount,
    findLikeForPaging,
    findForDispPanel,
    insert,
    update,
    remove,
    cancel,
    setSQL,
};