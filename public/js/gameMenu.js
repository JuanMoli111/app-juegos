

/* 
fetchGame() hace un fetch(de tipo get) cada 2 segundos, 
trae la informacion de la partida constantemente (por ahora solo imprime) 
*/
function fetchGame(boardId){

    setInterval(function(){ 

        //ifes su turno.. (mediante localstorage?)
        //fetch, peticion GET, a la ruta pull/boardID, osea a hacerturno ponele
        fetch(`/reversi/get/${boardId}`)
        .then(response => {
            if (response.ok) {

                //Si hubo un turno debería hacer algo??


                return response.json()
            } else{
                throw new Error ("No es posible obtener el estado de la partida.");
            }
        })
        .then(json => console.log('print json: ', json))
        .catch(err => console.log(err));
    }, 2000);


}

/*  
startGame() se ejecuta cuando UN cliente crea o se suma a una partida,
ejecuta fetchGAME(),
elimina el menu y muestra el juego(por ahora solo boton de turno),
a su vez muestra el id de la partida y qué jugador es (1 o 2),
*/
function startGame(){
    


    //'Elimina' el menu
    document.getElementById("menu").style.display = 'none';

    //Setea un estilo al elem game, como este era nulo, recien entonces se muestra en pantalla
    const game = document.getElementById("game");
    game.style.display = 'flex';
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
    
    //fetch a reversi/join, peticion PATCH
    fetch('/reversi/join',options)
    .then(response => {
        if (response.ok) {
            return response.json()
        } else{
            throw new Error ("ID de tablero inválida.");
        }
    })
    .then(boardData => {
        
        //tenemos todos los datos del tablero aqui
        console.log('printing board data at startgame:',boardData);
        

        
        //Salva el elemento para la info del player
        const player = document.createElement("h4");

        let boardId = boardData.keys.boardId
        let player1Id = boardData.keys.player1Id;
        let player2Id = boardData.keys.player2Id;

        //Crear un item en el local storage para el ID del tablero, abajo guarda el del user tmb
        localStorage.setItem('boardId',boardId);
        localStorage.setItem('player1Id',player1Id);
        localStorage.setItem('player2Id', player2Id);

        //const gameData = boardData;

        player.innerHTML = `<br>Jugador 2 ID:${player2Id}: `;
        localStorage.setItem('player1Id',player1Id);
        localStorage.setItem('player2Id',player2Id);
        

        //Informa la ID del tablero, appendChild lo agrega al HTML
        player.innerHTML += `<br> Id del tablero: ${boardData.keys.boardId}`;
        player.innerHTML += `<br> BOARD ${boardData.board}`;

        game.appendChild(player);

        return boardData;
    })
    .then(boardData => fetchGame(boardData.keys.boardId))
    .catch(err => console.log(err));


    //Primer llamado a fetchGame, este es el fetch que, en loop, verifica si el otro player realizo un turno
    
    
}

//newGame() crea una partida (player1) y ejecuta startGame()
function newGame(){
    startGame();

    //Salva el elemento para la info del player

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
  
        const player = document.createElement("h4");


        let boardId = boardData.keys.boardId
        let player1Id = boardData.keys.player1Id;

        //Crear un item en el local storage para el ID del tablero, abajo guarda el del user tmb
        localStorage.setItem('boardId',boardId);
        localStorage.setItem('player2Id', null);
        localStorage.setItem('player1Id',player1Id);


        player.innerHTML = `<br>Jugador 1 ID:${player1Id}: `;

        //Informa la ID del tablero, appendChild lo agrega al HTML
        player.innerHTML += `<br> Id del tablero: ${boardId}`;
        player.innerHTML += `<br> BOARD ${boardData.board}`;
    
    
        game.appendChild(player);
    })
    .catch(err => console.log(err));
}

//Un jugador mueve su turno
function fetchTurn(){

    //COMPROBAR SI EL PLAYER PUEDE JUGAR EN ESTE TURNO?? SI PUEDE ENTONCES HACE EL PATCH, EL PATCH DEBE MODIFICAR UN RECURSO
    ///comprobar si el registro del localstorage es un id de user
    ////buscar la partida de ese user
    //verificar si es su turno

    const player = document.querySelector('h4');

    //Salva el ID del user actual
    let playerId = player.innerHTML.split(':')[1];

    console.log('Player ID moving being: ',playerId);

    const boardId = localStorage.getItem('boardId');


    //Salva el ID del board del local storage
    const data = {
        boardId : boardId
    }
    
    //PRIMERO UN GET DESPUES UN PATCH??

    //Settings de la peticion PATCH o GET??
    const options = {
        method: 'PATCH',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }

    //fetch a reversi/move/boardId, peticion PATCH
    fetch(`/reversi/move/${boardId}`,options)
    .then(response => {
        if (response.ok) {
            return response.json()
        } else{
            throw new Error ("ID de tablero inválida.");
        }
    })
    .then(boardData => {
        console.log('fetching turn boardData: ',boardData)

        




    })
    .catch(err => console.log(err));

    //return data;
}

