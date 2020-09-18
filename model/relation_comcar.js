const knex = require("../db/knex.js");

const findPKey = function (inObj, callback) {
    (async function () {
        const client = knex.connect();
        await client.from("relation_comcar").where({
            id_company: inObj.id_company,
            id_car: inObj.id_car,
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
        const query ='select a.id_company, a.id_car, a.no_seq, a.ymd_start, a.ymd_end, a.ymd_upd, a.id_upd, b.id, b.name, b.ymd_start as car_ymd_start, b.ymd_end as car_ymd_end, b.ymd_upd as car_ymd_upd, b.id_upd as car_id_upd from relation_comcar AS a INNER JOIN cars AS b ON a.id_car = b.id where a.id_company = "' + id_company + '" and b.ymd_end = "99991231" order by b.id asc';
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
        await client.from("relation_comcar").where({ymd_end: "99991231"}).orderBy("id_company","asc")
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
        const query = 'SELECT b.id, b.name, b.ymd_start, b.ymd_end, b.ymd_upd, b.id_upd FROM cars AS b WHERE b.ymd_end = "99991231" and NOT EXISTS ( SELECT * FROM relation_comcar AS re WHERE b.id = re.id_car and re.ymd_end = "99991231" )'
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
        const query = 'insert into relation_comcar values ("' + inObj.id_company + '","' + inObj.id_car + '", (select IFNULL(MAX(b.no_seq),0)+1 from relation_comcar AS b WHERE b.id_company = "' + inObj.id_company + '" AND b.id_car = "' + inObj.id_car + '") ,"' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
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
        const query = 'update relation_comcar set id_company = "' + inObj.id_company + '", id_car = "' + inObj.id_car + ', ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and id_car = "' + inObj.id_car + '" and ymd_end = "99991231"';
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
        const query = 'update relation_comcar set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company+ '" and id_car = "' + inObj.id_car + '" and no_seq = ' + inObj.no_seq + ' and ymd_end = "99991231"';
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
        const query = 'update relation_comcar set ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id_company = "' + inObj.id_company + '" and ymd_end = "99991231"';
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
    insert,
    update,
    remove,
    cancelByCompany,
};