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

    const reiniciarJuego = () => {
        chess.current.reset();
        setPosicion(convertirTablero(chess.current.board()));
        setSeleccionado(null);
        setMovimientosValidos([]);
        setEstadoJuego("");
    };

    const handleClick = (casilla) => {
        if (seleccionado) {
            if (seleccionado === casilla) { //Si está marcada la desmarcamos
                setSeleccionado(null)
                setMovimientosValidos([])
                return
            }

            const move = {
                from: seleccionado,
                to: casilla,
                promotion: "q", //Si un peón llega al final
            }

            const resultado = chess.current.move(move)

            if (resultado) {
                // Verificamos estado de juego
                if (chess.current.isCheckmate()) {
                    setEstadoJuego("¡Jaque mate!");
                } else if (chess.current.isCheck()) {
                    setEstadoJuego("¡Jaque!");
                } else {
                    setEstadoJuego("");
                }

                // Actualizamos el estado del tablero
                setPosicion(convertirTablero(chess.current.board()))

                setSeleccionado(null)
                setMovimientosValidos([])
            }
        } else {
            const pieza = chess.current.get(casilla);

            if (pieza && pieza.color == chess.current.turn()) {
                setSeleccionado(casilla)
                const posibles = chess.current.moves({ square: casilla, verbose: true }) //Movimientos posibles
                const destinos = posibles.map(m => m.to)
                setMovimientosValidos(destinos)
            }
        }
    }

    return (
        <>
            <button onClick={reiniciarJuego}>Reiniciar partida</button>
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