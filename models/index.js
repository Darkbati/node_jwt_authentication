const dbConfig = require("../config/DB.Config");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  reconnect: dbConfig.reconnect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },
  dialectOptions: {
    connectTimeout: dbConfig.connectTimeout
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.User = require("./User.Model")(sequelize, Sequelize);

module.exports = db;
