import { useState, useRef } from 'react';
import { Chess } from 'chess.js';
import './Tablero.css';
import wp from '../assets/wp.png';
import wr from '../assets/wr.png';
import wn from '../assets/wn.png';
import wb from '../assets/wb.png';
import wq from '../assets/wq.png';
import wk from '../assets/wk.png';
import bp from '../assets/bp.png';
import br from '../assets/br.png';
import bn from '../assets/bn.png';
import bb from '../assets/bb.png';
import bq from '../assets/bq.png';
import bk from '../assets/bk.png';

// Casillas tableros
const filas = ["a", "b", "c", "d", "e", "f", "g", "h"];
const columnas = [1, 2, 3, 4, 5, 6, 7, 8];


function Tablero() {
    const chess = useRef(new Chess());
    const [seleccionado, setSeleccionado] = useState(null);
    const [posicion, setPosicion] = useState(() => convertirTablero(chess.current.board()));
    const [movimientosValidos, setMovimientosValidos] = useState([]);
    const [estadoJuego, setEstadoJuego] = useState("");
    const [capturasBlancas, setCapturasBlancas] = useState([]);
    const [capturasNegras, setCapturasNegras] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [movimientosRehechos, setMovimientosRehechos] = useState([]);

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

    const reiniciarJuego = () => {
        chess.current.reset();
        setPosicion(convertirTablero(chess.current.board()));
        setSeleccionado(null);
        setMovimientosValidos([]);
        setEstadoJuego("");
        setCapturasBlancas([])
        setCapturasNegras([])
        setHistorial([])
    };

    const deshacerMovimiento = () => {
        const ultimoMovimiento = chess.current.undo();
        if (ultimoMovimiento) {
            if (ultimoMovimiento.captured) {
                if (ultimoMovimiento.color == "w") {
                    setCapturasBlancas(capturasBlancas.slice(0, -1))
                } else {
                    setCapturasNegras(capturasNegras.slice(0, -1))
                }
            }
            setMovimientosRehechos([...movimientosRehechos, ultimoMovimiento])
            setPosicion(convertirTablero(chess.current.board()));
            setSeleccionado(null);
            setHistorial(historial.slice(0, -1));
            setMovimientosValidos([]);
        }
    };

    const rehacerMovimiento = () => {
        if (movimientosRehechos.length > 0) {
            const movimiento = movimientosRehechos[movimientosRehechos.length - 1]
            chess.current.move(movimiento)
            setHistorial([...historial, movimiento.san])
            setMovimientosRehechos(movimientosRehechos.slice(0, -1))
            actualizarTablero()
        }
    }

    const handleClick = (casilla) => {
        const pieza = chess.current.get(casilla);

        if (seleccionado === casilla) { // Si la pieza está marcada la desmarcamos
            setSeleccionado(null);
            setMovimientosValidos([]);
        } else if (pieza && pieza.color === chess.current.turn()) { // Seleccionamos una pieza
            setSeleccionado(casilla);
            const posibles = chess.current.moves({ square: casilla, verbose: true }); // Movimientos posibles
            const destinos = posibles.map(m => m.to);
            setMovimientosValidos(destinos);
        } else if (seleccionado) { // Movemos la pieza
            if (movimientosRehechos.length > 0) {
                setMovimientosRehechos([])
            }

            // Movimiento
            const move = {
                from: seleccionado,
                to: casilla,
                promotion: "q", // Si un peón corona
            };

            try {

                const resultado = chess.current.move(move)

                if (!resultado) {
                    console.log("mal")
                    return
                }

                setHistorial((prevHistorial) => [...prevHistorial, resultado.san]);

                // Guardamos capturas
                if (resultado.captured) {
                    if (resultado.color === 'w') {
                        setCapturasBlancas([...capturasBlancas, resultado.captured]);
                    } else {
                        setCapturasNegras([...capturasNegras, resultado.captured]);
                    }
                }

                actualizarTablero();
                setSeleccionado(null);
                setMovimientosValidos([]);
            } catch {
                console.log("Movimiento no valido")
            }
        }
    };

    return (
        <>
            <button onClick={reiniciarJuego}>Reiniciar partida</button>
            <button onClick={deshacerMovimiento} disabled={historial.length === 0}>Deshacer</button>
            <button onClick={rehacerMovimiento} disabled={movimientosRehechos.length === 0}>Rehacer</button>
            <div className='container'>
                <ul className='capturas-blancas'>
                    {capturasBlancas.map((pieza, index) => <li key={index} >{obtenerSimbolo(`b${pieza}`, "pieza-capturada")}</li>)}
                </ul>
                <ul className='capturas-negras'>
                    {capturasNegras.map((pieza, index) => <li key={index} >{obtenerSimbolo(`w${pieza}`, "pieza-capturada")}</li>)}
                </ul>
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
                                    className={`casilla ${esNegro ? "negro" : "blanco"} ${esSeleccionado ? 'seleccionado' : ''} ${movimientosValidos.includes(casilla) ? 'resaltado' : ''}`}
                                    onClick={() => handleClick(casilla)}
                                >
                                    {pieza && <span className="pieza">{obtenerSimbolo(pieza, "pieza-imagen")}</span>}
                                </div>
                            );
                        })
                    )}
                </div>

            </div>
            <h2>Turno: {chess.current.turn() === "w" ? "Blancas" : "Negras"}</h2>
            <h3>{estadoJuego}</h3>
            <div className='historial-container'>
                <h4>Historial de movimientos</h4>
                <div className='historial'>{historial.map((move) => <span>{move}, </span>)}</div>
            </div>
        </>
    );
}

function obtenerSimbolo(pieza, clase) {
    const simbolos = {
        wp: wp, wr: wr, wn: wn, wb: wb, wq: wq, wk: wk,
        bp: bp, br: br, bn: bn, bb: bb, bq: bq, bk: bk,
    };
    return <img src={simbolos[pieza]} alt={pieza} className={clase} />;
}

function convertirTablero(tablero) {
    const nuevo = {};
    for (let i = 0; i < tablero.length; i++) {
        for (let j = 0; j < tablero[i].length; j++) {
            const pieza = tablero[i][j];
            const casilla = "abcdefgh"[j] + (8 - i);
            nuevo[casilla] = pieza ? pieza.color + pieza.type : null;
        }
    }
    return nuevo;
}

export default Tablero;