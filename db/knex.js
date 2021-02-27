const Knex = require("knex");
const config = require("../config/app.config");

const connect = () => {
    const configdb= {
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        port: config.db.port,
    };

    const knex = Knex({
        client: "mysql",
        connection: configdb,
    });
    knex.client.pool.max = 5;
    knex.client.pool.min = 5;
    knex.client.pool.createTimeoutMillis = 30000; // 30 seconds
    knex.client.pool.idleTimeoutMillis = 600000; // 10 minutes
    knex.client.pool.createRetryIntervalMillis = 200; // 0.2 seconds
    knex.client.pool.acquireTimeoutMillis = 600000; // 10 minutes
    return knex;
};

module.exports = {
    connect: connect,
}