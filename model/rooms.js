const tool = require('../util/tool');
const knex = require('../db/knex.js').connect();

const findPKey = async (id) => {
    try {
        const retObj = await knex.from("rooms").where({ id: id })
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const find = async () => {
    try {
        const retObj = await knex.from("rooms").orderBy([{ column: "place", order: "asc" }, { column: "floor", order: "asc" }])
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findForAdmin = async () => {
    try {
        const query = 'SELECT r.*,  c.name as companyname from rooms r left outer join relation_comroom re ON r.id = re.id_room AND r.ymd_end = "99991231" AND re.ymd_end = "99991231"  left outer join companies c ON re.id_company = c.id order BY r.place ASC, r.floor asc'
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const insert = async (inObj) => {
    try {
        const query = 'insert into rooms values (' + tool.returnvalue(inObj.id) + ',' + tool.returnvalue(inObj.place) + ',' + tool.returnvalue(inObj.floor) + ',' + tool.returnvalue(inObj.person) + ',' + tool.returnvalue(inObj.name) + ', "' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const update = async (inObj) => {
    try {
        const query = 'update rooms set place = ' + tool.returnvalue(inObj.place) + ', floor = ' + tool.returnvalue(inObj.floor) + ', person = ' + inObj.person + ', name = ' + tool.returnvalue(inObj.name) + ', ymd_start = "' + inObj.ymd_start + '", ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where id = ' + tool.returnvalue(inObj.id) + ' and ymd_end = "' + inObj.before_ymd_end + '"';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const remove = async (inObj) => {
    try {
        const query = 'delete from rooms where id = "' + inObj.id + '"';
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