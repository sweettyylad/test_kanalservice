import './Table.scss';
import Row from './Row'
import {useEffect, useState} from "react";

const isEmp = (str) => !str.trim().length; // Проверка строки на пустоту
const gVal = (id) => typeof id === 'string' ? document.getElementById(id).value : id.value // Получение значение из элемента
function ObjsToJSX(objs) {
    return objs.map(e => <Row key={e._id} class="Content" cells={e}/>)
} // Перевод полученных данных в табличные строки
function toGoodDate(str) {
    let date = str.split(/\./);
    return [date[1], date[0], date[2]].join('.')
} // Перевод даты из 'dd.mm.yy' в 'mm.dd.yy'
async function getData() {
    return await fetch('http://127.0.0.1:7000/info')
        .then(r => r.json())
        .then(d => d)
} // Получение данных с сервера
function Table() {
    // Вспомогательные наборы для отображения состояний сортировки
    const icons = new Map();
    icons.set('nw', '&#8195;');
    icons.set('ba', '&#8595;');
    icons.set('bd', '&#8593;');
    const names = new Map();
    names.set('distance', 'Расстояние');
    names.set('count', 'Количество');
    names.set('name', 'Название');

    const [global, setGlobal] = useState([]) // Хранит данные в первоначальном виде
    const [data, setData] = useState([]) // Отображаемое хранилище
    const [page, setPage] = useState(1) // Без комментариев
    const [buffer, setBuffer] = useState([]) // Хранит первоначальные данные для перехода к несортированному состоянию

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

    // Сброс сортировки
    function resetSort() {
        Array.from(document.getElementsByClassName('Sort')).forEach(e => {
            e.dataset.sort = 'nw'
        })
        Array.from(document.getElementsByClassName('Sort')).forEach(e => {
            e.innerHTML = names.get(e.dataset.tag) + ' ' + icons.get(e.dataset.sort)
        })
    }

    // Сброс фильтров
    function reset() {
        document.getElementById('name').value = ''
        resetSort()
        setData([...global])
    }

    // Сортировка по одному из столбцов
    function sort(e) {
        let column = e.target.closest('.HeaderCell')
        // Порядок сортировки nw(no way) -> ba(by ascending) -> bd(by decreasing) -> nw...
        let type = column.dataset.sort === 'nw' ? 'ba' : (column.dataset.sort === 'ba') ? 'bd' : 'nw'

        Array.from(document.getElementsByClassName('Sort')).forEach(e => {
            e.dataset.sort = 'nw'
        })
        column.dataset.sort = type
        Array.from(document.getElementsByClassName('Sort')).forEach(e => {
            e.innerHTML = names.get(e.dataset.tag) + ' ' + icons.get(e.dataset.sort)
        })
        // Для отфильтрованных данных
        // Если выходим из состояния no way, сохраняем в исходном виде
        if (column.dataset.sort === 'ba') {
            setBuffer([...data])
        }
        // При возвращении в состояние no way возвращаем в исходный вид
        if (column.dataset.sort === 'nw') {
            setData([...buffer]);
            return;
        }

        // В любом другом случае сортируем данные
        setData([...data.sort((prev, next) => {
            if (prev[column.dataset.tag] < next[column.dataset.tag]) return type === 'ba' ? -1 : 1;
            if (prev[column.dataset.tag] > next[column.dataset.tag]) return type === 'ba' ? 1 : -1;
        })])
    }

    // Фильтрация
    function filter() {
        resetSort()
        let [val, col] = [document.getElementById('name'), document.getElementById('column')]
        if (!isEmp(gVal(val))) {
            switch (gVal('column')) {
                // При фильтрации имени сравниваем строки, наличие подстрок и размеры строк
                case 'name':
                    switch (gVal('req')) {
                        case 'incl':
                            setData(global.filter((e) => e.name.toLowerCase().includes(gVal('name').trim().toLowerCase())));
                            break;
                        case 'equl':
                            setData(global.filter((e) => e.name.toLowerCase() === gVal('name').trim().toLowerCase()));
                            break;
                        case 'bigg':
                            setData(global.filter((e) => e.name.length > gVal('name').trim().length));
                            break;
                        case 'less':
                            setData(global.filter((e) => e.name.length < gVal('name').trim().length));
                            break;
                        default:
                            break;
                    }
                    break;
                // При фильтрации чисел сравниваем подстроки, либо сами числа
                case 'count':
                case 'distance':
                    switch (gVal('req')) {
                        case 'incl':
                            setData(global.filter((e) => (e[gVal(col)] + '').includes(gVal('name').trim())));
                            break;
                        case 'equl':
                            setData(global.filter((e) => e[gVal(col)] * 1 === gVal('name').trim() * 1));
                            break;
                        case 'bigg':
                            setData(global.filter((e) => e[gVal(col)] > gVal('name').trim()));
                            break;
                        case 'less':
                            setData(global.filter((e) => e[gVal(col)] < gVal('name').trim()));
                            break;
                        default:
                            break;
                    }
                    break;
                // При фильтрации дат сравниваем подстроки, либо переводим в формат Дата и сравниваем в миллисекундах
                case 'date':
                    let date
                    switch (gVal('req')) {
                        case 'incl':
                            setData(global.filter((e) => (e[gVal(col)] + '').includes(gVal('name').trim())));
                            break;
                        case 'equl':
                            setData(global.filter((e) => e[gVal(col)] === gVal('name').trim()));
                            break;
                        case 'bigg':
                            date = new Date(gVal('name').trim())
                            // Проверка на Invalid Date
                            if (isNaN(date.getTime())) {
                                return
                            }
                            setData(global.filter((e) => new Date(toGoodDate(e[gVal(col)])).getTime() > date.getTime()));
                            break;
                        case 'less':
                            date = new Date(gVal('name').trim())
                            if (isNaN(date.getTime())) {
                                return
                            }
                            setData(global.filter((e) => new Date(toGoodDate(e[gVal(col)])).getTime() < date.getTime()));
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    alert('Неизвестная ошибка!');
                    break;
            }
            setPage(1)
        } else {
            alert('Заполните поля!')
        }
    }

    return (
        <div className="Table">
            <div className="Row Header">
                <div className="HeaderCell Cell Sort" data-sort="nw" data-tag="name" onClick={sort}>Название</div>
                <div className="HeaderCell Cell Sort" data-sort="nw" data-tag="count" onClick={sort}>Количество</div>
                <div className="HeaderCell Cell" data-tag="date">Дата</div>
                <div className="HeaderCell Cell Sort" data-sort="nw" data-tag="distance" onClick={sort}>Расстояние</div>
            </div>
            <div className="Body">
                {ObjsToJSX(data.slice(7 * (page - 1), 7 * page)) /* Отображаем 7 записей текущей страницы */}
            </div>
            <div className="Row Pagination">
                {/* Пагинация */}
                <button onClick={() => {
                    setPage(page => page === 1 ? 1 : page - 1)
                }}>&#60;&#60;</button>

                {page + '/' + Math.ceil(data.length / 7)}

                <button onClick={() => {
                    setPage(page => page < Math.ceil(data.length / 7) ? page + 1 : page)
                }}>&#62;&#62;</button>
            </div>
            <div className="Filter">
                <h3>Фильтрация</h3>
                <select name="column" id="column">
                    <option value="name">Название</option>
                    <option value="count">Количество</option>
                    <option value="date">Дата</option>
                    <option value="distance">Расстояние</option>
                </select>
                <select name="req" id="req">
                    <option value="equl">Равно</option>
                    <option value="incl">Содержит</option>
                    <option value="bigg">Больше</option>
                    <option value="less">Меньше</option>
                </select>
                <input placeholder="Значение для фильтра" type="text" name="name" id="name"/>
                <input type="button" value="Отфильтровать" onClick={filter}/>
                <input type="button" value="Сброс" onClick={reset}/>

            </div>
        </div>
    );
}

export default Table;
