const Sequelize = require("sequelize");
const connection = require("../../Connection/connection");
const receita = require("../Receitas/Receita");

const Usuarios = connection.define("Usuarios",{
    id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    email:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    senha:{
        type: Sequelize.STRING,
        allowNull: false,
    }
})
Usuarios.hasMany(receita, {
    foreignKey: 'UserId'
  });

  receita.belongsTo(Usuarios);

Usuarios.sync({force:false});

module.exports = Usuarios;