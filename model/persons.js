const tool = require('../util/tool');
const knex = require('../db/knex').connect();

const findPKey = async (id, ymd_end) => {
    try {
        const retObj = await knex.from("persons").where({id: id,ymd_end: ymd_end});
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const find = async () => {
    try {
        const retObj = await knex.from("persons").where({ymd_end: "99991231"}).orderBy("id","asc")
        return retObj;
    } catch(err) {
        throw err;
    }
};

const findForDownload = async () => {
    try {
        const query = 'SELECT c.id_nyukyo, c.name AS name_company, c.kana as kana_company, p.name AS name_person, p.kana as kana_person, p.kubun_person, IFNULL(p.telno_mobile,"") AS telno_mobile FROM persons p left outer JOIN companies c ON p.id_company = c.id AND  c.ymd_kaiyaku = "99991231" WHERE p.ymd_kaiyaku = "99991231" ORDER BY c.kana, p.kana'
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findForDownloadOrderNyukyo = async () => {
    try {
        const query = 'SELECT c.id_nyukyo, c.name AS name_company, c.kana as kana_company, p.name AS name_person, p.kana as kana_person, p.kubun_person, IFNULL(p.telno_mobile,"") AS telno_mobile FROM persons p left outer JOIN companies c ON p.id_company = c.id AND  c.ymd_kaiyaku = "99991231" WHERE p.ymd_kaiyaku = "99991231" ORDER BY c.id_nyukyo, c.kana, p.kana'
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};


// 会社に所属している個人を抽出
const findByCompany = async (inObj) => {
    try {
        const retObj = await knex.from("persons").where({id_company: inObj.id_company,ymd_end: "99991231",}).orderBy("ymd_nyukyo","asc")
        return retObj;
    } catch(err) {
        throw err;
    }
};

const findLikeCount = async (likevalue) => {
    try {
        const query = 'select count(*) as count_all from persons where ((name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%")) and ymd_end = "99991231"';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findLikeForPaging = async (likevalue, percount, offset) => {
    try {
        const query = 'select * from persons where ((name like "%' + likevalue + '%") or (kana like "%' + likevalue + '%")) and ymd_end = "99991231" limit ' + percount + ' offset ' + offset + ' order by id asc';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const insert = async (inObj) => {
    try {
        const query = 'insert into persons values ("' + inObj.id + '",' + tool.returnvalue(inObj.id_company) + ',"' + inObj.kubun_person + '","' + inObj.name + '",' + tool.returnvalue(inObj.kana) + ',' + tool.returnvalue(inObj.telno) + ',' + tool.returnvalue(inObj.telno_mobile) + ',' + tool.returnvalue(inObj.email) + ',' + tool.returnvalue(inObj.no_yubin) + ',' + tool.returnvalue(inObj.todoufuken) + ',' + tool.returnvalue(inObj.address) + ',"' + inObj.ymd_nyukyo + '", "99991231","' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '",' + tool.returnvalue(inObj.bikou) + ')';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const update = async (inObj) => {
    try {
        const query = 'update persons set id_company = ' + tool.returnvalue(inObj.id_company) + ', kubun_person = "' + inObj.kubun_person + '", name = ' + tool.returnvalue(inObj.name) + ', kana = ' + tool.returnvalue(inObj.kana) + ', telno = ' + tool.returnvalue(inObj.telno) + ', telno_mobile = ' + tool.returnvalue(inObj.telno_mobile) + ', email = ' + tool.returnvalue(inObj.email) + ', no_yubin = ' + tool.returnvalue(inObj.no_yubin) + ', todoufuken = ' + tool.returnvalue(inObj.todoufuken) + ', address = ' + tool.returnvalue(inObj.address) + ', ymd_nyukyo = "' + inObj.ymd_nyukyo + '", ymd_kaiyaku = "' + inObj.ymd_kaiyaku + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '", bikou = ' + tool.returnvalue(inObj.bikou) + ' where id = ' + tool.returnvalue(inObj.id) + ' and ymd_end = "99991231"';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const remove = async (inObj) => {
    try {
        const query = 'update persons set ymd_kaiyaku = ' + tool.returnvalue(inObj.ymd_kaiyaku) + ', ymd_end = "' + inObj.ymd_end + '" where id = "' + inObj.id + '" and ymd_end = "99991231"';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const cancel = async (inObj) => {
    try {
        const query = 'update persons set ymd_kaiyaku = "' + inObj.ymd_kaiyaku + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = "' + inObj.id + '" and ymd_kaiyaku = "99991231" and ymd_end = "99991231"';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const cancelByCompany = async (inObj) => {
    try {
        const query = 'update persons set ymd_kaiyaku = "' + inObj.ymd_kaiyaku + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = ' + tool.returnvalue(inObj.id_company) + ' and ymd_kaiyaku = "99991231" and ymd_end = "99991231"';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

module.exports = {
    find,
    findForDownload,
    findForDownloadOrderNyukyo,
    findPKey,
    findByCompany,
    findLikeCount,
    findLikeForPaging,
    insert,
    update,
    remove,
    cancel,
    cancelByCompany,
};