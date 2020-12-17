require("dotenv").config();

module.exports = {
  development: {
    username: "test",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "ggbook",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  test: {
    username: "test",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "ggbook_test",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    username: "test",
    password: process.env.SEQUELIZE_PASSWORD,
    database: "ggbook_production",
    host: "127.0.0.1",
    dialect: "mysql",
  },
};
