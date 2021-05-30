const knex = require('../db/knex.js').connect();

const findPKey = async (inObj) => {
    try {
        const retObj = await knex.from("relation_combicycle").where({id_company: inObj.id_company,id_bicycle: inObj.id_bicycle,no_seq: inObj.no_seq})
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findByCompany = async (id_company) => {
    try {
        const query ='select a.id_company, a.id_bicycle, a.no_seq, a.ymd_start, a.ymd_end, a.ymd_upd, a.id_upd, b.id, b.name, b.ymd_start as bicycle_ymd_start, b.ymd_end as bicycle_ymd_end, b.ymd_upd as bicycle_ymd_upd, b.id_upd as bicycle_id_upd from relation_combicycle AS a INNER JOIN bicycles AS b ON a.id_bicycle = b.id where a.id_company = "' + id_company + '" and b.ymd_end = "99991231" order by b.id asc';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const find = async () => {
    try {
        const retObj = await knex.from("relation_combicycle").where({ymd_end: "99991231"}).orderBy("id_company","asc")
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findFree = async () => {
    try {
        const query = 'SELECT b.id, b.name, b.ymd_start, b.ymd_end, b.ymd_upd, b.id_upd FROM bicycles AS b WHERE b.ymd_end = "99991231" and NOT EXISTS ( SELECT * FROM relation_combicycle AS re WHERE b.id = re.id_bicycle and re.ymd_end = "99991231" )'
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
}

const insert = async (inObj) => {
    try {
        const query = 'insert into relation_combicycle values ("' + inObj.id_company + '","' + inObj.id_bicycle + '", (select IFNULL(MAX(b.no_seq),0)+1 from relation_combicycle AS b WHERE b.id_company = "' + inObj.id_company + '" AND b.id_bicycle = "' + inObj.id_bicycle + '") ,"' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const update = async (inObj) => {
    try {
        const query = 'update relation_combicycle set id_company = "' + inObj.id_company + '", id_bicycle = "' + inObj.id_bicycle + ', ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and id_bicycle = "' + inObj.id_bicycle + '" and ymd_end = "99991231"';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const remove = async (inObj) => {
    try {
        const query = 'update relation_combicycle set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company+ '" and id_bicycle = "' + inObj.id_bicycle + '" and no_seq = ' + inObj.no_seq + ' and ymd_end = "99991231"';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const cancelByCompany = async (inObj) => {
    try {
        const query = 'update relation_combicycle set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and ymd_end = "99991231"';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

module.exports = {
    find,
    findFree,
    findPKey,
    findByCompany,
    // findForSelect,
    insert,
    update,
    remove,
    cancelByCompany,
};