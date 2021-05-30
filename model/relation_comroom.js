const knex = require('../db/knex.js').connect();

const findPKey = async (inObj) => {
    try {
        const retObj = await knex.from("relation_comroom").where({id_company: inObj.id_company,id_room: inObj.id_room,no_seq: inObj.no_seq})
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findByCompany = async (id_company) => {
    try {
        const query = 'select a.id_company, a.id_room, a.no_seq, a.ymd_start, a.ymd_end, a.ymd_upd, a.id_upd, b.place, b.floor, b.person, b.name from relation_comroom AS a INNER JOIN rooms AS b ON a.id_room = b.id where a.id_company = "' + id_company + '" and b.ymd_end = "99991231" order by b.id asc';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const find = async () => {
    try {
        const retObj = await knex.from("relation_comroom").where({ ymd_end: "99991231" }).orderBy([{ column: "id_company", order: "asc" }, { column: "id_room", order: "asc" }])
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findFree = async () => {
    try {
        const query = 'SELECT r.id, r.place, r.floor, r.person, r.name FROM rooms AS r WHERE r.ymd_end = "99991231" and NOT EXISTS ( SELECT * FROM relation_comroom AS re WHERE r.id = re.id_room and re.ymd_end = "99991231" ) order by r.id asc';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
}

const findForSelect = async () => {
    try {
        const query = '(SELECT "【未使用】" as kubun, r.id, r.place, r.floor, r.person, r.name FROM rooms AS r WHERE r.ymd_end = "99991231" and NOT EXISTS ( SELECT * FROM relation_comroom AS re WHERE r.id = re.id_room and re.ymd_end = "99991231" )) UNION ALL (SELECT "【使用中】" as kubun, r.id, r.place, r.floor, r.person, r.name FROM rooms AS r WHERE r.ymd_end = "99991231" and EXISTS ( SELECT * FROM relation_comroom AS re WHERE r.id = re.id_room and re.ymd_end = "99991231" ))';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
}

const insert = async (inObj) => {
    try {
        const query = 'insert into relation_comroom values ("' + inObj.id_company + '","' + inObj.id_room + '", (select IFNULL(MAX(b.no_seq),0)+1 from relation_comroom AS b WHERE b.id_company = "' + inObj.id_company + '" AND b.id_room = "' + inObj.id_room + '") ,"' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const update = async (inObj) => {
    try {
        const query = 'update relation_comroom set id_company = "' + inObj.id_company + '", id_room = "' + inObj.id_room + ', ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and id_room = "' + inObj.id_room + '" and ymd_end = "99991231"';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const remove = async (inObj) => {
    try {
        const query = 'update relation_comroom set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and id_room = "' + inObj.id_room + '" and no_seq = ' + inObj.no_seq + ' and ymd_end = "99991231"';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const cancelByCompany = async (inObj) => {
    try {
        const query = 'update relation_comroom set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and ymd_end = "99991231"';
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