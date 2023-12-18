const Sequelize=require('sequelize');

const sequelize=new Sequelize(process.env.DB_NAME,process.env.AWS_DB_USER_NAME,process.env.AWS_DB_PASSWORD,{
    dialect:process.env.AWS_DB_DIALECT,
    host:process.env.AWS_DATABASE_HOST
});

module.exports=sequelize;