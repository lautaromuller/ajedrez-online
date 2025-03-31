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
    const [estadoJuego, setEstadoJuego] = useState(null);
    const capturasBlancas = useRef([]);
    const capturasNegras = useRef([]);
    const historial = useRef([]);
    const movimientosRehechos = useRef([]);

    const [inicioMov, setInicioMov] = useState(null)
    const [finalMov, setFinalMov] = useState(null)
    const [ultimosMovimientos, setUltimosMovimientos] = useState([])
    const [mostrarHistorial, setMostrarHistorial] = useState(false)

    const actualizarTablero = () => {
        setPosicion(convertirTablero(chess.current.board()));

        // Estado de juego
        if (chess.current.isCheckmate()) {
            setEstadoJuego("¡Jaque mate!");
        } else if (chess.current.isCheck()) {
            setEstadoJuego("¡Jaque!");
        }

        setTimeout(() => {
            setEstadoJuego(null);
        }, 400)
    };

    const reiniciarJuego = () => {
        chess.current.reset();
        setPosicion(convertirTablero(chess.current.board()));
        setSeleccionado(null);
        setEstadoJuego("");
        capturasBlancas.current = []
        capturasNegras.current = []
        historial.current = []
        movimientosRehechos.current = []
        setUltimosMovimientos([])
    };

    const deshacerMovimiento = () => {
        const ultimoMov = chess.current.undo();
        if (!ultimoMov) return

        if (ultimoMov.captured) {
            (ultimoMov.color === "w" ? capturasBlancas : capturasNegras).current.pop()
        }

        movimientosRehechos.current.push(ultimoMov)
        setUltimosMovimientos((prev) => prev.slice(0, -1));

        const nuevosMovimientos = ultimosMovimientos.slice(0, -1);

        if (nuevosMovimientos.length > 0) {
            setInicioMov(nuevosMovimientos.at(-1)[0]);
            setFinalMov(nuevosMovimientos.at(-1)[1]);
        } else {
            setInicioMov(null);
            setFinalMov(null);
        }

        historial.current.pop()
        actualizarTablero()
    }

    const rehacerMovimiento = () => {
        if (movimientosRehechos.current.length === 0) return

        const movimiento = movimientosRehechos.current.pop();
        const resultado = chess.current.move(movimiento);
        if (!resultado) return;

        // Establecer las casillas a marcar
        setInicioMov(movimiento.from);
        setFinalMov(movimiento.to);
        setUltimosMovimientos([...ultimosMovimientos, [movimiento.from, movimiento.to]]);

        // Actualizar historial
        historial.current.push(resultado.san);

        actualizarTablero();
    }

    const handleClick = (casilla) => {
        if (seleccionado === casilla) { // Si la pieza está marcada la desmarcamos
            setSeleccionado(null);
            return
        }

        const pieza = chess.current.get(casilla);
        if (pieza && pieza.color === chess.current.turn()) { // Seleccionamos una pieza
            setSeleccionado(casilla);
            return
        }

        if (!seleccionado) return

        if (movimientosRehechos.current.length > 0) {
            movimientosRehechos.current = []
        }

        // Movimiento
        const move = { from: seleccionado, to: casilla, promotion: "q" };

        try {
            const resultado = chess.current.move(move)

            if (!resultado) return

            setInicioMov(seleccionado)
            setFinalMov(casilla)
            setUltimosMovimientos([...ultimosMovimientos, [seleccionado, casilla]])

            historial.current.push(resultado.san);

            // Guardamos capturas
            if (resultado.captured) {
                (resultado.color === 'w' ? capturasBlancas : capturasNegras).current.push(resultado.captured)
            }

            actualizarTablero();
            setSeleccionado(null);
        } catch {
            return
        }
    }

    return (
        <>
            <button onClick={reiniciarJuego}>Reiniciar partida</button>
            <button onClick={deshacerMovimiento} disabled={historial.current.length === 0}>Deshacer</button>
            <button onClick={rehacerMovimiento} disabled={movimientosRehechos.current.length === 0}>Rehacer</button>
            <div className='container'>
                {estadoJuego && <h3 className='estado-juego'>{estadoJuego}</h3>}

                <ul className='capturas-blancas'>
                    {capturasBlancas.current.map((pieza, index) => (
                        <li key={index} >{obtenerSimbolo(`b${pieza}`, "pieza-capturada")}</li>
                    ))}
                </ul>

                <div className="tablero">
                    {columnas.slice().reverse().map(columna =>
                        filas.slice().reverse().map((fila) => {
                            const casilla = fila + columna;
                            const pieza = posicion[casilla];
                            const esNegro = (columna + filas.indexOf(fila)) % 2 === 0;
                            const esSeleccionado = seleccionado === casilla;

                            return (
                                <div
                                    key={casilla}
                                    className={`casilla 
                                    ${esNegro ? "negro" : "blanco"} 
                                    ${inicioMov === casilla || esSeleccionado ? "casilla-inicio" : ""} 
                                    ${finalMov === casilla ? "casilla-final" : ""}`}
                                    onClick={() => handleClick(casilla)}
                                >
                                    {pieza && <span className="pieza">{obtenerSimbolo(pieza, "pieza-imagen")}</span>}
                                </div>
                            );
                        })
                    )}
                </div>

                <ul className='capturas-negras'>
                    {capturasNegras.current.map((pieza, index) => (
                        <li key={index} >{obtenerSimbolo(`w${pieza}`, "pieza-capturada")}</li>
                    ))}
                </ul>
            </div>

            <h2>Turno: {chess.current.turn() === "w" ? "Blancas" : "Negras"}</h2>

            <button onClick={() => setMostrarHistorial(!mostrarHistorial)}>
                {mostrarHistorial ? "Ocultar" : "Mostrar"} historial de movimientos
            </button>

            {mostrarHistorial && (
                <table className="historial">
                    <tbody>
                        {historial.current.map((move, i) => (
                            i % 2 === 0 ? (
                                <tr key={i / 2}>
                                    <td>{Math.floor(i / 2) + 1}</td>
                                    <td>{move}</td>
                                    <td>{historial.current[i + 1] || ""}</td>
                                </tr>
                            ) : null
                        ))}
                    </tbody>
                </table>
            )}
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
    return tablero.flat().reduce((acc, pieza, i) => {
        if (pieza) acc["abcdefgh"[i % 8] + (8 - Math.floor(i / 8))] = pieza.color + pieza.type;
        return acc;
    }, {});
}

export default Tablero;