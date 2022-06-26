


/*function fetchGames(currentGame){

    //Deberia setear el intervalo cada dos segundos hasta que haya fetcheado una partida con turno, entonces primero debe mover ahsta empezar a setear de nuevo lso timeouts
    setInterval(function(){ 

        fetch(`/reversi/get/${currentGame.keys.boardId}`)
        .then(response => {
            if (response.ok) {
                //RECIBO EL JUEGO MAS ACTUALIZADO, SI EL  BOARD Y EL TURN SON EL MISMO
                //ENTONCES DECIRLE FETCH NO RECIBIO UN MOVE DL OTRO PLAYER
                //SI EL MOVE SE HIZO ACTUALIZAR TODO EL TABLERO!
                

                return response.json()
            } else{
                throw new Error ("No es posible obtener el estado de la partida.");
            }
        })
        .then(lastestGame => {
        
            if(currentGame.board == lastestGame.board && currentGame.turn == lastestGame.turn){
                console.log('NADA CAMBIO FETCHIE AL PEDO')
            } else{
                console.log('EL OTRO PLAYER MOVIO!!!')
                updateBoard(lastestGame);
            }
            
        })
        .catch(err => console.log(err));
    }, 2000)

}*/

/* 
fetchGame() hace un fetch(de tipo get) cada 2 segundos, 
trae la informacion de la partida constantemente (por ahora solo imprime) 
*/
function fetchGame(currentGame){

    //Deberia setear el intervalo cada dos segundos hasta que haya fetcheado una partida con turno, entonces primero debe mover ahsta empezar a setear de nuevo lso timeouts

    //Generar un intervalo que aga el fetch cada dos segundos, salvar su ID para detenerlo cuando llega su turno
    let idInterval = setInterval(function() { 

        //Fetch a la url get seguido del ID del tabler
        fetch(`/reversi/get/${currentGame.keys.boardId}`)
        .then(response => {
            if (response.ok) {
                
                
                return response.json()
            } else{
                throw new Error ("No es posible obtener el estado de la partida.");
            }
        })
        .then(latestGame => {
                //RECIBO EL ULTIMO JUEGO REGISTRADO, SI EL  BOARD Y EL TURN SON EL MISMO
                //ENTONCES AUN NO RECIBIMOS UN MOVE DEL OTRO PLAYER
                //SI EL MOVE SE HIZO ACTUALIZAR TODO EL TABLERO!

            if(currentGame.turn == latestGame.turn){
                console.log('NADA CAMBIO SIGAMOS FETCHIANDO')
            } else{
                console.log('EL OTRO PLAYER MOVIO!!!')
                updateBoard(latestGame);
                clearInterval(idInterval);
            } 
            
        })
        .catch(err => console.log(err))
    }, 2000);

    
}

/*  
startGame() se ejecuta cuando UN cliente crea o se suma a una partida,
ejecuta fetchGAME(),
elimina el menu y muestra el juego(por ahora solo boton de turno),
*/
function startGame(){
    //'Elimina' el menu
    document.getElementById("game-menu").style.display = 'none';
    document.getElementById("menu").style.display = 'none';
    //Setea un estilo al elem game, como este era nulo, recien entonces se muestra en pantalla
    const gameElement = document.getElementById("game");
    gameElement.style.display = 'flex';
}

//joinGame() se une a una partida (player2) y ejecuta startGame()
function joinGame(){
    localStorage.clear();

    startGame();

    //Salva el ID del tablero, que habiamos generado en el HTML
    const data = {
        boardId: document.getElementById("joinId").value,
    }

    //Settings de la peticion PATCH
    const options = {
        method: 'PATCH',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    
    //fetch a reversi/join, peticion PATCH que recibe la data del tablero en la response
    fetch('/reversi/join',options)
    .then(response => {
        if (response.ok) {
            return response.json()
        } else{
            throw new Error ("ID de tablero inválida.");
        }
    })
    .then(boardData => {
        

        //Salva el elemento designado para la info del player
        const player = document.getElementById("player-data");

        let boardId = boardData.keys.boardId
        let player1Id = boardData.keys.player1Id;
        let player2Id = boardData.keys.player2Id;

        //Crear un item en el local storage para el ID del tablero, abajo guarda el del user tmb
        localStorage.setItem('boardId',boardId);
        localStorage.setItem('player1Id',player1Id);
        localStorage.setItem('player2Id', player2Id);


        //Informa el ID del player 2, ID del tablero y sus datos
        player.innerHTML = `<br>Jugador 2 ID:${player2Id}: `;
        player.innerHTML += `<br> Id del tablero: ${boardData.keys.boardId}`;
        player.innerHTML += `<br> BOARD ${boardData.board}`;


        return boardData;
    })
    //Primer llamado a fetchGame, este es el fetch que, en loop, verifica si el otro player realizo un turno
    .then(boardData => fetchGame(boardData))
    .catch(err => console.log(err));
}


//newGame() crea una partida (player1) 
function newGame(){
    startGame();

    //Setting de la peticion POST
    const options = {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        }
    }

    //fetch a la ruta new, peticion POST, llamamos a startGame pasandole el json de la response (contiene el board)
    fetch('/reversi/new',options)
    .then(response => {
        if (response.ok) {
            return response.json()
        } else{
            throw new Error ("No es posible crear la partida.");
        }
    })
    .then(boardData => {
  
        //Salva el elemento designado para la info del player
        const player = document.getElementById("player-data");

        //Salva los IDS necesarios del tablero recibido
        let boardId = boardData.keys.boardId
        let player1Id = boardData.keys.player1Id;

        //Crear un item en el local storage para el ID del tablero, id del player2 y del player 1
        localStorage.setItem('boardId',boardId);
        localStorage.setItem('player2Id', null);
        localStorage.setItem('player1Id',player1Id);

        //Informa el ID del player 1, ID del tablero y sus datos
        player.innerHTML = `<br>Jugador 1 ID:${player1Id}: `;
        player.innerHTML += `<br> Id del tablero: ${boardId}`;
        player.innerHTML += `<br> BOARD ${boardData.board}`;
    
    
    })
    .catch(err => console.log(err));
}

//Un jugador mueve su turno
function fetchTurn(){

    //Conseguimos el ID del player segun los datos HTML
    let player = document.getElementById('player-data');

    //Salva el ID del user que esta moviendo su turno
    let playerId = player.innerHTML.split(':')[1];
    let boardId = localStorage.getItem('boardId');

    console.log('Player ID moving: ',playerId);


    //Salva el ID del board Y el ID del player que movió
    const data = {
        boardId : boardId,
        playerId: playerId
    }
    
    //Settings de la peticion PATCH 
    const options = {
        method: 'PATCH',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }

    //fetch a reversi/move/boardId, peticion PATCH, LA PETICION RECIBE EL BOARDID Y EL PLAYERID QUE REALIZO EL MOVIMIENTO
    fetch(`/reversi/move/${boardId}`,options)
    .then(response => {
        if (response.ok) {
            console.log('pude mover');
            return response.json()
        } else{
            throw new Error ("No pude mover :(");
        }
    })
    .then(boardData => {

        //Si llego aqui es por que pudo mover, actualiza el tablero y reinicia el loop de fetchs para esperar su turno
        updateBoard(boardData);
        fetchGame(boardData);
    })
    .catch(err => console.log(err));

}

//Actualiza la informacion del tablero, por ahora solo setea todos los datos indicando de quien es EL TURNO
function updateBoard(boardData){

    for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++){

            let id = `cell${i}${j}`;
            let p = document.getElementById(id);

            p.textContent = `   ${boardData.turn}  `

        }
    }
}