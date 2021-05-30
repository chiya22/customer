const knex = require('../db/knex.js').connect();

const findPKey = async (username) => {
    try {
        const retObj = await knex.from("users").where({id: username})
        return retObj;
    } catch(err) {
        throw err;
    }
};

const find = async () => {
    try {
        const retObj = await knex.from("users").orderBy("id","asc")
        return retObj;
    } catch(err) {
        throw err;
    }
};

const insert = async (inObj) => {
    try {
        const query = 'insert into users values ("' + inObj.id + '","' + inObj.name + '","' + inObj.pwd + '","' + inObj.role + '", "' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const update = async (inObj) => {
    try {
        const query = 'update users set name = "' + inObj.name + '", password = "' + inObj.password + '", role = "' + inObj.role + '", ymd_start = "' + inObj.ymd_start + '", ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_ymd + '" where id = "' + inObj.id + '" and ymd_end = "' + inObj.before_ymd_end + '"';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const remove = async (inObj) => {
    try {
        const query = 'delete from users where id = "' + inObj.id + '"';
        const retObj = await knex.raw(query)
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

module.exports = {
    find: find,
    findPKey: findPKey,
    insert: insert,
    update: update,
    remove: remove,
};