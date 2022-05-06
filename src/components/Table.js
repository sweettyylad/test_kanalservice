import './Table.scss';
import Row from './Row'
import {useEffect, useState} from "react";

const isEmp = (str) => !str.trim().length;
const gVal = (id) => document.getElementById(id).value
function ObjsToJSX(objs){
    return objs.map(e => <Row key = {e._id} class = "Content" cells ={e}/>)
}
async function getData(){
    return await fetch('http://127.0.0.1:7000/info')
        .then(r => r.json())
        .then(d => d)
}
function Table() {

    const [global, setGlobal] = useState([])
    const [data, setData] = useState([])
    const [page, setPage] = useState(1)

    useEffect(() => {
        getData().then(d => d).then(r => {
            setGlobal(r.inf)
        })
    }, [])
    useEffect(() => {
        setData(global)
        setPage(1)
    }, [global])

    function sort(e){
        document.getElementsByClassName('HeaderCell')
        console.log(e.target.closest('.HeaderCell').classList.add('active'))
    }

    return (
        <div className="Table">
            <div className="Filter">
                <h3>Фильтрация</h3>
                <select name="column" id="column">
                    <option value = "name">Название</option>
                    <option value = "count">Количество</option>
                    <option value = "date">Дата</option>
                    <option value = "distance">Расстояние</option>
                </select>
                <select name="req" id="req">
                    <option value = "equl">Равно</option>
                    <option value = "incl">Содержит</option>
                    <option value = "bigg">Больше</option>
                    <option value = "less">Меньше</option>
                </select>
                <input placeholder="Значение для фильтра" type="text" name="name" id="name"/>
                <input type="button" value="Отфильтровать" onClick={() => {
                    if(!isEmp(gVal('name'))){
                        switch (gVal('column')){
                            case 'name':
                                switch(gVal('req')){
                                    case 'incl': setData(global.filter((e) => e.name.toLowerCase().includes(gVal('name').trim().toLowerCase()))); break;
                                    case 'equl': setData(global.filter((e) => e.name.toLowerCase() === gVal('name').trim().toLowerCase()));break;
                                    default: ;break;
                                }
                                break;
                            default: alert('Неизвестная ошибка!');break;
                        }
                        setPage(1)
                    }else{
                        alert('Заполните поля!')
                    }
                }}/>
                <input type="button" value="Сброс" onClick={() => {setData(global); document.getElementById('name').value = ''}}/>

            </div>
            <div className="Row Header">
                <div className="HeaderCell Cell Sort" data-tag = "name" onClick={sort}>Название</div>
                <div className="HeaderCell Cell Sort" data-tag = "count" onClick={sort}>Количество</div>
                <div className="HeaderCell Cell" data-tag = "date">Дата</div>
                <div className="HeaderCell Cell Sort" data-tag = "distance" onClick={sort}>Расстояние</div>
            </div>
            <div className="Body">
                {ObjsToJSX(data.slice(7*(page-1),7*page))}
            </div>
            <div className="Row Pagination">
                <button onClick={() => {setPage(page => page === 1 ? 1 : page-1)}}>&#60;&#60;</button>{page+'/'+Math.ceil(data.length/7)}<button onClick={() => {setPage(page => page < Math.ceil(data.length/7) ? page+1 : page)}}>&#62;&#62;</button>
            </div>
        </div>
    );
}

export default Table;
