module.exports = {
    HOST: "192.168.150.102",
    PORT: "3306",
    USER: "root",
    PASSWORD: "root00",
    DB: "service",
    dialect: "mysql",
    reconnect: true,
    connectTimeout: 18000,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };
  