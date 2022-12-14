//Importando bibliotecas
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Op } = require("sequelize");
const session = require("express-session");

//Iniciando banco e express
const connection = require("./Database/Connection/connection");
const app = express();

//Configuração de sessão
app.use(session({
    secret:"ApiPiatto", cookie:{maxAge: 1000000000000000}
}))

//Importando models
   const Usuarios = require("./Database/Models/Usuarios/Usuarios");
     // const Receitas = require("./Database/Models/Receitas/Receita");
     // const Ingredientes = require("./Database/Models/Ingredientes/Ingredientes");
    //const UsuariosReceitas = require("./Database/Models/Migrations/UsuarioReceita/Usuarios_has_Receitas");
       // const Medidas = require("./Database/Models/Medidas/Medidas");
 //const ReceitasIngredientes = require("./Database/Models/Migrations/ReceitaIngrediente/Receita_has_Ingredientes");





//Configurações
const PORT = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cors());

function adminAuth(req,res,next){
    if(req.session.IdUsuarioLogado != undefined){
        next();
    }else{
        res.sendStatus(400);
        res.statusCode = 400;
    }
}


//Deletar dos favoritos  OK
app.delete("/favoritos/:id",adminAuth,(req,res)=>{
    let id = req.params.id;
    let idUsuario =  req.session.IdUsuarioLogado;
    if(id != null && id != undefined){
        if(idUsuario != null && idUsuario != undefined){
            UsuariosReceitas.destroy({
                where:{ReceitaId:id,UsuarioId:idUsuario}
            }).then((resposta)=>{
                console.log(resposta)
                if(resposta != 0){
                    res.statusCode = 200;
                    res.sendStatus(200);
                }else{
                    res.sendStatus(400);
                    res.statusCode = 400;
                }
        
            }).catch((erro)=>{
                res.sendStatus(400);
                res.statusCode = 400;
            })
        }else{
            res.sendStatus(400);
            res.statusCode = 400;
        }
    }else{
        res.sendStatus(400);
        res.statusCode = 400;
    }
})

//Adicionar aos favoritos OK
app.post("/favoritos/:id",adminAuth,(req,res)=>{
    let id = req.params.id;
    let idUsuario =  req.session.IdUsuarioLogado;
    if(id != null && id != undefined && idUsuario != null && idUsuario != undefined){
        UsuariosReceitas.create({
            UsuarioId: idUsuario,
            ReceitaId:id
        }).then((resposta)=>{
            res.sendStatus(201);
            res.statusCode = 201;
        }).catch((erro)=>{
            res.sendStatus(404);
            res.statusCode = 404;
        })  
    }else{
        res.sendStatus(404);
        res.statusCode = 404;
    }
})

//Listar favoritos de um usuario OK
app.get("/favoritos",adminAuth,(req,res)=>{
    let id =  req.session.IdUsuarioLogado;
    console.log(typeof id)
    if(id != undefined && id != null){
        UsuariosReceitas.findAll({where:{UsuarioId:id},raw:true}).then(async (resposta)=>{
            let array = [];
            await resposta.forEach(function(resp){
                 array.push(resp.ReceitaId);
            });
            await Receitas.findAll({where:{id:{[Op.and]:[array]}},raw:true}).then((resposta)=>{
                 if(resposta.length != 0){
                    res.statusCode = 200;
                    res.json(resposta)
                 }else{
                    res.sendStatus(404);
                    res.statusCode = 404;
                 }
            }).catch(()=>{
                res.sendStatus(404);
                res.statusCode = 404;
            });
        }).catch(()=>{
            res.sendStatus(404);
            res.statusCode = 404;
        });
    }else{
        res.sendStatus(404);
        res.statusCode = 404;
    }
})


//Receita Solo
app.get("/receita/:id",adminAuth,async (req,res)=>{
    let id = req.params.id;
    let array = [];
    if(id != null && id != undefined){
        await Receitas.findAll({where:{id:id}}).then(async(resposta)=>{
            resposta.forEach(function(retorno){
                ReceitasIngredientes.findAll({where:{ReceitaId:retorno.id}}).then(async (resposta)=>{
                await resposta.forEach(function(retorno){
                        array.push(retorno.IngredientesId);
                    });
                }).catch(()=>{
                    res.sendStatus(404);
                    res.statusCode = 404;
                })
            })
    
            setTimeout(()=>{     
            ReceitasIngredientes.findAll({where:{ReceitaId:id}}).then((resposta2)=>{
                if(resposta.length != 0 && resposta2.length != 0){
                    res.json({Receita: resposta,ingredientes:resposta2});
                    res.statusCode = 200;
                }else{
                    res.sendStatus(404);
                    res.statusCode = 404;
                }
            }).catch(()=>{
                res.sendStatus(404);
                res.statusCode = 404;
            })
         },1500)
        }).catch((erro)=>{
            res.sendStatus(404);
            res.statusCode = 404;
        })
    }else{
        res.sendStatus(404);
            res.statusCode = 404;
    }
})


//receitas lista principal
app.get("/receitas",adminAuth,async(req,res)=>{
    let decisao = req.body.decisao;
    let arra = req.body.id;
    var final = [];
    if(decisao != null && decisao != undefined && decisao.length > 0){
        if(arra != null && arra != undefined && arra.length > 0){
            //Passa de string para array
            let novo = arra.split(",");
            //Transforma todos os numeros de string Para Number
            let arrayNovo = await novo.reduce(function(pV,cv){
             let novo = Number(cv);
             pV.push(novo);
             return pV;
            },[]);
            //Condição 1 caso pessoa selecione 1 ingrediente retorna todos as receitas que contem aquele ingrediente
            if(await arrayNovo.length === 1){
                //Efetua busca pelo id do ingrediente.
                await ReceitasIngredientes.findAll({where:{IngredientesId:arrayNovo}}).then((resposta)=>{
                    let arrayReceita = [];
                    resposta.forEach(function await(resposta){
                        //Adiciona todas os ids de receitas existente naquela busca
                        arrayReceita.push(resposta.ReceitaId);
                    })
                    //Retorna todas as receitas que tem aquele ingrediente
                    Receitas.findAll({where:{id:arrayReceita}}).then((resposta)=>{
                        res.json(resposta)
                    }).catch((erro)=>{
                        console.log(erro)
                    })
                }).catch(()=>{
                    res.sendStatus(400);
                    res.statusCode = 400;
                })
            
            }else if(arrayNovo.length > 1){  //Condição numero 2 ( Caso a pessoa digite mais de um ingrediente, vai retornar somente receitas com aqueles ingredientes)
                //Procura por todas as receitas que tem aqueles ingredientes
                await ReceitasIngredientes.findAll({where:{IngredientesId:arrayNovo}}).then(async (resposta)=>{
                    let arrayReceitas = [];
                    await resposta.forEach(function(receitas){
                    //Adiciona em um array todas as receitas que achou
                    arrayReceitas.push(receitas.ReceitaId)
                   })
                   let arraySemRepetição = [];
                   //Faz a comparação e elimina todos os numeros repetidos do array arrayReceitas
                   let aux = arrayReceitas.filter(function async(elemento, i) {
                    if(arrayReceitas.indexOf(elemento) === i) {
                        arraySemRepetição.push(elemento)
                    }
                    return arrayReceitas.indexOf(elemento) === i;
                });
                //Inicia leitura do array que contem os numeros sem repetição
                aux.forEach(function(resposta) {
                    //Inicia busca no banco de todas as receitas que contem o id passados no array
                    ReceitasIngredientes.findAll({where:{ReceitaId:resposta}}).then((r)=>{
                        let arra = [];
                        //Inicia leitura do array resposta da busca
                        r.forEach(function(ra){
                        //Adiciona no array o Id de todos os ingredientes que cada receita contem
                            arra.push(ra.IngredientesId);
                        });
                        //Função de comparação
                        const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);
                        //Se true, inicia uma pesquisa direta com apenas os ingredientes selecionados
                        if(decisao){
                            if(equals(arra,arrayNovo)){
                                let arr = [];
                                //iniciando leitura de array r
                                  r.forEach(function async(final2){
                                    //Adicionando em novo array todos os id daquelas receitas que batem com a condição
                                     arr.push(final2.ReceitaId);
                                  })
                                  let novo = [];
                                  //Novamente função de eliminar IDS iguais
                                  let aux = arr.filter(function async(elemento, i) {
                                    if(arr.indexOf(elemento) === i) {
                                         novo.push(elemento)
                                    }
                                    return arr.indexOf(elemento) === i;
                                });
                                console.log(aux[0]);
                                //Adicionando id que sobrou no array, em outro array chamado final.
                                final.push(aux[0]);
                            }else{
                                return;
                            }
                        }else{   //Se falso ele faz a pesquisa indireta trazendo receitas que contem aqueles ingredientes mais alguns ingredientes
                            if(arrayNovo.every(elemento => arra.includes(elemento))){
                            let arr = [];
                            //iniciando leitura de array r
                              r.forEach(function async(final2){
                                //Adicionando em novo array todos os id daquelas receitas que batem com a condição
                                 arr.push(final2.ReceitaId);
                              })
                              let novo = [];
                              //Novamente função de eliminar IDS iguais
                              let aux = arr.filter(function async(elemento, i) {
                                if(arr.indexOf(elemento) === i) {
                                     novo.push(elemento)
                                }
                                return arr.indexOf(elemento) === i;
                            });
                            console.log(aux[0]);
                            //Adicionando id que sobrou no array, em outro array chamado final.
                            final.push(aux[0]);
                        }else{
                            return;
                        }
                    }
                    }).catch((a)=>{
                        res.sendStatus(404);
                        res.statusCode = 404;
                    })
                })
                //Adicionando tempo para renderizar as buscas
                setTimeout(()=>{
                    Receitas.findAll({where:{id:{[Op.and]:[final]}},raw:true}).then((resposta)=>{
                       if(resposta != 0){
                        res.json(resposta)
                        res.statusCode = 200;
                       }else{
                        res.sendStatus(404);
                        res.statusCode = 404;
                       }
                    }).catch((erro)=>{
                        res.sendStatus(404);
                        res.statusCode = 404;
                    })
        
                },1500)
                }).catch((erro)=>{ ///aq
                    res.sendStatus(404);
                    res.statusCode = 404;
                })
            }
        }else{
            res.sendStatus(404);
            res.statusCode = 404;
        }
    }else{
        res.sendStatus(404);
        res.statusCode = 404;
    }
})


//Função Criar receita
app.post("/receitasCriadas",adminAuth,async (req,res)=>{
    let idUsuario =  req.session.IdUsuarioLogado;
    let nomeReceita = req.body.nome;
    let modoPreparo = req.body.preparo;
    let rendimento = req.body.rendimento;
    let ingredientes = req.body.ingredientes;
    let quantidade = req.body.quantidade;
    let medida = req.body.medida;

    if(idUsuario != null && idUsuario != undefined){
        if(nomeReceita != null && nomeReceita != undefined){
            if(modoPreparo != null && modoPreparo != undefined){
                if(rendimento != null && rendimento != undefined){
                    if(ingredientes != null && ingredientes != undefined){
                        if(quantidade != null && quantidade != undefined){
                            if(medida != null && medida != undefined){
                                let ArrayIngredientes = ingredientes.split(",");
                                let arrayNovoIngredientes = await ArrayIngredientes.reduce(function(pV,cv){
                                    let novo = Number(cv);
                                    pV.push(novo);
                                    return pV;
                                   },[]);
                                let ArrayQuantidade = quantidade.split(",");
                                let arrayNovoQuantidade = await ArrayQuantidade.reduce(function(pV,cv){
                                    let novo = Number(cv);
                                    pV.push(novo);
                                    return pV;
                                   },[]);
                                
                            
                               await Receitas.create({
                                    nome:nomeReceita,
                                    modo_de_preparo:modoPreparo,
                                    rendimento: rendimento,
                                    UserId: idUsuario,
                                }).then(async(res)=>{
                                    for(let i = 0; i < arrayNovoIngredientes.length; i++ ){
                                        ReceitasIngredientes.create({
                                            ReceitaId:res.id,
                                            IngredientesId:arrayNovoIngredientes[i],
                                            MedidaId:medida,
                                            Quantidade:arrayNovoQuantidade[i],
                                        }).then(()=>{
                                            res.statusCode = 200;
                                            res.sendStatus(200);
                                        }).catch(()=>{
                                            res.sendStatus(400);
                                            res.statusCode = 400;
                                        })
                                    }
                                }).catch((err)=>{
                                    res.sendStatus(400);
                                    res.statusCode = 400;
                                })
                            }
                        }else{
                            res.sendStatus(404);
                            res.statusCode = 404; 
                        }
                    }else{
                        res.sendStatus(404);
                        res.statusCode = 404; 
                    }
                }else{
                    res.sendStatus(404);
                    res.statusCode = 404; 
                }
            }else{
                res.sendStatus(404);
                res.statusCode = 404; 
            }
        }else{
            res.sendStatus(404);
            res.statusCode = 404; 
        }
    }
   
})

//Listar receitas criadas pelo usuario
app.get("/receitasCriadas",adminAuth,(req,res)=>{
    let idUsuario =  req.session.IdUsuarioLogado;
    Receitas.findAll({where:{UserId:idUsuario}}).then((resposta)=>{
        if(resposta.length != 0){
res.json(resposta)
res.statusCode = 200;
        }else{
            res.sendStatus(404);
                res.statusCode = 404;
        }
    }).catch(()=>{
        res.sendStatus(404);
        res.statusCode = 404;
    })
})

//Remover receitas criadas pelo usuario
app.delete("/receitasCriadas",adminAuth,(req,res)=>{
    let idReceita = req.body.idReceita;
    if(idReceita != null && idReceita != undefined){
        Receitas.destroy({where:{id:idReceita}}).then((resposta)=>{
            res.sendStatus(200);
            res.statusCode = 200;
        }).catch(()=>{
            res.sendStatus(404);
            res.statusCode = 404;
        })
    }else{
        res.sendStatus(404);
        res.statusCode = 404;
    }
})


//Modificar Receita
app.put("/receitasCriadas",adminAuth,(req,res)=>{
    let idReceita = req.body.idReceita;
    let nome = req.body.nome;
    let preparo = req.body.preparo;
    let rendimento = req.body.rendimento;
    if(idReceita != null && idReceita != undefined){
        if(nome != null && nome != undefined){
            if(preparo != null && preparo != undefined){
                if(rendimento != null && rendimento != undefined){
                    Receitas.update(({
                        nome:nome,
                        modo_de_preparo:preparo,
                        rendimento:rendimento
                    }),{where:{id:idReceita}}).then(()=>{
                        res.sendStatus(200);
                                res.statusCode = 200;
                    }).catch(()=>{
                        res.sendStatus(400);
                        res.statusCode = 400;
                    })
                }else{
                    res.sendStatus(400);
                    res.statusCode = 400;
                }
            }else{
                res.sendStatus(400);
                res.statusCode = 400;
            }
        }else{
            res.sendStatus(400);
            res.statusCode = 400;
        }
    }else{
        res.sendStatus(400);
        res.statusCode = 400;
    }

})

//Criar usuario
app.post("/usuario",adminAuth,(req,res)=>{
    let regexEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gi;
    let email = req.body.email;
    let senha = req.body.senha;
    let confirmarSenha = req.body.confirmarsenha;
    Usuarios.findAll({where:{email:email}}).then((resposta)=>{
        if(resposta.length !== 0){
            res.sendStatus(401);
            res.statusCode = 401;
        }else{
            if(email !== undefined && email !== null && regexEmail.test(email) === true){
                if(senha !== undefined && senha !== null && senha.length > 3 && senha === confirmarSenha){
            Usuarios.create({
                email:senha,
                senha:senha
                         }).then((resposta)=>{
                            res.sendStatus(200);
                        res.statusCode = 200;
                         }).catch(()=>{
                            console.log("Teste1");
                            res.sendStatus(400);
                            res.statusCode = 400;
                         })
                }else{
                    console.log("Teste2");
                    res.sendStatus(400);
                    res.statusCode = 400;
                }
        }else{
            console.log("Teste3");
            res.sendStatus(400);
            res.statusCode = 400;
        }
        }
    }).then(()=>{
       
    }).catch((err)=>{
        console.log("Teste4");
        res.sendStatus(400);
        res.statusCode = 400;
    });
    });


//Logar no aplicativo
app.get("/usuario",(req,res)=>{
    let email = req.body.email;
    let senha = req.body.senha;
    Usuarios.findOne({where:{email: email,senha:senha}}).then((resposta)=>{
        if(resposta == null){
            res.sendStatus(400);
            res.statusCode = 400;
        }else{
            req.session.IdUsuarioLogado = resposta.id;
            req.session.NomeUsuarioLogado = resposta.email;
            req.session.SenhaUsuarioLogado = resposta.senha;
            res.sendStatus(200);
            res.statusCode = 200;
        }
    }).catch((err)=>{
console.log(err)
    });
})


app.get("/usuariosair",(req,res)=>{
    req.session.IdUsuarioLogado = null;
            req.session.NomeUsuarioLogado = null;
            req.session.SenhaUsuarioLogado = null;
})


//Start server.
app.listen(PORT,()=>{
    try{
    console.log("Servidor iniciado em: http://localhost:3000");
    } catch(erro){
        console.log("Ocorreu um erro no servidor: " + erro);
    }
})