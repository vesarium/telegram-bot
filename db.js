const { Sequelize } = require('sequelize');

module.exports = new Sequelize(
    'tbot',
    'grobot',
    'grobot',
    {
        host: '194.5.159.69',
        port: '3306',
    }

)