import './Table.scss';
import Row from './Row'
import {useEffect, useState} from "react";

const isEmp = (str) => !str.trim().length; // Проверка строки на пустоту
const gVal = (id) => document.getElementById(id).value // Получение значение из элемента
function ObjsToJSX(objs){
    return objs.map(e => <Row key = {e._id} class = "Content" cells ={e}/>)
} // Перевод полученных данных в табличные строки
async function getData(){
    return await fetch('http://127.0.0.1:7000/info')
        .then(r => r.json())
        .then(d => d)
} // Получение данных с сервера
function Table() {

    const [global, setGlobal] = useState([]) // Хранит данные в первоначальном виде
    const [data, setData] = useState([]) // Отображаемое хранилище
    const [page, setPage] = useState(1) // Без комментариева


    // Тут получаем данные с сервера при перевичном рендере
    useEffect(() => {
        getData().then(d => d).then(r => {
            setGlobal(r.inf)
        })
    }, [])

    // Тут обновляем отображаемые данные, если первоначальные менялись
    useEffect(() => {
        setData([...global])
        setPage(1)
    }, [global])

    // Сброс фильтров
    function reset() {
        setData(global); document.getElementById('name').value = ''
    }

    // Сортировка по одному из столбцов
    function sort(e){
        let column = e.target.closest('.HeaderCell')
        let type = column.dataset.sort === 'nw' ? 'ba' : (column.dataset.sort === 'ba') ? 'bd' : 'nw'

        const icons = new Map(); icons.set('nw', '&#8195;');icons.set('ba', '&#8595;');icons.set('bd', '&#8593;');
        const names = new Map(); names.set('distance', 'Расстояние');names.set('count', 'Количество');names.set('name', 'Название');

        Array.from(document.getElementsByClassName('Sort')).forEach(e => {
            e.dataset.sort = 'nw'
        })
        column.dataset.sort = type
        Array.from(document.getElementsByClassName('Sort')).forEach(e => {
            e.innerHTML = names.get(e.dataset.tag) + ' ' + icons.get(e.dataset.sort)
            console.log(e.innerHTML)
        })
        if(column.dataset.sort === 'nw'){
            setData([...global]);
            return;
        }

        // console.log()
        // setData(data.sort((prev,next) => prev[column.dataset.tag] - next[column.dataset.tag]))

        setData([...data.sort((prev, next) => {
            if ( prev[column.dataset.tag] < next[column.dataset.tag] ) return type === 'ba' ? -1 : 1;
            if ( prev[column.dataset.tag] > next[column.dataset.tag] ) return type === 'ba' ? 1 : -1;
        })])

        console.log(data)
    }

    // Фильтрация
    function filter(){
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
                <input type="button" value="Отфильтровать" onClick={filter}/>
                <input type="button" value="Сброс" onClick={reset}/>

            </div>
            <div className="Row Header">
                <div className="HeaderCell Cell Sort" data-sort = "nw" data-tag = "name" onClick={sort}>Название</div>
                <div className="HeaderCell Cell Sort" data-sort = "nw" data-tag = "count" onClick={sort}>Количество</div>
                <div className="HeaderCell Cell" data-tag = "date">Дата</div>
                <div className="HeaderCell Cell Sort" data-sort = "nw" data-tag = "distance" onClick={sort}>Расстояние</div>
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
