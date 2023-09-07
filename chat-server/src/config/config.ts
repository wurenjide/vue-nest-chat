export default () => ({
    port: parseInt(process.env.DB_PORT, 10) || 3000,
    database: {
        type: process.env.DB_TYPE,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        retryDelay: parseInt(process.env.RETRYDELAY, 10) || 500,
        retryAttempts: parseInt(process.env.RETRYATTEMPTS, 10) || 10,
    }
});