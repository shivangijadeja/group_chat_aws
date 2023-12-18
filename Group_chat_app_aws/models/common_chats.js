const Sequelize=require('sequelize');

const sequelize=require('../utils/database')

const CommonChats = sequelize.define('CommonChats', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    message: {
        type: Sequelize.TEXT(),
        allowNull: false
    },
    date_time: {
        type: Sequelize.DATE, 
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), 
      },
})

module.exports = CommonChats;