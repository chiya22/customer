const tool = require('../util/tool');
const knex = require('../db/knex.js').connect();

/**
 * 
 * @param {*} pkey 
 * @returns bicycle
 */
const findPKey = async (id) => {
    try {
        const retObj = await knex.from("bicycles").where({ id: id });
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

/**
 * 
 * @returns bicycle[] すべての駐輪場情報
 */
const find = async () => {
    try {
        const retObj = await knex.from("bicycles").orderBy("id", "asc")
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

/**
 * 管理画面用の駐輪場情報取得用
 * @returns retObj[] 駐輪場情報の全項目,「会社⇔駐輪場」の項目
 */
const findForAdmin = async () => {
    try {
        const query = 'SELECT b.*, re.ymd_start AS relation_ymd_start, re.ymd_end AS relation_ymd_end, c.name AS companyname FROM bicycles b LEFT OUTER JOIN relation_combicycle re ON re.ymd_end = "99991231" AND b.id = re.id_bicycle LEFT OUTER JOIN companies c ON re.id_company = c.id';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

/**
 * 
 * @param {*} inObj 
 * @returns SQL実行結果
 */
const insert = async (inObj) => {
    try {
        const query = 'INSERT INTO bicycles VALUES (' + tool.returnvalue(inObj.id) + ',' + tool.returnvalue(inObj.name) + ',' + tool.returnvalue(inObj.bikou) + ', "' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

/**
 * 
 * @param {*} inObj 
 * @returns SQL実行結果
 */
const update = async (inObj) => {
    try {
        const query = 'UPDATE bicycles SET name = ' + tool.returnvalue(inObj.name) + ', bikou = ' + tool.returnvalue(inObj.bikou) + ', ymd_start = "' + inObj.ymd_start + '", ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" WHERE id = ' + tool.returnvalue(inObj.id) + ' AND ymd_end = "' + inObj.before_ymd_end + '"';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

/**
 * 
 * @param {*} inObj 
 * @returns SQL実行結果
 */
const remove = async (inObj) => {
    try {
        const query = 'DELETE FROM bicycles WHERE id = "' + inObj.id + '"';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

module.exports = {
    find,
    findForAdmin,
    findPKey,
    insert,
    update,
    remove,
};