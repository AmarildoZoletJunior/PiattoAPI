const sequelize = require("sequelize");
const connection = require("../../Connection/connection");
const receitasIngredientes = require("../Migrations/Receita_has_Ingredientes");

const medidas = connection.define("Medidas", {
    id: {
        type: sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    unidade: {
        type: sequelize.STRING,
        allowNull: false,
    }
})

medidas.hasOne(receitasIngredientes, {
    foreignKey: 'UnidadeId'
});

receitasIngredientes.belongsTo(medidas);

medidas.sync({ force: false });

module.exports = medidas;