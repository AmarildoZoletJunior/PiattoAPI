const sequelize = require("sequelize");
const connection = require("../../Connection/connection");

const ingredientes = connection.define("Ingredientes",{
    id:{
        type: sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    nome:{
        type: sequelize.STRING,
        allowNull: false,
    }
})

// ingredientes.belongsToMany(receita);

ingredientes.sync({force:false});



module.exports = ingredientes;