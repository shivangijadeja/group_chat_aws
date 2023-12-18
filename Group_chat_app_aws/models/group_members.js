const Sequelize=require('sequelize');

const sequelize=require('../utils/database')

const Groupmember = sequelize.define('GroupMembers',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        allowNull:false,
        primaryKey:true
    }
});

module.exports=Groupmember;