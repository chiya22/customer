const knex = require('../db/knex.js').connect();

const findPKey = async (inObj) => {
    try {
        const retObj = await knex.from("relation_comcabi").where({id_company: inObj.id_company,id_cabinet: inObj.id_cabinet,no_seq: inObj.no_seq});
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findByCompany = async (id_company) => {
    try {
        const query = 'select a.id_company, a.id_cabinet, a.no_seq, a.ymd_start, a.ymd_end, a.ymd_upd, a.id_upd, b.place, b.name from relation_comcabi AS a INNER JOIN cabinets AS b ON a.id_cabinet = b.id where a.id_company = "' + id_company + '" and b.ymd_end = "99991231" order by b.id asc'
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const find = async () => {
    try {
        const retObj = await knex.from("relation_comcabi").where({ ymd_end: "99991231" }).orderBy([{ column: "id_company", order: "asc" }, { column: "id_cabinet", order: "asc" }])
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findFree = async () => {
    try {
        const query = 'SELECT c.id, c.place, c.name, c.ymd_start, c.ymd_end FROM cabinets AS c WHERE c.ymd_end = "99991231" and NOT EXISTS ( SELECT * FROM relation_comcabi AS re WHERE c.id = re.id_cabinet and re.ymd_end = "99991231" ) order by c.id asc';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
}

const insert = async (inObj) => {
    try {
        const query = 'insert into relation_comcabi values ("' + inObj.id_company + '","' + inObj.id_cabinet + '", (select IFNULL(MAX(b.no_seq),0)+1 from relation_comcabi AS b WHERE b.id_company = "' + inObj.id_company + '" and b.id_cabinet = "' + inObj.id_cabinet + '") ,"' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const update = async (inObj) => {
    try {
        const query = 'update relation_comcabi set id_nyukyo = "' + inObj.id_company + '", id_cabinet = "' + inObj.id_cabinet + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and id_cabinet = "' + inObj.id_cabinet + '" and no_seq = ' + inObj.no_seq + ' and ymd_end = "99991231"';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const remove = async (inObj) => {
    try {
        const query = 'update relation_comcabi set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and id_cabinet = "' + inObj.id_cabinet + '" and no_seq = ' + inObj.no_seq + ' and ymd_end = "99991231"';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const cancelByCompany = async (inObj) => {
    try {
        const query = 'update relation_comcabi set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and ymd_end = "99991231"';
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
    insert,
    update,
    remove,
    cancelByCompany,
};