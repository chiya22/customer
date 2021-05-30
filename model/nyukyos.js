const knex = require('../db/knex').connect();

const findPKey = async (id) => {
    try {
        const retObj = await  knex.from("nyukyos").where({id:id})
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const find = async () => {
    try {
        const retObj = await  knex.from("nyukyos").orderBy("id","asc")
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const findForAdmin = async () => {
    try {
        const query = 'SELECT n.*, c.id as id_company, c.name AS name_company from nyukyos n left outer JOIN companies c ON n.id = c.id_nyukyo AND c.ymd_kaiyaku = "99991231" order by id asc';
        const retObj = await  knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const findForSelect = async () => {
    try {
        const query = 'SELECT n.id AS id, n.ymd_start AS ymd_start, n.ymd_end AS ymd_end, n.ymd_upd AS ymd_upd, n.id_upd AS id_upd, max(c.ymd_kaiyaku) AS ymd_kaiyaku FROM nyukyos AS n LEFT OUTER JOIN companies c ON n.id = c.id_nyukyo AND n.ymd_end = "99991231" AND c.ymd_end = "99991231" GROUP BY n.id ORDER BY ymd_kaiyaku ASC, id asc';
        const retObj = await  knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const insert = async (inObj) => {
    try {
        const query = 'insert into nyukyos values ("' + inObj.id + '","' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        const retObj = await  knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const update = async (inObj) => {
    try {
        const query = 'update nyukyos set ymd_start = "' + inObj.ymd_start + '", ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = "' + inObj.id + '" and ymd_end = "' + inObj.before_ymd_end + '"';
        const retObj = await  knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const remove = async (inObj) => {
    try {
        const query = 'delete from nyukyos where id = "' + inObj.id + '"';
        const retObj = await  knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const findWithRoom = async () => {
    try {
        const query = 'SELECT c.id_nyukyo , IFNULL(CONCAT(r.place, "_", r.floor, "_", r.name),"ON") AS name_room FROM companies c LEFT OUTER JOIN relation_comroom cr ON c.id = cr.id_company AND cr.ymd_end = "99991231" LEFT OUTER JOIN rooms r ON cr.id_room = r.id AND r.ymd_end = "99991231" WHERE c.ymd_kaiyaku = "99991231" ORDER BY c.id_nyukyo asc'
        const retObj = await  knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }    
}

module.exports = {
    find,
    findPKey,
    findForAdmin,
    findForSelect,
    insert,
    update,
    remove,
    findWithRoom,
};