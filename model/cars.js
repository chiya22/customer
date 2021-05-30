const tool = require('../util/tool');
const knex = require('../db/knex.js').connect();

const findPKey = async (id) => {
    try {
        const retObj = await knex.from("cars").where({ id: id })
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const find = async () => {
    try {
        const retObj = await knex.from("cars").orderBy("id", "asc")
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const findForAdmin = async () => {
    try {
        const query = 'SELECT b.*, re.ymd_start AS relation_ymd_start, re.ymd_end AS relation_ymd_end, c.name AS companyname FROM cars b LEFT OUTER JOIN relation_comcar re ON re.ymd_end = "99991231" AND b.id = re.id_car LEFT OUTER JOIN companies c ON re.id_company = c.id';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const insert = async (inObj) => {
    try {
        const query = 'insert into cars values (' + tool.returnvalue(inObj.id) + ',' + tool.returnvalue(inObj.name) + ',' + tool.returnvalue(inObj.bikou) + ', "' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const update = async (inObj) => {
    try {
        const query = 'update cars set name = ' + tool.returnvalue(inObj.name) + ', bikou = ' + tool.returnvalue(inObj.bikou) + ', ymd_start = "' + inObj.ymd_start + '", ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = ' + tool.returnvalue(inObj.id) + ' and ymd_end = "' + inObj.before_ymd_end + '"';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const remove = async (inObj) => {
    try {
        const query = 'delete from cars where id = "' + inObj.id + '"';
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