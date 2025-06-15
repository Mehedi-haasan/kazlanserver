
const config = {
    HOST: "localhost",
    USER: "kazaland_brother",
    PASSWORD: "erp_napa_550",
    DB: "kazaland_erpsystem",
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

module.exports = config;