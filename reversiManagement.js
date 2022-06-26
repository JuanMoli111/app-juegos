const fs = require("fs");
const rawdata = fs.readFileSync("./ReversiGames.json");
//Partidas dl JSON
const games = JSON.parse(rawdata);

const crypto = require("crypto");

const EMPTY = null;
const PLAY1 = "P1";
const PLAY2 = "P2";

//Genera el tablero incial de reversi, con las fichas centrales siendo dos para cada player, y el resto vacias
/// detalle a implementar:  reversi puede iniciar con las fichas repartidas de disintas formas aleatoriamente
function generateBoard(){
    let board = [...Array(8)].map(e => Array(8).fill(EMPTY));
    board[3][3] = PLAY2; board[3][4] = PLAY1; board[4][3] = PLAY1; board[4][4] = PLAY2;
    return board;
}



//Generar un ID unico de cierto tamaño recibido por parametro, este será un string generado aleatoriamente y muy dificil de crackear
function generateId(tamanio) {
    return crypto.randomBytes(tamanio).toString("hex");
}

//Genera el objeto inicial de keys para una partida y lo retorna
function newGameKeys() {
    return {
        boardId: generateId(20),
        player1Id: generateId(5),
        player2Id: null,
    };
}

//Crea una partida
function newGame() {

    console.log('llamo a new game en revesimanagement');

    //Genera los datos de la partida, esto son las keys (IDs) la informacion del turno, y del tablero
    let game = {
        keys: newGameKeys(),
        turn: null,
        board: generateBoard()
    };

    //Agrega el nuevo juego al json
    games.push(game);

    //Escribe el nuevo json al archivo
    fs.writeFileSync("./ReversiGames.json", JSON.stringify(games), (err) => {
        if (err) reject(err);
    });


    //Retorna el juego
    return game;
}

//Unirse a una partida
function joinGame(boardId) {
    
    //busca una partida para unirse por ID, esta es una partida tal que tenga el mismo ID y no se haya unido un segundo player aun 
    let game = games.find(
        (e) => e.keys.boardId == boardId && e.keys.player2Id == null
    );


    //Si existe tal partida
    if (game) {

        //Borrar objecto con mismo boardId ¿?

        //Genera y guarda el nuevo id del jugador que esta entrando
        game.keys.player2Id = generateId(5);
        // Inicializamos los turnos
        game.turn = "P1";


        //Reescribir JSON
        games.push(game);
        fs.writeFileSync("./ReversiGames.json", JSON.stringify(games), (err) => {
            if (err) reject(err);
        });

        return game;
    }
    return false;
}

//Cada movimiento genera un nuevo registro de la partida en el json, con el tablero nuevo y cambiando el turno 
function updateGame(game){

    /*let game = games.reverse().find(
        (e) => e.keys.boardId == boardId && e.keys.player2Id != null 
    );*/

    //Si existe tal partida
    if (game) {


        console.log('about to save this game',game)
        ///Actualizar info del tablero
        //Reescribir JSON
        games.push(game);
        fs.writeFileSync("./ReversiGames.json", JSON.stringify(games), (err) => {
            if (err) reject(err);
        });

        return game;
    }
    return false;
}

//Retorna el estado de la partida si es existente
function getGame(boardId){
    //Busca el juego por boardId
    let game = games.find((e) => e.keys.boardId == boardId);
    if (game)
        return game;
    else
        return false;
}

function getGameById(boardId){
    const rawdata = fs.readFileSync("./ReversiGames.json");
    const jsonGames = JSON.parse(rawdata);
    //Busca el juego por boardId
    let game = jsonGames.reverse().find((e) => e.keys.boardId == boardId);
    if (game)
        return game;
    else
        return false;
}

function getGameByPlayerId(playerId){

    //Busca el juego por boardId
    let game = games.reverse().find((e) => (e.keys.player1Id == playerId || e.keys.player2Id == playerId) && e.keys.player2Id != null);
    if (game)
        return game;
    else
        return false;
}

//Busca una partida por  ID de jugador, retorna un objeto con la partida y  un indicador de si es el player 1 o 2
function playerInThisGame(playerId){

    //Busca el juego por playerId, isPlayer1 será falso si ningun juego coincide, y sera el juego que encuentre si existe
    let isPlayer1 = games.reverse().find((e) => e.keys.player1Id == playerId && e.keys.player2Id != null);
    
    //Busca el juego por playerId, isPlayer2 será falso si ningun juego coincide, y sera el juego que encuentre si existe
    let isPlayer2 = games.reverse().find((e) => e.keys.player2Id == playerId && e.keys.player2Id != null);
     
    console.log('isplayer1 es: ', isPlayer1)
    console.log('isplayer2 es: ', isPlayer2)

    if(isPlayer1)return isPlayer1;
    else if(isPlayer2) return isPlayer2;


    if (game)
        return game;
    else
        return false;


}

module.exports = {
    newGame,
    joinGame,
    getGame,
    updateGame,
    getGameById,
    getGameByPlayerId,
};
