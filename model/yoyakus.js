const tool = require('../util/tool');
const knex = require('../db/knex.js').connect();

const findPKey = async (id) => {
    try {
        const retObj = await knex.from("yoyakus").where({ id: id })
        return retObj[0];
    } catch(err) {
        throw err;
    }
};


const calcTime = async (inObj) => {
    try {
        const query = 'SELECT left(ymd_riyou,6) AS ymd, kubun_room, kubun_day AS kubun_day, sum(CAST(time_end AS SIGNED)-CAST(time_start AS SIGNED))/100 AS totaltime FROM yoyakus where left(ymd_riyou, 6) = "' + inObj.yyyymm + '" and id_riyousha <> "10001" and id_riyousha <> "00001" group BY left(ymd_riyou,6), kubun_room, kubun_day order by kubun_room, kubun_day'
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
}

const insert = async (inObj) => {
    try {
        const query = 'insert into yoyakus values ("' + inObj.id + '","' + inObj.ymd_add + '","' + inObj.ymd_riyou + '",' + tool.returnvalue(inObj.ymd_upd) + ',"' + inObj.nm_kubun_room + '","' + inObj.nm_room + '","' + inObj.time_yoyaku + '","' + inObj.time_start + '","' + inObj.time_end + '","' + inObj.id_riyousha + '","' + inObj.nm_riyousha + '","' + inObj.kana_riyousha + '",' + tool.returnvalue(inObj.no_yubin) + ',"' + inObj.address + '","' + inObj.email + '",' + tool.returnvalue(inObj.telno) + ',"' + inObj.mokuteki + '","' + inObj.nm_uketuke + '",' + inObj.num_person + ',' + inObj.price + ',' + tool.returnvalue(inObj.stat_shiharai) + ',' + tool.returnvalue(inObj.bikou) + ',"' + inObj.kubun_day + '","' + inObj.kubun_room + '")';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
};

const deleteByMonth = async (target_yyyymm) => {
    try {
        const query = 'delete from yoyakus where "' + target_yyyymm + '" = substring(id, 2, 6)';
        const retObj = await knex.raw(query);
        return retObj[0];
    } catch(err) {
        throw err;
    }
}

const setSQL = async (sql) => {
    try {
        const retObj = await knex.raw(sql);
        return retObj[0];
    } catch(err) {
        throw err;
    }
}

module.exports = {
    findPKey,
    calcTime,
    insert,
    deleteByMonth,
    setSQL,
};