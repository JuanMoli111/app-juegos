const express = require("express");
const reversiManagement = require("./reversiManagement");
const app = express();


//SETTINGS
//Nombre y Puerto de la app
app.set("appName", "App Juegos");
app.set("port", "3000");
//Setea el motor de views
app.set("view engine", "ejs");
// Setea la carpeta publica que usará la app ;
app.use(express.static("public"));
//Configura la app para interpretar formato json
app.use(express.json({ limit: "1mb" }));

//ROUTES
//Home y juegos
app.get("/", (req, res) => {
    res.render("home", { titulo: "Home" });
});
app.get("/reversi", (req, res) => {
    res.render("reversi", { titulo: "Reversi" });
});
app.get("/battleship", (req, res) => {
    res.render("battleship", { titulo: "Battleship"});
});


//Reversi
app.post("/reversi/new", newReversi);
app.patch("/reversi/join", joinReversi);
app.patch("/reversi/move/:boardId", moveReversi);
app.get("/reversi/get/:boardId", getReversi);


//Petición: Crear Juego (P1). Respuesta(si ok): Datos de la partida (game)
function newReversi(req, res) {
    const game = reversiManagement.newGame();
    res.status(200).send(game);
}

//Petición: Unirse a Juego (P2). Respuesta(si ok): Datos de la partida (game)
function joinReversi(req, res) {
    const game = reversiManagement.joinGame(req.body.boardId);
    if (game)
        res.status(200).send(game);
    else 
        res.status(400).send();
}

//Petición: Realizar movimiento (P1 ó P2). Respuesta(si ok): Datos de la partida (game)
function moveReversi(req, res){

    //Comprueba si el jugador puede mover, si es true devuelve el game
    const game = reversiManagement.move(req.params.boardId, req.body.playerId, req.body.square);

    if(game){
        //lo retorna para que el cliente (front) lo presente
        res.status(200).send(game)
    }
    else
        res.status(400).send();
}

//Petición: Obetener estado de partida (P1 ó P2). Respuesta(si ok): Datos de la partida (game)
function getReversi(req, res){
    const game = reversiManagement.getGame(req.params.boardId);
    if (game)
        res.status(200).send(game);
    else
        res.status(400).send();
}

//LISTEN
app.listen(app.get('port'), () => {
    console.log(app.get('appName'));
    console.log('Server on port', app.get('port'));
});