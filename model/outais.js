const tool = require('../util/tool');
const knex = require('../db/knex').connect();


const findPKey = async (id) => {
    try {
        const query = 'select o.*, u1.name as name_add, u2.name as name_upd from (select * from outais where id = "' + id + '") as o left outer join users u1 on u1.id = o.id_add left outer join users u2 on u2.id = o.id_upd';
        const retObj = await knex.raw(query);
        return retObj[0][0];
    } catch(err) {
        throw err;
    }    
};

const find = async () => {
    try {
        const query = 'select o.*, u1.name as name_add, u2.name as name_upd from ( select * from outais order by ymdhms_add desc) as o left outer join users u1 on u1.id = o.id_add left outer join users u2 on u2.id = o.id_upd';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const findByCompany = async (inObj) => {
    try {
        const query = 'select o.*, u1.name as name_add, u2.name as name_upd from ( select * from outais where id_company = ' + tool.returnvalue(inObj.id_company) + ' order by ymdhms_add desc) as o left outer join users u1 on u1.id = o.id_add left outer join users u2 on u2.id = o.id_upd';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

const findLikeCount = async (likevalue) => {
    try {
        const query = 'select count(*) as count_all from outais where content like "%' + likevalue + '%"';
        const retObj = await knex.raw(query);
        return retObj[0].count_all;
    } catch(err) {
        throw err;
    }    
};

const findLikeForPaging = async (likevalue, percount, offset) => {
    try {
        const query = 'select * from outais where content like "%' + likevalue + '%" limit ' + percount + ' offset ' + offset + ' order by ymdhms_add desc';
        const retObj = await knex.raw(query);
        return retObj;
    } catch(err) {
        throw err;
    }    
};

const insert = async (inObj) => {
    try {
        const query = 'insert into outais values ("' + inObj.id + '",' + tool.returnvalue(inObj.id_company) + ',"' + inObj.content + '",' + tool.returnvalue(inObj.status) + ',"' + inObj.ymdhms_add + '","' + inObj.id_add + '","' + inObj.ymdhms_upd + '","' + inObj.id_upd + '")';
        const retObj = await knex.raw(query);
        return retObj;
    } catch(err) {
        throw err;
    }    
};

const update = async (inObj) => {
    try {
        const query = 'update outais set id_company = ' + tool.returnvalue(inObj.id_company) + ', content = "' + inObj.content + '", status = ' + tool.returnvalue(inObj.status) + ', ymdhms_upd = "' + inObj.ymdhms_upd + '", id_upd = "' + inObj.id_upd + '" where id = ' + tool.returnvalue(inObj.id);
        const retObj = await knex.raw(query);
        return retObj;
    } catch(err) {
        throw err;
    }    
};

const setSQL = async (sql) => {
    try {
        const retObj = await knex.raw(sql);
        return retObj[0];
    } catch(err) {
        throw err;
    }    
};

module.exports = {
    find,
    findPKey,
    findByCompany,
    findLikeCount,
    findLikeForPaging,
    insert,
    update,
    setSQL,
};