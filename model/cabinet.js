var connection = require('../db/mysqlconfig.js');
const tool = require('../util/tool');

const findPKey = function (pkey, callback) {
    (async function () {
        await connection.query('select * from cabinets where id = "' + pkey + '" and ymd_end = "99991231" order by id asc', function (error, results, fields) {
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
        await connection.query('select * from cabinets where ymd_end = "99991231" order by id asc', function (error, results, fields) {
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
        const query = 'select ca.*, re.id_company, c.name AS name_company from cabinets ca left outer join relation_comcabi re ON ca.id = re.id_cabinet AND re.ymd_end = "99991231" left outer join companies c ON  re.id_company = c.id ORDER BY ca.id ASC'
        await connection.query(query, function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
};

const findFree = function (callback) {
    (async function () {
        await connection.query('SELECT c.id, c.place, c.name FROM cabinets AS c WHERE c.ymd_end = "99991231" and NOT EXISTS ( SELECT * FROM nyukyos AS n WHERE n.ymd_end = "99991231" and c.id_nyukyo = n.id ) order by c.id asc', function (error, results, fields) {
            if (error) {
                callback(error, null);
            } else {
                callback(null, results);
            }
        });
    })();
}

const findByNyukyo = function (id_nyukyo, callback) {
    (async function () {
        await connection.query('select * from cabinets where ymd_end = "99991231" and id_nyukyo = ' + tool.returnvalue(id_nyukyo) + ' order by id asc', function (error, results, fields) {
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
        const query = 'insert into cabinets values (' + tool.returnvalue(inObj.id) + ',' + tool.returnvalue(inObj.place) + ',' + tool.returnvalue(inObj.name) + ', "' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
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
        const query = 'update cabinets set place = ' + tool.returnvalue(inObj.place) + ', name = ' + tool.returnvalue(inObj.name) + ', ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = ' + tool.returnvalue(inObj.id) + ' and ymd_end = "99991231"';
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
        const query = 'delete from cabinets where id = "' + pkey + '" and ymd_end ="99991231"';
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
    findFree,
    findPKey,
    findByNyukyo,
    insert,
    update,
    remove,
};