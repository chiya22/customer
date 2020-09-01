var connection = require('../db/mysqlconfig.js');
const tool = require('../util/tool');

const findPKey = function (pkey, callback) {
    (async function () {
        await connection.query('select * from bicycles where id = "' + pkey + '" and ymd_end = "99991231" order by id asc', function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results[0]);
            }
        });
    })();
};

const find = function (callback) {
    (async function () {
        await connection.query('select * from bicycles where ymd_end = "99991231" order by id asc', function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const findForAdmin = function (callback) {
    (async function () {
        const query = 'SELECT b.*, re.ymd_start AS relation_ymd_start, re.ymd_end AS relation_ymd_end, c.name AS companyname FROM bicycles b LEFT OUTER JOIN relation_combicycle re ON re.ymd_end = "99991231" AND b.id = re.id_bicycle LEFT OUTER JOIN companies c ON re.id_company = c.id';
        await connection.query(query, function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const insert = function (inObj, callback) {
    (async function () {
        const query = 'insert into bicycles values (' + tool.returnvalue(inObj.id) + ',' + tool.returnvalue(inObj.name) + ', "' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        connection.query(query, function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const update = function (inObj, callback) {
    (async function () {
        const query = 'update bicycles set name = ' + tool.returnvalue(inObj.name) + ', ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = ' + tool.returnvalue(inObj.id) + ' and ymd_end = "99991231"';
        connection.query(query, function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const remove = function (pkey, callback) {
    (async function () {
        const query = 'delete from bicycles where id = "' + pkey + '" and ymd_end = "99991231"';
        connection.query(query, function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

module.exports = {
    find,
    findForAdmin,
    findPKey,
    insert,
    update,
    remove,
};