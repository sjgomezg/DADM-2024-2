import React, { useState , useEffect} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Button, Modal, BackHandler , Image} from 'react-native';

function Square({ value, onSquareClick }) {
  return (
    <TouchableOpacity style={styles.square} onPress={onSquareClick}>
      <Text style={styles.squareText}>{value}</Text>
    </TouchableOpacity>
  );
}

function Board({ xIsNext, squares, onPlay ,resetGame, pcMove, df, pX, pO, ties, setPX, setPO, setTies}) {
  

  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;

  if (winner) {
    if(winner == 'X')
      status = 'Ganaste !';
    if(winner == 'O')
      status = 'Perdiste =(';
  } else if (squares.every(square=> square !== null)){
    status = 'Empate';
  }else{
    //status = 'Siguiente Jugador: ' + (xIsNext ? 'X' : 'O');
    if(!xIsNext) pcMove(df);
  }
  
  return (
    <View style={styles.boardContainer}>
      <Text style={styles.status}>{status}</Text>
      <View style={styles.boardRow}>
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </View>
      <View style={styles.boardRow}>
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </View>
      <View style={styles.boardRow}>
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </View>
      <Text style={styles.text}>X: {pX} tie: {ties} O: {pO} </Text>
      <Text style={styles.text}>Dificultad: {df}</Text>
    </View>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const [difficulty, setDifficulty] = useState('Facil');
  const [modalVisible, setModalVisible] = useState(false);
  const [pX,setPX] = useState(0);
  const [pO,setPO] = useState(0);
  const [ties,setTies] = useState(0);

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);

    const winner = calculateWinner(nextSquares);
    if (winner) {
      if (winner === 'X') {
        setPX(prevPX => prevPX + 1);
      } else if (winner === 'O') {
        setPO(prevPO => prevPO + 1);
      }
    } else if (nextSquares.every(square => square !== null)) {
      setTies(prevTies => prevTies + 1); // Actualizar empate solo si no hay ganador
    }
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function newGame(){
    setHistory([Array(9).fill(null)]); 
    setCurrentMove(0);
  }

  function resetGame() {
    setHistory([Array(9).fill(null)]); 
    setCurrentMove(0);
    setPX(0);
    setPO(0);
    setTies(0);
  }

  function findBestMove(squares){
    let bestScore = -Infinity;
    let move = null;
    for(let i = 0;i<9;i++){
      if(!squares[i]){
        squares[i] = 'O';
        const score = minimax(squares, false);
        squares[i]=null;
        if(score>bestScore){
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }

  function minimax(squares, isMaximizing){
    const winner = calculateWinner(squares);
    if (winner === 'O') return 10;
    if (winner === 'X') return -10;
    if (squares.every(square => square !== null)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'O';
          const score = minimax(squares, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'X';
          const score = minimax(squares, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  function pcMove(df){
    const nextSquares = currentSquares.slice(); 

    if(df=='Experto'){
      const bestMove = findBestMove(nextSquares);
      nextSquares[bestMove] = 'O';
      handlePlay(nextSquares);
      return;
    }
    
    if(df=='Difícil'){
      for (let i = 0; i < 9; i++) {
        if (!nextSquares[i]) {
          const cpySquares = nextSquares.slice();
          cpySquares[i] = 'O';
          if (calculateWinner(cpySquares)) {
            handlePlay(cpySquares); 
            return;
          }
        }
      }

      for (let i = 0; i < 9; i++) {
        if (!nextSquares[i]) {
          const cpySquares = nextSquares.slice();
          cpySquares[i] = 'X';
          if (calculateWinner(cpySquares)) {
            nextSquares[i] = 'O'; 
            handlePlay(nextSquares);
            return;
          }
        }
      }
    }

    const emptySquares = nextSquares
      .map((value, index) => (value === null ? index : null))
      .filter(index => index !== null);

    const randomIndex = emptySquares[Math.floor(Math.random() * emptySquares.length)];
    nextSquares[randomIndex] = 'O';
    handlePlay(nextSquares);
  }

  function exitApp() {
    Alert.alert('Salir', '¿Estás seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', onPress: () => BackHandler.exitApp() },
    ]);
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.gameBoard}>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay}  resetGame={resetGame} 
          pcMove={pcMove} df={difficulty} pX = {pX} pO={pO} ties={ties} setPX = {setPX} setPO={setPO} setTies = {setTies}
        />
      </View>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomButton} onPress={newGame}>
        <Image 
            style={styles.tinyLogo}
            source={require('./assets/newGame.png')}
          />
          <Text style={styles.buttonText}>Juego Nuevo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} onPress={() => setModalVisible(true)}>
          <Image 
            style={styles.tinyLogo}
            source={require('./assets/df.png')}
          />      
          <Text style={styles.buttonText}>Cambiar Dificultad</Text>
        </TouchableOpacity>
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecciona Dificultad</Text>
              <TouchableOpacity onPress={() => { setDifficulty('Fácil'); setModalVisible(false); resetGame();}}>
                <Text style={styles.option}>Fácil</Text>
              </TouchableOpacity>            
              <TouchableOpacity onPress={() => { setDifficulty('Difícil'); setModalVisible(false); resetGame();}}>
                <Text style={styles.option}>Difícil</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setDifficulty('Experto'); setModalVisible(false); resetGame();}}>
                <Text style={styles.option}>Experto</Text>
              </TouchableOpacity>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
        <TouchableOpacity style={styles.bottomButton} onPress={exitApp}>
        <Image 
            style={styles.tinyLogo}
            source={require('./assets/exit.png')}
          />
          <Text style={styles.buttonText}>Salir</Text>
        </TouchableOpacity>        
      </View>      
    </View>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Centrado vertical
    alignItems: 'center', // Centrado horizontal
    padding: 20,
  },
  gameBoard: {
    marginBottom: 20,
  },
  boardContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  boardRow: {
    flexDirection: 'row',
  },
  square: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
    margin: 2,
    borderRadius: 5,
  },
  squareText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  status: {
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameInfo: {
    marginTop: 20,
  },
  moveText: {
    fontSize: 16,
    color: '#007BFF',
    marginVertical: 5,
  },

  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  bottomButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  option: {
    fontSize: 18,
    marginVertical: 10,
  },
  text: {
    color: '#000',
    fontWeight: 'bold',
  },
  tinyLogo: {
    width: 40, // Ajusta el ancho según el diseño
    height: 40, // Ajusta la altura según el diseño
    resizeMode: 'contain', // Mantiene la proporción de la imagen
  },

});
