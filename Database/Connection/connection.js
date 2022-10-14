require('dotenv').config();
const Sequelize = require("sequelize");
const connection = new Sequelize(process.env.NOME_TABELA,process.env.USUARIO,process.env.SENHA_BANCO,{
    host: "localhost",
    dialect: "mysql",
    timezone: "-03:00",
})

connection.authenticate().then(()=>{
    console.log("Conectado ao banco com sucesso");
}).catch((erro)=>{
    console.log("Ocorreu um erro ao conectar com o banco de dados: " + erro);
})

module.exports = connection;