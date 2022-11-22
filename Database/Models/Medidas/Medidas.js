const sequelize = require("sequelize");
const connection = require("../../Connection/connection");
const receitasIngredientes = require("../Migrations/ReceitaIngrediente/Receita_has_Ingredientes");

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
    foreignKey:'MedidaId'
});

receitasIngredientes.belongsTo(medidas);
receitasIngredientes.sync();
medidas.sync({ force: false });


module.exports = medidas;