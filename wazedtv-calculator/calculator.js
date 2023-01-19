"use strict";

/**
 * Переменной "wazedTvCalculator" присваивается функция для того, чтобы скрыть все её переменные и вложенные функции
 * из глобальной области видимости.
 */
let wazedTvCalculator = function(elementId) {
    /**
     * Элемент калькулятора
     * @type HTMLElement
     */
    let calculatorEl;

    /**
     * Элемент "результата" для вывода
     * @type HTMLElement
     */
    let resultEl;

    /**
     * Массив элементов кнопок
     * @type {HTMLElement[]}
     */
    let buttonEls;

    /**
     * Список операций
     * @type {string[]}
     */
    let operations = ['÷', '×', '+', '-'];

    /**
     * В массиве "operands" хранятся операнды.
     *
     * Под индексом "0" первый операнд.
     * Под индексом "1" второй операнд.
     *
     * @type {Object} operands
     */
    let operands = ['', ''];

    /**
     * Хранит введённую команду. Командой являются все кнопки, кроме операций +, -, *, /
     * @type {string}
     */
    let command = '';

    /**
     * Хранит введённую операцию. Операцией являются +, -, *, /
     * @type {string}
     */
    let operation = '';

    /**
     * Хранит строку для вывода по умолчанию, когда калькулятор ничего не отображает
     * @type {string}
     */
    let defaultOutput = 'Результат';

    /**
     * Инициализирует переменные, хранящих ссылку на объекты html элементов и добавляет обработчик события
     * на кнопки калькулятора.
     *
     * @param {String} elementId ID элемента калькулятора
     */
    function init(elementId) {
        // Получение ссылок на объекты html-элементов
        calculatorEl = document.getElementById(elementId);
        resultEl = calculatorEl.getElementsByClassName('result')[0];
        buttonEls = Array.from(calculatorEl.getElementsByClassName('button'));

        // Назначаем каждой кнопке обработчик "buttonClickHandler()" на событие "click"
        buttonEls.forEach((button) => {
            button.addEventListener('click', buttonClickHandler);
        });

        display();
    }

    /**
     * Обрабатывает событие клика по любой кнопке калькулятора
     *
     * @param {Event} event Объект события
     */
    function buttonClickHandler(event) {
        let button = event.target; // получаем объект, вызваший событие, т.е. кнопку
        let value = button.innerText; // получаем значение кнопки

        processInputValue(value); // обрабатываем ввод полученного значения
    }

    /**
     * Обрабатывает значение, полученное после нажатия любой кнопки калькулятора
     *
     * @param {String} value
     */
    function processInputValue(value) {
        if (value === '') return; // если значения ввода нет, то ничего не делаем

        if (isNaN(value) === true && value !== ',' && value !== '+/-') {
            /**
             * Если "value" не число
             * И "value" не является набором запятом или сменой знака, то это команда
             */
            processCommand(value);
        } else {
            /**
             * Если "value" не является операцией, значит производится набор операнда
             */
            processOperand(value);
        }
    }

    /**
     * Обрабатывает команду калькулятора
     *
     * @param {String} value
     */
    function processCommand(value) {
        command = value;

        if (command === 'C') {
            // Если нажали кнопку сброса "С"
            reset();
            display();
            return;
        }

        if (operands[0] === '' && operands[1] === '') {
            // Если операндов нет, то ничего не делаем
            return;
        }

        if (isOperation(command) && (operation === '' || operands[1] === '')) {
            // Если команда является оператором И
            // операция ещё не определена или второй операнд не существует,
            // то запоминаем операцию
            operation = command;
        }

        if ((isOperation(command) || command === '=') && operands[1] !== '') {
            // Если команда являеется операцией ИЛИ введена команда "="
            // И второй операнд существует, то делаем расчёты
            let result;

            try {
                result = doOperation();
            } catch (exception) {
                // Если в расчётах был выброшено исключение, то отображаем его в панели результатов
                reset();
                display(exception.message);

                // И завершаем обработку команды
                return;
            }

            // В случае успешного расчёта, назначаем результат первому операнду и очищаем второй операнд
            operands[0] = result + '';
            operands[1] = '';

            if (command === '=') { // если введённая команда "="
                operation = ''; // то очищаем операнд
            } else if (isOperation(command)) { // если команда являлась операцией
                operation = command; // то запоминаем её
            }
        }

        display();
    }

    /**
     * Обрабатывает ввод для создания операнда
     *
     * @param {String} value
     */
    function processOperand(value) {
        // Определяем, с каким операндом работаем, с первым или вторым
        let operandIndex = (operands[1] === '' && operation === '') ? 0 : 1;

        if (isNaN(value) === false) { // если ввели обычное число
            if (operands[operandIndex] === '0') { // если первая цифра в числе ноль
                operands[operandIndex] = value; // то следующий ввод цифры заменит 0
            } else {
                operands[operandIndex] += value; // в ином случае присоединит цифру к числу
            }
        } else if (value === ',') { // если ввоодим плавающую точку
            if (operands[operandIndex].includes('.')) { // если плавающая точка вводится второй раз
                return; // то ничего не делаем
            }

            if (operandIndex === 1 && operands[operandIndex] === '') { // если второй операнд отсутствует
                operands[operandIndex] = "0"; // то добавляем ноль в начало
            }

            operands[operandIndex] += '.';
        } else if (value === '+/-') { // если меняем знак числа
            if (operands[operandIndex] === '' || operands[operandIndex] === '0') { // если операнд отсутствует или равен 0
                return; // то ничего не делаем
            }

            // Меняем знак
            operands[operandIndex] = (parseFloat(operands[operandIndex]) * -1) + '';
        }

        display();
    }

    /**
     * Обрабатывает операцию над числами и возвращает результат
     *
     * @return Number
     */
    function doOperation() {
        // Приводим строковые значения операндов к числам
        let operand1 = parseFloat(operands[0]);
        let operand2 = parseFloat(operands[1]);
        let result;

        switch (operation) {
            case '÷': // деление
                if (operand2 === 0) { // если делим на ноль
                    throw new Error('ЖОПА, ТЫ ЧЁ?'); // то выбрасываем исключение
                }

                result = operand1 / operand2;
                break;
            case '×': // умножение
                result = operand1 * operand2;
                break;
            case '+':
                result = operand1 + operand2;
                break;
            case '-':
                result = operand1 - operand2;
                break;
        }

        return result;
    }

    /**
     * Проверяет, является ли аргумент операцией
     *
     * @param {String} operation
     * @returns {boolean}
     */
    function isOperation(operation) {
        return operations.includes(operation);
    }

    /**
     * Сбрасывает калькулятор
     */
    function reset() {
        operands = ['', ''];
        command = '';
        operation = '';
    }

    /**
     * Выводит строку в панель результата калькулятора
     *
     * @param {String|Number} output
     */
    function display(output = '') {
        if (output === '') {
            output = buildOutput();
        }

        resultEl.innerHTML = output;
    }

    /**
     * Создаёт строчку вывода для панели результата в калькуляторе
     *
     * @returns {string|string}
     */
    function buildOutput() {
        // Если конкатенация операндов и операции даёт пустую строку, то возвращаем строку для вывода по умолчанию
        return operands[0] + operation + operands[1] || defaultOutput;
    }

    // Инициализируем калькулятор
    init(elementId);
};