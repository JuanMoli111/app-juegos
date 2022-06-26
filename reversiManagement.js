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

        //Genera y guarda el nuevo id del jugador que esta entrando
        game.keys.player2Id = generateId(5);
        // Inicializa los turnos
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

//Retorna el estado de la partida si es existente, sino retorna false
function getGame(boardId){

    //Busca el juego por boardId
    let game = games.find((e) => e.keys.boardId == boardId);
    if (game)
        return game;
    else
        return false;
}

module.exports = {
    newGame,
    joinGame,
    getGame,
    updateGame
};
