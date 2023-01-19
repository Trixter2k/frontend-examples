"use strict";

/**
 * Переменной "wazedTvCalculator" присваивается функция "init()", которая возвращается из анонимной функции,
 * вызываемой на месте. Пример такого вызова:
 *    function() { some_code;  return someFunctionVar; }()
 * где скобки в конце сразу же вызывает эту анонимную функцию.
 *
 * Стрелочная функция используется для сокрытия переменных калькулятора из глобальной области видимости.
 */
let wazedTvCalculator = function() {
    let calculatorEl;
    let resultEl;
    let buttonEls;

    let operations = ['÷', '×', '+', '-'];

    /**
     * В массиве "operands" хранятся операнды.
     *
     * Под индексом "1" первый операнд.
     * Под индексом "2" второй операнд.
     *
     * @type {Object} operands
     */
    let operands = ['', ''];

    let command = '';
    let operation = '';

    let defaultOutput = 'Результат';

    /**
     * Функция инициадизирует переменные, хранящих ссылку на объекты html элементов и добавляет обработчик события
     * на кнопки калькулятора.
     *
     * @param {String} elementId
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
     * @param {Event} event
     */
    function buttonClickHandler(event) {
        let button = event.target;
        let value = button.innerText;

        processInput(value);
    }

    /**
     * Обрабатывает значение, полученное после нажатия любой кнопки калькулятора
     *
     * @param {String} value
     */
    function processInput(value) {
        if (value === '') return;

        if (isNaN(value) === true && value !== ',' && value !== '+/-') {
            /**
             * Если "value" не число
             * И "value" не является набором запятом или сменой знака, то это команда
             */
            doCommandByInput(value);
        } else {
            /**
             * Если "value" не является операцией, значит производится набор операнда
             */
            processOperandFromInput(value);
        }
    }

    /**
     * Обрабатывает команду калькулятора
     *
     * @param {String} value
     */
    function doCommandByInput(value) {
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
            operation = command;
        }

        if ((isOperation(command) || command === '=') && operands[1] !== '') {
            let result;

            try {
                result = doOperation();
            } catch (exception) {
                reset();
                display(exception.message);
                return;
            }

            operands[0] = result + '';
            operands[1] = '';

            if (command === '=') {
                operation = '';
            } else if (isOperation(command)) {
                operation = command;
            }
        }

        display();
    }

    /**
     * Обрабатывает ввод для создания операнда
     *
     * @param {String} value
     */
    function processOperandFromInput(value) {
        let operandIndex = (operands[1] === '' && operation === '') ? 0 : 1;

        if (isNaN(value) === false) {
            // Если ввели обычное число
            if (operands[operandIndex] === '0') {
                operands[operandIndex] = value;
            } else {
                operands[operandIndex] += value;
            }
        } else if (value === ',') {
            if (operands[operandIndex].includes('.')) {
                return;
            }

            if (operandIndex === 1 && operands[operandIndex] === '') {
                operands[operandIndex] = "0";
            }

            operands[operandIndex] += '.';
        } else if (value === '+/-') {
            if (operands[operandIndex] === '' || operands[operandIndex] === '0') {
                return;
            }

            operands[operandIndex] = (parseFloat(operands[operandIndex]) * -1) + '';
        }

        display();
    }

    /**
     * Обрабатывает операцию над числами
     *
     * @return Number
     */
    function doOperation() {
        let operand1 = parseFloat(operands[0]);
        let operand2 = parseFloat(operands[1]);
        let result;

        switch (operation) {
            case '÷': // деление
                if (operand2 === 0) {
                    throw new Error('ЖОПА, ТЫ ЧЁ?');
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

    function reset() {
        operands = ['', ''];
        command = '';
        operation = '';
    }

    /**
     *
     * @param {String|Number} output
     */
    function display(output = '') {
        if (output === '') {
            if (operands[0] !== '') {
                output += operands[0];
            }

            if (operation !== '') {
                output += operation;
            }

            if (operands[1] !== '') {
                output += operands[1];
            }
        }

        if (output === '') {
            output = defaultOutput;
        }

        resultEl.innerHTML = output;
    }

    return init;
}();