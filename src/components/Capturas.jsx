import Pieza from "./Pieza";

const Capturas = ({capturas, clase}) => {
    return (
        <ul className={clase}>
            {capturas.map((pieza,i) => (
                <Pieza key={i} pieza={pieza} clase="pieza-capturada" />
            ))}
        </ul>
    )
}

export default Capturas;