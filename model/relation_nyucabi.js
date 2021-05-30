const knex = require('../db/knex.js').connect();


const findPKey = async (inObj) => {
    try {
        const retObj = await knex.raw(query)
        await knex.from("relation_nyucabi").where({id_nyukyo: inObj.id_nyukyo,id_cabinet: inObj.id_cabinet,no_seq: inObj.no_seq,});
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findByNyukyo = async (id_nyukyo) => {
    try {
        const query = 'select a.id_nyukyo, a.id_cabinet, a.no_seq, a.ymd_start, a.ymd_end, a.ymd_upd, a.id_upd, b.place, b.name from relation_nyucabi AS a INNER JOIN cabinets AS b ON a.id_cabinet = b.id where a.id_nyukyo = "' + id_nyukyo + '" and b.ymd_end = "99991231" order by b.id asc'
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const find = async () => {
    try {
        const query = 'select a.id_nyukyo, a.id_cabinet, a.no_seq, a.ymd_start, a.ymd_end, a.ymd_upd, a.id_upd, b.place, b.name from relation_nyucabi AS a INNER JOIN cabinets AS b ON a.id_cabinet = b.id where a.id_nyukyo = "' + id_nyukyo + '" and b.ymd_end = "99991231" order by b.id asc'
        const retObj = await knex.from("relation_nyucabi").where({ ymd_end: "99991231" }).orderBy([{ column: "id_nyukyo", order: "asc" }, { column: "id_cabinet", order: "asc" }])
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findFree = async () => {
    try {
        const query = 'SELECT c.id, c.place, c.name, c.ymd_start, c.ymd_end FROM cabinets AS c WHERE c.ymd_end = "99991231" and NOT EXISTS ( SELECT * FROM relation_nyucabi AS re WHERE c.id = re.id_cabinet and re.ymd_end = "99991231" ) order by c.id asc';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
}

const insert = async (inObj) => {
    try {
        const query = 'insert into relation_nyucabi values ("' + inObj.id_nyukyo + '","' + inObj.id_cabinet + '", (select IFNULL(MAX(b.no_seq),0)+1 from relation_nyucabi AS b WHERE b.id_nyukyo = "' + inObj.id_nyukyo + '" and b.id_cabinet = "' + inObj.id_cabinet + '") ,"' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const update = async (inObj) => {
    try {
        const query = 'update relation_nyucabi set id_nyukyo = "' + inObj.id_nyukyo + '", id_cabinet = "' + inObj.id_cabinet + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_nyukyo = "' + inObj.id_nyukyo + '" and id_cabinet = "' + inObj.id_cabinet + '" and no_seq = ' + inObj.no_seq + ' and ymd_end = "99991231"';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const remove = async (inObj) => {
    try {
        const query = 'update relation_nyucabi set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_nyukyo = "' + inObj.id_nyukyo + '" and id_cabinet = "' + inObj.id_cabinet + '" and no_seq = ' + inObj.no_seq + ' and ymd_end = "99991231"';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const cancelByNyukyo = async (inObj) => {
    try {
        const query = 'update relation_nyucabi set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_nyukyo = "' + inObj.id_nyukyo + '" and ymd_end = "99991231"';
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
    findByNyukyo,
    insert,
    update,
    remove,
    cancelByNyukyo,
};