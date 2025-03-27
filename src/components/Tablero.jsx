import { useState, useRef } from 'react';
import { Chess } from 'chess.js';
import './Tablero.css';

//Casillas tableros
const filas = ["a", "b", "c", "d", "e", "f", "g", "h"];
const columnas = [1, 2, 3, 4, 5, 6, 7, 8];

function Tablero() {

    const chess = useRef(new Chess());
    const [seleccionado, setSeleccionado] = useState(null)
    const [posicion, setPosicion] = useState(() => convertirTablero(chess.current.board()))
    const [movimientosValidos, setMovimientosValidos] = useState([])
    const [estadoJuego, setEstadoJuego] = useState("")
    const [capturasBlancas, setCapturasBlancas] = useState([])
    const [capturasNegras, setCapturasNegras] = useState([])
    const [historial, setHistorial] = useState([])

    const actualizarTablero = () => {
        setPosicion(convertirTablero(chess.current.board()));

        // Estado de juego
        if (chess.current.isCheckmate()) {
            setEstadoJuego("¡Jaque mate!");
        } else if (chess.current.isCheck()) {
            setEstadoJuego("¡Jaque!");
        } else {
            setEstadoJuego("");
        }
    };

    const obtenerMovimientoIA = async () => {
        const token = "lip_kcngFbJxCXwSAzcmPjMa";
    
        const response = await fetch('https://lichess.org/api/user/lautaro-muller-01', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fen: chess.current.fen(),
            depth: 15, // Profundidad de búsqueda
          }),
        });
    
        const data = await response.json();
        const bestMove = data.bestMove;
        // Aplicamos el movimiento sugerido por la IA
        chess.current.move({ from: bestMove.slice(0, 2), to: bestMove.slice(2, 4), promotion: "q" });
        actualizarTablero();
      };

    const reiniciarJuego = () => {
        chess.current.reset();
        setPosicion(convertirTablero(chess.current.board()));
        setSeleccionado(null);
        setMovimientosValidos([]);
        setEstadoJuego("");
    };

    const deshacerMovimiento = () => {
        chess.current.undo()
        setPosicion(convertirTablero(chess.current.board()))
        setSeleccionado(null)
        setHistorial(historial.slice(0, -1))
        setMovimientosValidos([])
    }

    const handleClick = (casilla) => {
        const pieza = chess.current.get(casilla);

        if (seleccionado === casilla) { //Si la pieza está marcada la desmarcamos
            setSeleccionado(null)
            setMovimientosValidos([])
        }
        else if (pieza && pieza.color == chess.current.turn()) { // Seleccionamos una pieza
            setSeleccionado(casilla)
            const posibles = chess.current.moves({ square: casilla, verbose: true }) //Movimientos posibles
            const destinos = posibles.map(m => m.to)
            setMovimientosValidos(destinos)
        }
        else { // Movemos la pieza
            //Movimiento
            const move = {
                from: seleccionado,
                to: casilla,
                promotion: "q", //Si un peón corona
            }

            const resultado = chess.current.move(move)

            if (resultado) {
                setHistorial([...historial, resultado.san])

                // Guardamos capturas
                if (resultado.captured) {
                    if (resultado.color === 'w') {
                        setCapturasBlancas([...capturasBlancas, resultado.captured])
                    } else {
                        setCapturasNegras([...capturasNegras, resultado.captured])
                    }
                }

                actualizarTablero();
                setSeleccionado(null);
                setMovimientosValidos([]);

                // Llamamos a la IA
                setTimeout(() => {
                    obtenerMovimientoIA();
                }, 500);
            }
        }
    }

    return (
        <>
            <button onClick={reiniciarJuego}>Reiniciar partida</button>
            <button onClick={deshacerMovimiento}>Deshacer</button>
            <div className="tablero">
                {columnas.map(columna =>
                    filas.map((fila) => {
                        const casilla = fila + columna
                        const pieza = posicion[casilla]
                        const esNegro = (columna + filas.indexOf(fila)) % 2 === 0
                        const esSeleccionado = seleccionado === casilla

                        return (
                            <div
                                key={casilla}
                                className={`casilla ${esNegro ? "negro" : "blanco"} ${esSeleccionado ? 'seleccionado' : ''} ${movimientosValidos.includes(casilla) ? 'resaltado' : ''}`}
                                onClick={() => handleClick(casilla)}
                            >
                                {pieza && <span className="pieza">{obtenerSimbolo(pieza)}</span>}
                            </div>
                        )
                    })
                )}
            </div>
            <h2>Turno: {chess.current.turn() === "w" ? "Blancas" : "Negras"}</h2>
            <h3>{estadoJuego}</h3>
            <div className='capturas'>
                <div className='capturas-blancas'>
                    <h4>Capturas blancas</h4>
                    {capturasBlancas.map((pieza, index) => <span key={index}>{obtenerSimbolo(`b${pieza}`)}</span>)}
                </div>
                <div className='capturas-negras'>
                    <h4>Capturas negras</h4>
                    {capturasNegras.map((pieza, index) => <span key={index}>{obtenerSimbolo(`w${pieza}`)}</span>)}
                </div>
            </div>
            <div className='hitorial'>
                <h4>Historial de movimientos</h4>
                <ul>{historial.map((movimiento, index) => <li key={index}>{movimiento}</li>)}</ul>
            </div>
        </>
    )
}

function obtenerSimbolo(pieza) {
    const simbolos = {
        wp: "♙", wr: "♖", wn: "♘", wb: "♗", wq: "♕", wk: "♔",
        bp: "♟", br: "♜", bn: "♞", bb: "♝", bq: "♛", bk: "♚",
    };
    return simbolos[pieza];
}

function convertirTablero(tablero) {
    const nuevo = {}
    for (let i = 0; i < tablero.length; i++) {
        for (let j = 0; j < tablero[i].length; j++) {
            const pieza = tablero[i][j];
            const casilla = "abcdefgh"[j] + (8 - i);
            nuevo[casilla] = pieza ? pieza.color + pieza.type : null;
        }
    }
    return nuevo;
}

export default Tablero