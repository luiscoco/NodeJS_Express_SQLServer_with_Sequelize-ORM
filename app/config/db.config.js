module.exports = {
  HOST: "localhost",
  PORT: "1433",
  USER: "sa",
  PASSWORD: "Luiscoco123456",
  DB: "bezkoder_db",
  dialect: "mssql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
