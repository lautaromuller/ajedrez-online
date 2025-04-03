import { useState, useRef } from 'react';
import { Chess } from 'chess.js';
import Casilla from './Casilla'
import Capturas from './Capturas';
import './Ajedrez.css';

// Casillas tableros
const filas = ["a", "b", "c", "d", "e", "f", "g", "h"];
const columnas = [1, 2, 3, 4, 5, 6, 7, 8];


function Ajedrez() {
    const chess = useRef(new Chess());
    const [seleccionado, setSeleccionado] = useState(null);
    const [posicion, setPosicion] = useState(() => ConvertirTablero(chess.current.board()));
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
        setPosicion(ConvertirTablero(chess.current.board()));

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
        setPosicion(ConvertirTablero(chess.current.board()));
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
                (resultado.color === 'w' 
                    ? capturasBlancas.current.push(`b${resultado.captured}`) 
                    : capturasNegras.current.push(`w${resultado.captured}`)
                )
            }

            actualizarTablero();
            setSeleccionado(null);
        } catch {
            return
        }
    }

    const handleDrop = (casillaDestino) => {
        if (seleccionado) {
            handleClick(casillaDestino);
        }
    };

    return (
        <>
            <button onClick={reiniciarJuego}>Reiniciar partida</button>
            <button onClick={deshacerMovimiento} disabled={historial.current.length === 0}>Deshacer</button>
            <button onClick={rehacerMovimiento} disabled={movimientosRehechos.current.length === 0}>Rehacer</button>
            <div className='container'>
                {estadoJuego && <h3 className='estado-juego'>{estadoJuego}</h3>}

                <Capturas capturas={capturasBlancas.current} clase="capturas-blancas"/>

                <div className="tablero">
                    {columnas.slice().reverse().map(columna =>
                        filas.slice().reverse().map((fila) => {
                            const casilla = fila + columna;
                            const pieza = posicion[casilla];
                            const esNegro = (columna + filas.indexOf(fila)) % 2 === 0;
                            const esSeleccionado = seleccionado === casilla;

                            return (
                                <Casilla
                                    key={casilla}
                                    casilla={casilla}
                                    pieza={pieza}
                                    esNegro={esNegro}
                                    esSeleccionado={esSeleccionado}
                                    inicioMov={inicioMov}
                                    finalMov={finalMov}
                                    handleDrop={handleDrop}
                                    handleClick={handleClick}
                                />
                            );
                        })
                    )}
                </div>

                <Capturas capturas={capturasNegras.current} clase="capturas-negras"/>
            </div>

            <h2>Turno: {chess.current.turn() === "w" ? "Blancas" : "Negras"}</h2>

            <button onClick={() => setMostrarHistorial(!mostrarHistorial)}>
                {mostrarHistorial ? "Ocultar" : "Mostrar"} 
                historial de movimientos
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


function ConvertirTablero(tablero) {
    return tablero.flat().reduce((acc, pieza, i) => {
        if (pieza) acc["abcdefgh"[i % 8] + (8 - Math.floor(i / 8))] = pieza.color + pieza.type;
        return acc;
    }, {});
}


export default Ajedrez;