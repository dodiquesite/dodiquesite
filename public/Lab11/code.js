var resultTable = document.getElementById('result-table');

main();

function main() {
    var n;
    var numbers;

    while(true) {
        let nStr = prompt('Введите натуральное число n');
        n = parseInt(nStr);
        if (Number.isNaN(n) || n < 1)
            alert("Введённое число некорректно, введите ещё раз");
        else
            break;
    }

    inputLoop: while(true) {
        let numbersStr = prompt('Введите последовательность действительных чисел через запятую');
        numbers = numbersStr.split(',').map(element => Number(element));
        if (numbers.length !== n) {
            alert("Размер последовательности не равен n!");
            continue;
        }
        for (let num of numbers)
            if (Number.isNaN(num)) {
                alert("Неверно введенная последовательность! Введите ещё раз");
                continue inputLoop;
            }

        break;
    }

    for (let num of sumSequenceGen(numbers)) {
        addNumberToTable(num);
    }

    console.log(n, numbers);
}

/** Функция-генератор, принимает массив чисел и последовательно возвращает сумму элементов от a_0 до a_i */
function* sumSequenceGen(numbers) {
    // В цикле проходимся от 0 до размера массива
    for (let i = 0; i < numbers.length; i++) {
        // берём под массив от 0 до i, и считаем сумму для всех элементов используя reduce
        yield numbers.slice(0, i+1).reduce((acc, val) => acc + val);
    }
}

/** Функция для добавления числа в таблицу на страничке */
function addNumberToTable(n) {
    var tr = resultTable.insertRow();
    var td = tr.insertCell();
    td.innerHTML = `<b>${tr.rowIndex}</b>: ${n}`;
}