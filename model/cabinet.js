const tool = require('../util/tool');
const knex = require('../db/knex.js').connect();

const findPKey = async (id) => {
    try {
        const retObj = await knex.from("cabinets").where({id: id});
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const find = async () => {
    try {
        const retObj = await knex.from("cabinets").orderBy("id","asc")
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const findForAdmin = async () => {
    try {
        const query = 'select ca.*, re.id_company, c.name AS name_company from cabinets ca left outer join relation_comcabi re ON ca.id = re.id_cabinet AND re.ymd_end = "99991231" left outer join companies c ON  re.id_company = c.id ORDER BY ca.id ASC'
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const findFree = async () => {
    try {
        const query = 'SELECT c.id, c.place, c.name FROM cabinets AS c WHERE c.ymd_end = "99991231" and NOT EXISTS ( SELECT * FROM nyukyos AS n WHERE n.ymd_end = "99991231" and c.id_nyukyo = n.id ) order by c.id asc';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }    
}

const findByNyukyo = async (id_nyukyo) => {
    try {
        const query = 'select * from cabinets where ymd_end = "99991231" and id_nyukyo = ' + tool.returnvalue(id_nyukyo) + ' order by id asc';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const insert = async (inObj) => {
    try {
        const query = 'insert into cabinets values (' + tool.returnvalue(inObj.id) + ',' + tool.returnvalue(inObj.place) + ',' + tool.returnvalue(inObj.name) + ', "' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const update = async (inObj) => {
    try {
        const query = 'update cabinets set place = ' + tool.returnvalue(inObj.place) + ', name = ' + tool.returnvalue(inObj.name) + ', ymd_start = "' + inObj.ymd_start + '", ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = ' + tool.returnvalue(inObj.id) + ' and ymd_end = "' + inObj.before_ymd_end + '"';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const remove = async (inObj) => {
    try {
        const query = 'delete from cabinets where id = "' + inObj.id + '"';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

module.exports = {
    find,
    findForAdmin,
    findFree,
    findPKey,
    findByNyukyo,
    insert,
    update,
    remove,
};