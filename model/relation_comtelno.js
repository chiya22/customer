const tool = require('../util/tool');
const knex = require('../db/knex.js').connect();

const findPKey = async (inObj) => {
    try {
        const retObj = await knex.from("relation_comtelno").where({id_company: inObj.id_company,id_telno: inObj.id_telno,no_seq: inObj.no_seq})
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findByCompany = async (id_company) => {
    try {
        const query = 'select a.id_company, a.id_telno, a.no_seq, a.transfer_telno, a.ymd_start, a.ymd_end, a.ymd_upd, a.id_upd, b.place, b.kubun, b.telno, b.bikou from relation_comtelno AS a INNER JOIN telnos AS b ON a.id_telno = b.telno where a.id_company = "' + id_company + '" and b.ymd_end = "99991231" order by b.place desc, b.kubun desc, b.telno asc';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const find = async () => {
    try {
        const retObj = await knex.from("relation_comtelno").where({ ymd_end: "99991231" }).orderBy([{ column: "id_company", order: "asc" }, { column: "id_telno", order: "asc" }])
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findFree = async () => {
    try {
        const query = 'SELECT t.telno, t.kubun, t.place, t.bikou FROM telnos AS t WHERE t.ymd_end = "99991231" and NOT EXISTS ( SELECT * FROM relation_comtelno AS re WHERE t.telno = re.id_telno and re.ymd_end = "99991231" ) order by t.place desc, t.kubun desc, t.telno asc';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
}

const findForSelect = async () => {
    try {
        const query = '(SELECT "【未使用】" as kubun_name, t.telno, t.kubun, t.place, t.bikou FROM telnos AS t WHERE t.ymd_end = "99991231" and NOT EXISTS ( SELECT * FROM relation_comtelno AS re WHERE t.telno = re.id_telno and re.ymd_end = "99991231" )) UNION ALL (SELECT "【使用中】" as kubun_name, t.telno, t.kubun, t.place FROM telnos AS t WHERE t.ymd_end = "99991231" and EXISTS ( SELECT * FROM relation_comtelno AS re WHERE t.telno = re.id_telno and re.ymd_end = "99991231" ))';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
}

const insert = async (inObj) => {
    try {
        const query = 'insert into relation_comtelno values ("' + inObj.id_company + '","' + inObj.id_telno + '", (select IFNULL(MAX(b.no_seq),0)+1 from relation_comtelno AS b WHERE b.id_company = "' + inObj.id_company + '" AND b.id_telno = "' + inObj.id_telno + '") , ' + tool.returnvalue(inObj.transfer_telno) + ' , "' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const update = async (inObj) => {
    try {
        const query = 'update relation_comtelno set id_company = "' + inObj.id_company + '", id_telno = "' + inObj.id_telno + ', transfer_telno = ' + tool.returnvalue(inObj.transfer_telno) + ' , ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and id_telno = "' + inObj.id_telno + '" and ymd_end = "99991231"';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const remove = async (inObj) => {
    try {
        const query = 'update relation_comtelno set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and id_telno = "' + inObj.id_telno + '" and no_seq = ' + inObj.no_seq + ' and ymd_end = "99991231"';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const cancelByCompany = async (inObj) => {
    try {
        const query = 'update relation_comtelno set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and ymd_end = "99991231"';
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
    findForSelect,
    insert,
    update,
    remove,
    cancelByCompany,
};