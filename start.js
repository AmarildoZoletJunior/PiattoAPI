//Importando bibliotecas
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

//Iniciando banco e express
const connection = require("./Database/Connection/connection");
const app = express();

//Configurações
const PORT = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());


//Start server.
app.listen(PORT,()=>{
    try{
    console.log("Servidor iniciado em: http://localhost:3000");
    } catch(erro){
        console.log("Ocorreu um erro no servidor: " + erro);
    }
})