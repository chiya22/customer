const knex = require("../db/knex.js");

const findPKey = function (inObj, callback) {
    (async function () {
        const client = knex.connect();
        await client.from("relation_combicycle").where({
            id_company: inObj.id_company,
            id_bicycle: inObj.id_bicycle,
            no_seq: inObj.no_seq,
        })
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        })
    })();
};

const findByCompany = function (id_company, callback) {
    (async function () {
        const client = knex.connect();
        // const query ='select * from relation_comroom AS a INNER JOIN rooms AS b ON a.id_room = b.id where a.id_company = "' + id_company + '" and a.ymd_end = "99991231" and b.ymd_end = "99991231" order by b.id asc';
        const query ='select a.id_company, a.id_bicycle, a.no_seq, a.ymd_start, a.ymd_end, a.ymd_upd, a.id_upd, b.id, b.name, b.ymd_start as bicycle_ymd_start, b.ymd_end as bicycle_ymd_end, b.ymd_upd as bicycle_ymd_upd, b.id_upd as bicycle_id_upd from relation_combicycle AS a INNER JOIN bicycles AS b ON a.id_bicycle = b.id where a.id_company = "' + id_company + '" and b.ymd_end = "99991231" order by b.id asc';
        await client.raw(query)
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        })
    })();
};

const find = function (callback) {
    (async function () {
        const client = knex.connect();
        await client.from("relation_combicycle").where({ymd_end: "99991231"}).orderBy("id_company","asc")
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        })
    })();
};

const findFree = function (callback) {
    (async function () {
        const client = knex.connect();
        const query = 'SELECT b.id, b.name, b.ymd_start, b.ymd_end, b.ymd_upd, b.id_upd FROM bicycles AS b WHERE b.ymd_end = "99991231" and NOT EXISTS ( SELECT * FROM relation_combicycle AS re WHERE b.id = re.id_bicycle and re.ymd_end = "99991231" )'
        await client.raw(query)
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        })
    })();
}

const insert = function (inObj, callback) {
    (async function() {
        const client = knex.connect();
        const query = 'insert into relation_combicycle values ("' + inObj.id_company + '","' + inObj.id_bicycle + '", (select IFNULL(MAX(b.no_seq),0)+1 from relation_combicycle AS b WHERE b.id_company = "' + inObj.id_company + '" AND b.id_bicycle = "' + inObj.id_bicycle + '") ,"' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        await client.raw(query)
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        })
    })();
};

const update = function (inObj, callback) {
    (async function() {
        const client = knex.connect();
        const query = 'update relation_combicycle set id_company = "' + inObj.id_company + '", id_bicycle = "' + inObj.id_bicycle + ', ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and id_bicycle = "' + inObj.id_bicycle + '" and ymd_end = "99991231"';
        await client.raw(query)
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        })
    })();
};

const remove = function (inObj, callback) {
    (async function() {
        const client = knex.connect();
        const query = 'update relation_combicycle set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company+ '" and id_bicycle = "' + inObj.id_bicycle + '" and no_seq = ' + inObj.no_seq + ' and ymd_end = "99991231"';
        await client.raw(query)
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        })
    })();
};

const cancelByCompany = function (inObj, callback) {
    (async function() {
        const client = knex.connect();
        const query = 'update relation_combicycle set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and ymd_end = "99991231"';
        await client.raw(query)
        .then( (retObj) => {
            callback(null, retObj[0]);
        })
        .catch( (err) => {
            callback(err, null);
        })
    })();
};

module.exports = {
    find,
    findFree,
    findPKey,
    findByCompany,
    // findForSelect,
    insert,
    update,
    remove,
    cancelByCompany,
};