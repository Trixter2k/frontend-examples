"use strict";

class WazedTVCalculator {
    /**
     * Элемент калькулятора
     * @type HTMLElement
     */
    calculatorEl;

    /**
     * Элемент "результата" для вывода
     * @type HTMLElement
     */
    resultEl;

    /**
     * Массив элементов кнопок
     * @type {HTMLElement[]}
     */
    buttonEls;

    /**
     * Список операций
     * @type {string[]}
     */
    operations = ['÷', '×', '+', '-'];

    /**
     * Значение команды для добавления плавающей точки в операнд
     * @type {string}
     */
    floatCommand = ',';

    /**
     * Значение команды для управления знаком операнда
     * @type {string}
     */
    signCommand = '+/-';

    /**
     * Значение команды для удаления последней цифры в операнде
     * @type {string}
     */
    removeCommand = '⇐';

    /**
     * Список комманд, предназначенных для ввода операнда. Заполняется в конструкторе.
     * @type {[]}
     */
    operandCommands = [];

    /**
     * В массиве "operands" хранятся операнды.
     *
     * Под индексом "0" первый операнд.
     * Под индексом "1" второй операнд.
     *
     * @type {Object} operands
     */
    operands = ['', ''];

    /**
     * Хранит введённую команду. Командой являются все кнопки, кроме операций +, -, *, /
     * @type {string}
     */
    command = '';

    /**
     * Хранит введённую операцию. Операцией являются +, -, *, /
     * @type {string}
     */
    operation = '';

    /**
     * Хранит строку для вывода по умолчанию, когда калькулятор ничего не отображает
     * @type {string}
     */
    defaultOutput = 'Результат';

    /**
     * Ограничение на количество цифр в выводе результата
     * @type {number}
     */
    digitLimit = 16;

    /**
     * Флаг, зажат ли ЛКМ
     * @type {boolean}
     */
    isMouseDown = false;

    /**
     * Задержка при вводе следующей значения при зажатии ЛКМ или кнопки с цифрой
     * @type {number}
     */
    inputDelay = 200;

    /**
     * Хранит IntervalID таймера, запускающего ввод следующего числа при зажатии ЛКМ или кнопки с цифрой
     * @type {number}
     */
    inputDelayTimerId = 0;

    /**
     * Инициализирует переменные, хранящих ссылку на объекты html элементов и добавляет обработчик события
     * на кнопки калькулятора.
     *
     * @param {String} elementId ID элемента калькулятора
     */
    constructor(elementId) {
        // Получение ссылок на объекты html-элементов
        this.calculatorEl = document.getElementById(elementId);
        this.resultEl = this.calculatorEl.getElementsByClassName('result')[0];
        this.buttonEls = Array.from(this.calculatorEl.getElementsByClassName('button'));

        this.operandCommands = [
            this.floatCommand,
            this.signCommand,
            this.removeCommand
        ];

        this.buttonClickHandler = this.buttonClickHandler.bind(this);
        this.buttonMouseDownHandler = this.buttonMouseDownHandler.bind(this);
        this.documentMouseUpHandler = this.documentMouseUpHandler.bind(this);

        // Назначаем каждой кнопке обработчик "buttonClickHandler()" на событие "click"
        this.buttonEls.forEach((button) => {
            button.addEventListener('click', this.buttonClickHandler);
            button.addEventListener('mousedown', this.buttonMouseDownHandler);
        });

        document.addEventListener('mouseup', this.documentMouseUpHandler);

        this.display();
    }

    /**
     * Обрабатывает событие клика по любой кнопке калькулятора, кроме кнопок с цифрами
     *
     * @param {Event} event Объект события
     */
    buttonClickHandler(event) {
        let inputValue = this.getInputValueFromMouseEvent(event);
        if (isNaN(inputValue) === false) {
            return;
        }

        this.processInputValue(this.getInputValueFromMouseEvent(event)); // обрабатываем ввод полученного значения
    }

    /**
     * Обрабатывает событие зажатия ЛКМ мыши по кнопкам с цифрами
     *
     * @param {MouseEvent} event Объект события
     */
    buttonMouseDownHandler(event) {
        let inputValue = this.getInputValueFromMouseEvent(event);
        if (isNaN(inputValue) === true) {
            return;
        }

        if (event.button !== 0 || this.inputDelayTimerId !== 0) {
            return;
        }

        this.inputDelayTimerId = setInterval(() => {
            this.isMouseDown = true;
            this.processOperand(inputValue);
        }, this.inputDelay);

        this.processOperand(inputValue);
    }

    /**
     * Обрабатывает событие отпускания ЛКМ мыши на любом месте страницы
     *
     * @param {MouseEvent} event Объект события
     */
    documentMouseUpHandler(event) {
        if (this.inputDelayTimerId !== 0) {
            clearInterval(this.inputDelayTimerId);
        }

        this.isMouseDown = false;
        this.inputDelayTimerId = 0;
    }

    /**
     * Получает значение кнопки при событии от мыши
     *
     * @param {MouseEvent} event
     */
    getInputValueFromMouseEvent(event) {
        let button = event.target; // получаем объект, вызваший событие, т.е. кнопку
        let value = button.innerText; // получаем значение кнопки
        return value;
    }

    /**
     * Обрабатывает значение, полученное после нажатия любой кнопки калькулятора
     *
     * @param {String} value
     */
    processInputValue(value) {
        if (value === '') return; // если значения ввода нет, то ничего не делаем

        if (this.operandCommands.includes(value) === false) {
            /**
             * Если "value" не число
             * И "value" не является командой для набора операнда
             */
            this.processCommand(value);
        } else {
            /**
             * Если "value" не является операцией, значит производится набор операнда
             */
            this.processOperand(value);
        }
    }

    /**
     * Обрабатывает команду калькулятора
     *
     * @param {String} value
     */
    processCommand(value) {
        this.command = value;

        if (this.command === 'C') {
            // Если нажали кнопку сброса "С"
            this.reset();
            this.display();
            return;
        }

        if (this.operands[0] === '' && this.operands[1] === '') {
            // Если операндов нет, то ничего не делаем
            return;
        }

        if (this.isOperation(this.command) && (this.operation === '' || this.operands[1] === '')) {
            // Если команда является оператором И
            // операция ещё не определена или второй операнд не существует,
            // то запоминаем операцию
            this.operation = this.command;
        }

        if ((this.isOperation(this.command) || this.command === '=') && this.operands[1] !== '') {
            // Если команда являеется операцией ИЛИ введена команда "="
            // И второй операнд существует, то делаем расчёты
            let result;

            try {
                result = this.doOperation();
            } catch (exception) {
                // Если в расчётах был выброшено исключение, то отображаем его в панели результатов
                this.reset();
                this.display(exception.message);

                // И завершаем обработку команды
                return;
            }

            // В случае успешного расчёта, назначаем результат первому операнду и очищаем второй операнд
            this.operands[0] = result + '';
            this.operands[1] = '';

            if (this.command === '=') { // если введённая команда "="
                this.operation = ''; // то очищаем операнд
            } else if (this.isOperation(this.command)) { // если команда являлась операцией
                this.operation = this.command; // то запоминаем её
            }
        }

        this.display();
    }

    /**
     * Обрабатывает ввод для создания операнда
     *
     * @param {String} value
     */
    processOperand(value) {
        // Определяем, с каким операндом работаем, с первым или вторым
        let operandIndex = (this.operands[1] === '' && this.operation === '') ? 0 : 1;

        if (isNaN(value) === false) { // если ввели обычное число
            if (this.operands[operandIndex] === '0') { // если первая цифра в числе ноль
                this.operands[operandIndex] = value; // то следующий ввод цифры заменит 0
            } else {
                this.operands[operandIndex] += value; // в ином случае присоединит цифру к числу
            }
        } else if (value === ',') { // если ввоодим плавающую точку
            if (this.operands[operandIndex].includes('.')) { // если плавающая точка вводится второй раз
                return; // то ничего не делаем
            }

            if (operandIndex === 1 && this.operands[operandIndex] === '') { // если второй операнд отсутствует
                this.operands[operandIndex] = "0"; // то добавляем ноль в начало
            }

            this.operands[operandIndex] += '.';
        } else if (value === '+/-') { // если меняем знак числа
            if (this.operands[operandIndex] === '' || this.operands[operandIndex] === '0') { // если операнд отсутствует или равен 0
                return; // то ничего не делаем
            }

            // Меняем знак
            this.operands[operandIndex] = (parseFloat(this.operands[operandIndex]) * -1) + '';
        } else if (value === this.removeCommand) { // если удаляем последнюю цифру в операнде
            if (this.operands[operandIndex] === '') { // если операнд отсутствует, то нечего удалять
                return;
            }

            this.operands[operandIndex] = this.operands[operandIndex].slice(0,-1);
        }

        this.display();
    }

    /**
     * Обрабатывает операцию над числами и возвращает результат
     *
     * @return Number
     */
    doOperation() {
        // Приводим строковые значения операндов к числам
        let operand1 = parseFloat(this.operands[0]);
        let operand2 = parseFloat(this.operands[1]);
        let result;

        switch (this.operation) {
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

        // Ограничиваем число в 16 цифр
        result = parseFloat(result.toPrecision(this.digitLimit));

        return result;
    }

    /**
     * Проверяет, является ли аргумент операцией
     *
     * @param {String} operation
     * @returns {boolean}
     */
    isOperation(operation) {
        return this.operations.includes(operation);
    }

    /**
     * Сбрасывает калькулятор
     */
    reset() {
        this.operands = ['', ''];
        this.command = '';
        this.operation = '';
    }

    /**
     * Выводит строку в панель результата калькулятора
     *
     * @param {String|Number} output
     */
    display(output = '') {
        if (output === '') {
            output = this.buildOutput();
        }

        this.resultEl.innerHTML = output;
    }

    /**
     * Создаёт строчку вывода для панели результата в калькуляторе
     *
     * @returns {string|string}
     */
    buildOutput() {
        // Если конкатенация операндов и операции даёт пустую строку, то возвращаем строку для вывода по умолчанию
        return this.operands[0] + this.operation + this.operands[1] || this.defaultOutput;
    }
}