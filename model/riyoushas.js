const tool = require('../util/tool');
const knex = require('../db/knex.js').connect();

const findPKey = async (id) => {
    try {
        const retObj = await knex.from("riyoushas").where({ id: id })
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const find = async () => {
    try {
        const retObj = await knex.from("riyoushas").orderBy("id", "asc")
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findForSelect = async () => {
    try {
        const query = 'select id, kubun, name from riyoushas order by id asc'
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
}

const findLikeCount = async (likevalue) => {
    try {
        const query = 'select count(*) as count_all from riyoushas where ((id like "%' + likevalue + '%") or (name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%"))';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findLikeForPaging = async (likevalue, percount, offset) => {
    try {
        const query = 'select * from riyoushas where ((id like "%' + likevalue + '%") or (name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%")) limit ' + percount + ' offset ' + offset + ' order by id asc';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const insert = async (inObj) => {
    try {
        const query = 'insert into riyoushas values ("' + inObj.id + '","' + inObj.kubun + '","' + inObj.kubun2 + '","' + inObj.name + '",' + tool.returnvalue(inObj.kana) + ',' + tool.returnvalue(inObj.sex) + ',' + tool.returnvalue(inObj.no_yubin) + ',' + tool.returnvalue(inObj.address) + ',' + tool.returnvalue(inObj.no_tel) + ',' + tool.returnvalue(inObj.mail1) + ',' + tool.returnvalue(inObj.mail2) + ',' + tool.returnvalue(inObj.kubun_riyousha) + ',' + tool.returnvalue(inObj.kubun_vip) + ',' + tool.returnvalue(inObj.bikou) + ',' + tool.returnvalue(inObj.ymd_add) + ',' + tool.returnvalue(inObj.ymd_upd) + ')';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};


const update = async (inObj) => {
    try {
        const query = 'update riyoushas set kubun = ' + tool.returnvalue(inObj.kubun) + ', kubun2 = ' + tool.returnvalue(inObj.kubun2) + ', name = "' + inObj.name + '", kana = ' + tool.returnvalue(inObj.kana) + ', sex = ' + tool.returnvalue(inObj.sex) + ', no_yubin = ' + tool.returnvalue(inObj.no_yubin) + ', address = ' + tool.returnvalue(inObj.address) + ', no_tel = ' + tool.returnvalue(inObj.no_tel) + ', mail1 = ' + tool.returnvalue(inObj.mail1) + ', mail2 = ' + tool.returnvalue(inObj.mail2) + ', kubun_riyousha = ' + tool.returnvalue(inObj.kubun_riyousha) + ', kubun_vip = ' + tool.returnvalue(inObj.kubun_vip) + ', bikou = ' + tool.returnvalue(inObj.bikou) + ', ymd_add = "' + inObj.ymd_add + '", ymd_upd = "' + inObj.ymd_upd + '" where id = ' + tool.returnvalue(inObj.id) + '';
        const retObj = await knex.raw(query);
        return retObj[0];
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
}

module.exports = {
    find,
    findPKey,
    findForSelect,
    findLikeCount,
    findLikeForPaging,
    insert,
    update,
    setSQL,
};