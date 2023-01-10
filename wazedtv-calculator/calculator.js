"use strict";

let calc = document.getElementById('calc');
let buttons = Array.from(calc.getElementsByClassName('button'));
let resultEl = calc.getElementsByClassName('result')[0];

let number1 = '';
let number2 = '';
let operation = '';
let lastOperation = '';
let operations = ['÷', '×', '+', '-', '='];
let result = '';

let displayResult = (result) => {
    resultEl.innerHTML = result
}

let buttonClickHandler = (event) => {
    let button = event.target;
    let value = button.innerText;
    let numeral;

    if (value == '') {
        return;
    }

    if (isNaN(value) === true && value !== ',' && value !== '+/-') {
        // Если происходит операция
        operation = value;

        if (number1 === '' && number2 === '') {
            return;
        }

        if (operation === '=') {
            if (lastOperation === '=') {
                number2 = '';
                return;
            }

            if (number2 === '') {
                number2 = '0';
            }
        }

        if (operation === 'C') {
            result = '';
            displayResult(result);
            return;
        }

        if (operations.includes(operation) === true && number2 !== '') {
            let currentOperation;

            number1 = parseFloat(number1);
            number2 = parseFloat(number2);

            if (operation === '=') {
                currentOperation = lastOperation;
            } else if (lastOperation !== '') {
                currentOperation = lastOperation;
            } else {
                currentOperation = operation;
            }

            switch (currentOperation) {
                case '÷': // деление
                    if (number2 === 0) {
                        result = 'ЖОПА, ТЫ ЧЁ?';
                    } else {
                        result = number1 / number2;
                    }
                    break;
                case '×': // умножение
                    result = number1 * number2;
                    break;
                case '+':
                    result = number1 + number2;
                    break;
                case '-':
                    result = number1 - number2;
                    break;
            }

            number1 = result;
            number2 = '';

            if (operation !== '=') {
                result = number1 + operation;
            }

            lastOperation = operation;
            operation = '';
        } else {
            if (operation !== '') {
                result = number1;
            }

            operation = value;
            result += operation;

            lastOperation = operation;
        }
    } else {
        // Если идёт набор числа
        if (value === ',') {
            // Если ввели плавающую точку
            if (operation === '') {
                number1 += '.';
            } else {
                number2 += '.';
            }

            result += '.';
        } else if (value === '+/-') {
            // Если меняем знак числа
            if (operation === '' || number2 === '') {
                if (number1 === '') {
                    return;
                }

                number1 = (parseFloat(number1) * -1) + '';

                result = number1;
                if (lastOperation !== '' && lastOperation !== '=') {
                    result += lastOperation;
                }
            } else {
                if (number2 === '') {
                    return;
                }

                number2 = (parseFloat(number2) * -1) + '';

                result += number2;
                if (lastOperation !== '' && lastOperation !== '=') {
                    result = number1 + lastOperation + number2;
                }
            }
        } else {
            // Если ввели обычное число
            numeral = value;

            if (operation === '') {
                if (number1 === '0') {
                    number1 = numeral;
                } else {
                    number1 += numeral;
                }

                result = number1;
            } else {
                if (number2 === '0') {
                    number2 = numeral;
                } else {
                    number2 += numeral;
                }
                result = number1 + lastOperation + number2;
            }
        }
    }

    displayResult(result);
}

buttons.forEach((button) => {
    button.addEventListener('click', buttonClickHandler);
});