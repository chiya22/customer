var connection = require('../db/mysqlconfig.js');
const tool = require('../util/tool');

const findPKey = function (pkey, callback) {
    (async function () {
        await connection.query('select * from rooms where id = "' + pkey + '" and ymd_end = "99991231" order by id asc', function (error, results, fields) {
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
        await connection.query('select * from rooms where ymd_end = "99991231" order by place asc, floor asc', function (error, results, fields) {
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
        const query = 'SELECT r.*,  c.name as companyname from rooms r left outer join relation_comroom re ON r.id = re.id_room AND r.ymd_end = "99991231" AND re.ymd_end = "99991231"  left outer join companies c ON re.id_company = c.id order BY r.place ASC, r.floor asc'
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
        const query = 'insert into rooms values (' + tool.returnvalue(inObj.id) + ',' + tool.returnvalue(inObj.place) + ',' + tool.returnvalue(inObj.floor) + ',' + tool.returnvalue(inObj.name) + ', "' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
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
        const query = 'update rooms set place = ' + tool.returnvalue(inObj.place) + ', floor = ' + tool.returnvalue(inObj.floor) + ', name = ' + tool.returnvalue(inObj.name) + ', ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = ' + tool.returnvalue(inObj.id) + ' and ymd_end = "99991231"';
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
        const query = 'delete from rooms where id = "' + pkey + '" and ymd_end = "99991231"';
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