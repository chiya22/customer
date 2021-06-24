const tool = require('../util/tool');
const knex = require('../db/knex.js').connect();

const findPKey = async (telno, ymd_end) => {
    try {
        const retObj = await knex.from("telnos").where({ telno: telno }, { ymd_end: ymd_end })
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const find = async () => {
    try {
        const retObj = await knex.from("telnos").orderBy([{ column: "place", order: "desc" }, { column: "kubun", order: "desc" }, { column: "telno", order: "asc" }])
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const findForAdmin = async () => {
    try {
        const query = 'SELECT t.*,  c.name as companyname from telnos t left outer join relation_comtelno re ON t.telno = re.id_telno AND t.ymd_end = "99991231" AND re.ymd_end = "99991231"  left outer join companies c ON re.id_company = c.id order BY t.place DESC, t.kubun DESC, t.telno ASC'
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const insert = async (inObj) => {
    try {
        const query = 'insert into telnos values (' + tool.returnvalue(inObj.telno) + ',' + tool.returnvalue(inObj.kubun) + ',' + tool.returnvalue(inObj.place) + ',' + tool.returnvalue(inObj.bikou) + ',"' + inObj.ymd_start + '", "99991231", "' + inObj.ymd_upd + '", "' + inObj.id_upd + '")';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const update = async (inObj) => {
    try {
        const query = 'update telnos set kubun = ' + tool.returnvalue(inObj.kubun) + ', place = ' + tool.returnvalue(inObj.place) + ', bikou = ' + tool.returnvalue(inObj.bikou) + ', ymd_start = "' + inObj.ymd_start + '", ymd_end = "' + inObj.ymd_end + '", ymd_upd = "' + inObj.ymd_upd + '", id_upd = "' + inObj.id_upd + '" where telno = ' + tool.returnvalue(inObj.telno) + ' and ymd_end = "' + inObj.before_ymd_end + '"';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const remove = async (inObj) => {
    try {
        const query = 'delete from telnos where telno = "' + inObj.telno + '"';
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