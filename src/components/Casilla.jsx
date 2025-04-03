import { useDrop } from "react-dnd";
import Pieza from './Pieza'

const Casilla = ({ casilla, pieza, esNegro, esSeleccionado, inicioMov, finalMov, handleDrop, handleClick}) => {
    const [{ isOver }, drop] = useDrop({
        accept: "PIEZA",
        drop: () => handleDrop(casilla),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    });

    return (
        <div
            ref={drop}
            className={`casilla ${esNegro ? "negro" : "blanco"}
            ${inicioMov === casilla || esSeleccionado ? 'casilla-inicio' : ''} 
            ${finalMov === casilla ? 'casilla-final' : ''}
            ${isOver ? "resaltado" : ""}`}
            onMouseDown={() => handleClick(casilla)}
        >
            {pieza && <Pieza pieza={pieza} clase="pieza-imagen" />}
        </div>
    );
};

export default Casilla;