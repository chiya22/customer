const knex = require("../db/knex.js").connect();

const findAll = async () => {
    try {
        const retObj = await knex.from("perinfo").orderBy("yyyymm", "desc");
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const selectAll = async () => {
    try {
        const query = 'SELECT yyyymm, format(per_all_all,2) as per_all_all, format(per_all_weekday,2) as per_all_weekday, format(per_all_holiday,2) as per_all_holiday, format(per_45_all,2) as per_45_all, format(per_45_weekday,2) as per_45_weekday, format(per_45_holiday,2) as per_45_holiday, format(per_mtg_all,2) as per_mtg_all, format(per_mtg_weekday,2) as per_mtg_weekday, format(per_mtg_holiday,2) as per_mtg_holiday, format(per_prj_all,2) as per_prj_all, format(per_prj_weekday,2) as per_prj_weekday, format(per_prj_holiday,2) as per_prj_holiday, ymd_add FROM perinfo ORDER BY yyyymm desc'
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findPKey = async (inObj) => {
    try {
        const retObj = await knex.from("perinfo").where({ yyyymm: inObj.yyyymm });
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const insert = async (inObj) => {
    try {
        const query = 'insert into perinfo values ("' + inObj.yyyymm + '",' + inObj.per_all_all + ',' + inObj.per_all_weekday + ',' + inObj.per_all_holiday + ',' + inObj.per_45_all + ',' + inObj.per_45_weekday + ',' + inObj.per_45_holiday + ',' + inObj.per_mtg_all + ',' + inObj.per_mtg_weekday + ',' + inObj.per_mtg_holiday + ',' + inObj.per_prj_all + ',' + inObj.per_prj_weekday + ',' + inObj.per_prj_holiday + ',"' + inObj.ymd_add + '")';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const remove = async (inObj) => {
    try {
        const query = 'delete from perinfo where yyyymm = "' + inObj.yyyymm + '"';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

module.exports = {
    findAll,
    findPKey,
    selectAll,
    insert,
    remove,
};