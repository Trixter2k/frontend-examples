"use strict";

class WazedTVCalculator {
    /**
     * Элемент калькулятора
     * @type HTMLElement
     */
    calculatorEl;

    /**
     * Элемент для вывода "результата"
     * @type HTMLElement
     */
    resultDisplayEl;

    /**
     * Массив элементов кнопок
     * @type {HTMLElement[]}
     */
    buttonEls;

    /**
     * CSS Class дисплея отображающего результат
     * @type {string}
     */
    resultDisplayClass = 'result-display';

    /**
     * CSS Class кнопок
     * @type {string}
     */
    buttonClass = 'button';

    /**
     * Хранит значение команды для операции сложения
     * @type {string}
     */
    additionCommand = '+';

    /**
     * Хранит значение команды для операции вычитания
     * @type {string}
     */
    subtractionCommand = '-';

    /**
     * Хранит значение команды для операции умножения
     * @type {string}
     */
    multiplicationCommand = '×';

    /**
     * Хранит значение команды для операции деления
     * @type {string}
     */
    divisionCommand = '÷';

    /**
     * Хранит значение команды для добавления плавающей точки в операнд
     * @type {string}
     */
    floatCommand = ',';

    /**
     * Хранит значение команды для управления знаком операнда
     * @type {string}
     */
    signCommand = '+/-';

    /**
     * Хранит значение команды для удаления последней цифры в операнде
     * @type {string}
     */
    removeCommand = '⇐';

    /**
     * Хранит значение команды для операции получения результата
     * @type {string}
     */
    equalsCommand = '=';

    /**
     * Хранит значение команды для сброса калькулятора
     * @type {string}
     */
    resetCommand = 'c';

    /**
     * Список операций, заполняется в конструкторе. Операция является частным случаем команды.
     * @type {string[]}
     */
    operators = [];

    /**
     * Список команд, предназначенных для ввода операнда. Заполняется в конструкторе.
     * @type {[]}
     */
    operandCommands = [];

    /**
     * Хранит список значений "специальных" кнопок клавиатуры, которые отлавливаются только по событию "keydown"
     * @type {{escapeKey: string, backspaceKey: string, deleteKey: string, enterKey: string}}
     */
    specialKeys = {
        deleteKey: 'Delete',
        escapeKey: 'Escape',
        backspaceKey: 'Backspace',
        enterKey: 'Enter'
    }

    /**
     * Хранит соответствие значение с кнопок клавиатуры на команды калькулятора.
     * Заполняется в конструкторе.
     *
     * @type {Object}
     */
    keysToCommandsMapping = {};

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
     * Хранит введённую команду. Командой являются все кнопки, кроме операторов +, -, *, /
     * @type {string}
     */
    command = '';

    /**
     * Хранит введённый оператор. Операторами являются +, -, *, /
     * @type {string}
     */
    operator = '';

    /**
     * Хранит строку для вывода по умолчанию, когда калькулятор ничего не отображает
     * @type {string}
     */
    defaultInputValue = '0';

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
    inputDelay = 25;

    /**
     * Задержка после первого зажатия ЛКМ, после которого происходит автоввод
     * @type {number}
     */
    mouseDownDelay = 500;

    /**
     * Хранит IntervalID таймера, запускающего ввод следующего числа при зажатии ЛКМ или кнопки с цифрой
     * @type {number}
     */
    inputDelayTimerId = 0;

    /**
     * Хранит TimeoutID таймера, запускающего начало автоввода при зажатии кнопки ЛКМ'ом
     * @type {number}
     */
    mouseDownDelayTimerId = 0;

    /**
     * Инициализирует переменные, хранящих ссылку на объекты html элементов и добавляет обработчик события
     * на кнопки калькулятора.
     *
     * @param {String} elementId ID элемента калькулятора
     */
    constructor(elementId) {
        // Получение ссылок на объекты html-элементов
        this.calculatorEl = document.getElementById(elementId);
        this.resultDisplayEl = this.calculatorEl.getElementsByClassName(this.resultDisplayClass)[0];
        this.buttonEls = Array.from(this.calculatorEl.getElementsByClassName(this.buttonClass));

        this.operators = [
            this.additionCommand,
            this.subtractionCommand,
            this.multiplicationCommand,
            this.divisionCommand
        ];

        this.operandCommands = [
            this.floatCommand,
            this.signCommand,
            this.removeCommand
        ];

        this.keysToCommandsMapping = {
            '+': this.additionCommand,
            '-': this.subtractionCommand,
            '*': this.multiplicationCommand,
            '/': this.divisionCommand,
            '.': this.floatCommand,
            ',': this.floatCommand,
            '=': this.equalsCommand,
            [this.specialKeys.deleteKey]: this.resetCommand,
            [this.specialKeys.escapeKey]: this.resetCommand,
            [this.specialKeys.backspaceKey]: this.removeCommand,
            [this.specialKeys.enterKey]: this.equalsCommand
        };

        this.buttonClickHandler = this.buttonClickHandler.bind(this);
        this.buttonMouseDownHandler = this.buttonMouseDownHandler.bind(this);
        this.buttonMouseOverHandler = this.buttonMouseOverHandler.bind(this);
        this.buttonMouseOutHandler = this.buttonMouseOutHandler.bind(this);
        this.keyPressHandler = this.keyPressHandler.bind(this);
        this.keyDownHandler = this.keyDownHandler.bind(this);
        this.documentMouseUpHandler = this.documentMouseUpHandler.bind(this);

        // Назначаем каждой кнопке обработчик "buttonClickHandler()" на событие "click"
        this.buttonEls.forEach((button) => {
            button.addEventListener('click', this.buttonClickHandler);
            button.addEventListener('mousedown', this.buttonMouseDownHandler);
            button.addEventListener('mouseover', this.buttonMouseOverHandler);
            button.addEventListener('mouseout', this.buttonMouseOutHandler);
        });

        window.addEventListener('keypress', this.keyPressHandler);
        window.addEventListener('keydown', this.keyDownHandler);
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
        if (!isNaN(inputValue)) return;

        this.processInputValue(this.getInputValueFromMouseEvent(event)); // обрабатываем ввод полученного значения
    }

    /**
     * Обрабатывает событие зажатия ЛКМ мыши по кнопкам с цифрами
     *
     * @param {MouseEvent} event Объект события
     */
    buttonMouseDownHandler(event) {
        let inputValue = this.getInputValueFromMouseEvent(event);
        if (isNaN(inputValue)) return; // если значение ввода не цифра, то ничего не делаем

        if (event.button !== 0 || this.inputDelayTimerId) { // если нажата не ЛКМ, то ничего не делаем
            return;
        }

        // Создаём задержку при нажатии ЛКМ, чтобы определить зажат ли он
        this.mouseDownDelayTimerId = setTimeout(() => {
            this.isMouseDown = true;

            // Создаём интервал для автоввода значений
            this.inputDelayTimerId = setInterval(() => this.processOperand(inputValue), this.inputDelay);
        }, this.mouseDownDelay);

        // Вводим первое значение по нажатию сразу, т.к. таймеры ещё не отработали
        this.processOperand(inputValue);
    }

    /**
     * Обрабатывает событие отпускания ЛКМ мыши на любом месте страницы
     *
     * @param {MouseEvent} event Объект события
     */
    documentMouseUpHandler(event) {
        if (this.mouseDownDelayTimerId) { // если существует таймер
            clearTimeout(this.mouseDownDelayTimerId); // удаляем его
            this.mouseDownDelayTimerId = 0; // и обнуляем его ID
        }

        if (this.inputDelayTimerId) { // то же самое
            clearInterval(this.inputDelayTimerId);
            this.inputDelayTimerId = 0;
        }

        this.isMouseDown = false;
    }

    /**
     * Получает значение кнопки при событии от мыши
     *
     * @param {MouseEvent} event
     */
    getInputValueFromMouseEvent(event) {
        return event.target.innerText;
    }

    /**
     * Обрабатывает наведение мышки на кнопку
     * @param {MouseEvent} event
     */
    buttonMouseOverHandler(event) {
        console.log(event);
    }

    /**
     * Обрабатывает уход мышки с кнопки
     * @param {MouseEvent} event
     */
    buttonMouseOutHandler(event) {
        console.log(event);
    }

    /**
     * Обрабатывает ввод с клавиатуры
     * @param {KeyboardEvent} event
     */
    keyPressHandler(event) {
        let isDigital = !isNaN(event.key);

        if (!(isDigital || (event.key in this.keysToCommandsMapping))) return;

        let inputValue = isDigital ? event.key : this.keysToCommandsMapping[event.key];

        this.processInputValue(inputValue);
    }

    /**
     * Обрабатывает нажатую кнопку с клавиатуры
     * @param {KeyboardEvent} event
     */
    keyDownHandler(event) {
        if (!Object.values(this.specialKeys).includes(event.key)) return;
        this.processInputValue(this.keysToCommandsMapping[event.key]);
    }

    /**
     * Обрабатывает значение, полученное после нажатия любой кнопки калькулятора
     *
     * @param {String} value
     */
    processInputValue(value) {
        if (!value) return; // если значения ввода нет, то ничего не делаем

        if (isNaN(value) && !this.operandCommands.includes(value)) {
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

        if (this.command === this.resetCommand) {
            // Если нажали кнопку сброса
            this.reset();
            this.display();
            return;
        }

        if (this.operands[0] === '' && this.operands[1] === '') {
            // Если операндов нет, то ничего не делаем
            return;
        }

        if (this.isOperator(this.command) && (this.operator === '' || this.operands[1] === '')) {
            // Если команда является оператором И
            // операция ещё не определена или второй операнд не существует,
            // то запоминаем операцию
            this.operator = this.command;
        }

        if ((this.isOperator(this.command) || this.command === this.equalsCommand) && this.operands[1] !== '') {
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

            if (this.command === this.equalsCommand) { // если введённая команда "="
                this.operator = ''; // то очищаем операнд
            } else if (this.isOperator(this.command)) { // если команда являлась операцией
                this.operator = this.command; // то запоминаем её
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
        let operandIndex = (this.operands[1] === '' && this.operator === '') ? 0 : 1;

        if (isNaN(value) === false) { // если ввели обычное число
            if (this.operands[operandIndex] === '0') { // если первая цифра в числе ноль
                this.operands[operandIndex] = value; // то следующий ввод цифры заменит 0
            } else {
                this.operands[operandIndex] += value; // в ином случае присоединит цифру к числу
            }
        } else if (value === this.floatCommand) { // если ввоодим плавающую точку
            if (this.operands[operandIndex].includes('.')) { // если плавающая точка вводится второй раз
                return; // то ничего не делаем
            }

            if (operandIndex === 1 && this.operands[operandIndex] === '') { // если второй операнд отсутствует
                this.operands[operandIndex] = "0"; // то добавляем ноль в начало
            }

            this.operands[operandIndex] += '.';
        } else if (value === this.signCommand) { // если меняем знак числа
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

        switch (this.operator) {
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
     * @param {String} operator
     * @returns {boolean}
     */
    isOperator(operator) {
        return this.operators.includes(operator);
    }

    /**
     * Сбрасывает калькулятор
     */
    reset() {
        this.operands = ['', ''];
        this.command = '';
        this.operator = '';
    }

    /**
     * Выводит строку в панель результата калькулятора
     *
     * @param {String|Number} output
     */
    display(output = '') {
        this.resultDisplayEl.innerHTML = output || this.buildOutput();
    }

    /**
     * Создаёт строчку вывода для панели результата в калькуляторе
     *
     * @returns {string|string}
     */
    buildOutput() {
        // Если конкатенация операндов и операции даёт пустую строку, то возвращаем строку для вывода по умолчанию
        return this.operands[0] + this.operator + this.operands[1] || this.defaultInputValue;
    }
}