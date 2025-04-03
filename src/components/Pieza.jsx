import { useDrag } from "react-dnd";
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

const Pieza = ({ pieza, clase }) => {

    const [{ isDragging }, drag] = useDrag(() => ({
        type: "PIEZA",
        item: { pieza },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <img
            ref={drag}
            src={ObtenerImagen(pieza)}
            alt={pieza}
            className={clase}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        />
    );
};

function ObtenerImagen(pieza) {
    const simbolos = {
        wp, wr, wn, wb, wq, wk,
        bp, br, bn, bb, bq, bk,
    };
    return simbolos[pieza] || "";
}

export default Pieza;