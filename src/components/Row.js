import './Row.scss';

function Row(props) {
    let cells = (<><div className={props.class + "Cell Cell"}>{props.cells.name}</div>
        <div className={props.class + "Cell Cell"}>{props.cells.count}</div>
        <div className={props.class + "Cell Cell"}>{props.cells.date}</div>
        <div className={props.class + "Cell Cell"}>{props.cells.distance}</div></>)

    return (
        <div className={"Row " + props.class}>
            {cells}
        </div>
    );
}

export default Row;
