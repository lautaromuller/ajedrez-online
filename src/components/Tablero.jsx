import { useState, useRef } from 'react';
import { Chess } from 'chess.js';
import './Tablero.css';

//Casillas tableros
const filas = ["a", "b", "c", "d", "e", "f", "g", "h"];
const columnas = [1, 2, 3, 4, 5, 6, 7, 8];

function Tablero() {
    
    const [seleccionado, setSeleccionado] = useState(null)
    const chess = useRef(new Chess());
    const [posicion, setPosicion] = useState(() => convertirTablero(chess.current.board()));

    const handleClick = (casilla) => {

        if(seleccionado){
            if(seleccionado === casilla){ //Si está marcada se desmarca
                setSeleccionado(null)
                return
            }

            const move = {
                from: seleccionado,
                to: casilla,
                promotion: "q", //Si un peón llega al final
            }

            const resultado = chess.current.move(move)

            if (resultado) {
                // Actualizamos el estado del tablero
                setPosicion(convertirTablero(chess.current.board()));
                setSeleccionado(null);
              }
        } else{
            console.log(posicion[casilla].split('')[0],chess.current.turn())
            if(posicion[casilla] && posicion[casilla].split('')[0] == chess.current.turn()){
                setSeleccionado(casilla)
            }
        }
    }

    return (
        <>
        <div className="tablero">
            {columnas.map(columna =>
                filas.map((fila) => {
                    const casilla = fila + columna;
                    const pieza = posicion[casilla];
                    const esNegro = (columna + filas.indexOf(fila)) % 2 === 0;
                    const esSeleccionado = seleccionado === casilla;

                    return (
                        <div 
                        key={casilla} 
                        className={`casilla ${esNegro ? "negro" : "blanco"} ${esSeleccionado ? 'seleccionado' : ''}`}
                        onClick={() => handleClick(casilla)}
                        >
                            {pieza && <span className="pieza">{obtenerSimbolo(pieza)}</span>}
                        </div>
                    )
                })
            )}
        </div>
        <h2>Turno: {chess.current.turn() === "w" ? "Blancas" : "Negras"}</h2>
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
    return tablero.reduce((acc, fila, i) => {
        fila.forEach((pieza, j) => {
            if (pieza) {
                const casilla = "abcdefgh"[j] + (8 - i);
                acc[casilla] = pieza.color + pieza.type;
            }
        });
        return acc;
    }, {});
}

export default Tablero