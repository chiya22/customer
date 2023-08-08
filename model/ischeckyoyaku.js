const tool = require('../util/tool');
const knex = require('../db/knex.js').connect();

const findPKey = async (id) => {
    try {
        const retObj = await knex.from("ischeckyoyaku").where({ id_riyousha: id })
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const find = async () => {
    try {
        const retObj = await knex.from("ischeckyoyaku").orderBy([{ column: "id_riyousha", order: "asc" }])
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findAllWithName = async () => {
    try {
        const query = "select i.id_riyousha , r.name, i.ymd_add  from ischeckyoyaku i left outer join riyoushas r on i.id_riyousha = r.id order by i.id_riyousha;"
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
}

/**
 * 監視対象利用者の日付指定以降の予約情報を返却する
 * @param {*} yyyymmdd 日付
 * @returns 
 */
const findwithYoyaku = async (yyyymmdd) => {
    try {
        const query = "SELECT * FROM ischeckyoyaku a INNER JOIN yoyakus y ON a.id_riyousha = y.id_riyousha AND y.ymd_riyou >= '" + yyyymmdd + "';"
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const insert = async (id, ymd_add) => {
    try {
        const query = 'insert into ischeckyoyaku values ("' + id + '", "' + ymd_add + '")';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const remove = async (id) => {
    try {
        const query = 'delete from ischeckyoyaku where id_riyousha = "' + id + '"';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

module.exports = {
    find,
    findPKey,
    findwithYoyaku,
    findAllWithName,
    insert,
    remove,
};