document.addEventListener('DOMContentLoaded', () => {
    // Получение элементов DOM
    const uploadForm = document.getElementById('file-upload-form');
    const fileInput = document.getElementById('file-input');
    const uploadMessageContainer = document.getElementById('upload-message-container');
    const columnSelection = document.getElementById('column-selection');
    const column1Select = document.getElementById('column1-select');
    const column2Select = document.getElementById('column2-select');
    const testTypeSelect = document.getElementById('test-type');
    const testTooltip = document.getElementById('test-tooltip');
    const analyzeButton = document.getElementById('analyze-button');
    const analysisMessageContainer = document.getElementById('analysis-message-container');
    const resultsContainer = document.getElementById('analysis-results');
    const chartContainer = document.getElementById('chart-container');
    const checkboxContainer = document.getElementById('checkbox-container');

    let columns = [];

    // Описания типов тестов
    const testDescriptions = {
        kolmogorov_smirnov: "Критерий Колмогорова-Смирнова предназначен для проверки гипотезы о соответствии выборки нормальному распределению.",
        t_criterion_student_independent: "Т-критерий Стьюдента для независимых выборок используется для сравнения средних значений двух независимых групп.",
        t_criterion_student_dependent: "Т-критерий Стьюдента для зависимых выборок используется для сравнения средних значений в одной группе до и после воздействия.",
        u_criterion_mann_whitney: "U-критерий Манна-Уитни используется для сравнения двух независимых выборок при отсутствии нормальности распределения.",
        t_criterion_wilcoxon: "Т-критерий Уилкоксона применяется для сравнения связанных выборок при отсутствии нормальности распределения.",
        chi2_pearson: "Критерий Хи-квадрат Пирсона позволяет проверить зависимость между двумя категориальными переменными.",
        sensitivity_specificity: "Чувствительность и специфичность оценивают точность диагностического теста. Чувствительность — вероятность положительного результата при наличии заболевания. Специфичность — вероятность отрицательного результата при отсутствии заболевания.",
        risk_relations: "Отношение рисков (RR) сравнивает вероятность наступления события в двух группах. Если RR > 1, риск выше в первой группе; если RR < 1, риск ниже.",
        odds_relations: "Отношение шансов (OR) оценивает вероятность наступления события в одной группе по сравнению с другой. Если OR > 1, событие более вероятно в первой группе; если OR < 1, менее вероятно."
    };

    // Функция для обновления текста тултипа
    function updateTestTooltip() {
        const selectedTest = testTypeSelect.value;
        testTooltip.textContent = testDescriptions[selectedTest] || "Выберите тип теста для анализа данных.";
    }

    // Обработчик изменения типа теста
    testTypeSelect.addEventListener('change', updateTestTooltip);

    // Инициализация текста тултипа при загрузке страницы
    updateTestTooltip();

    // Обработчик отправки формы загрузки файла
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        hideMessage(uploadMessageContainer);
        hideMessage(analysisMessageContainer);
        resultsContainer.innerHTML = '';
        chartContainer.innerHTML = '';
        chartContainer.classList.add('hidden');
        columnSelection.classList.add('hidden');

        const file = fileInput.files[0];
        if (!file) {
            showMessage(uploadMessageContainer, 'Ошибка: Выберите файл для загрузки.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');
        if (!token) {
            showMessage(uploadMessageContainer, 'Ошибка: Токен не найден. Пожалуйста, авторизуйтесь.', 'error');
            return;
        }

        const xhr = new XMLHttpRequest();

        xhr.open('POST', '/upload/', true);
        xhr.setRequestHeader('Authorization', `Token ${token}`);

        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (data.error) {
                        showMessage(uploadMessageContainer, data.error, 'error');
                    } else {
                        showMessage(uploadMessageContainer, 'Файл успешно загружен.', 'success');
                        columns = data.columns;
                        populateColumnSelectOptions(columns);
                        columnSelection.classList.remove('hidden');
                    }
                } catch (e) {
                    showMessage(uploadMessageContainer, 'Ошибка при обработке ответа сервера.', 'error');
                    console.error('Ошибка при обработке ответа сервера:', e);
                }
            } else {
                try {
                    const errorData = JSON.parse(xhr.responseText);
                    showMessage(uploadMessageContainer, `Ошибка загрузки файла: ${errorData.error || 'Неизвестная ошибка'}`, 'error');
                } catch (e) {
                    showMessage(uploadMessageContainer, `Ошибка загрузки файла: ${xhr.statusText}`, 'error');
                }
            }
        };

        xhr.onerror = function() {
            showMessage(uploadMessageContainer, 'Ошибка при загрузке файла. Проверьте соединение.', 'error');
        };

        xhr.send(formData);
    });

    // Функция для отображения сообщений
    function showMessage(container, message, type) {
        container.classList.remove('hidden', 'success', 'error', 'warning');
        container.textContent = message;
        container.classList.add(type);
    }

    function hideMessage(container) {
        container.classList.add('hidden');
        container.textContent = '';
        container.className = 'message-container hidden';
    }

    // Функция для заполнения селекторов колонок
    function populateColumnSelectOptions(columns) {
        column1Select.innerHTML = "";
        column2Select.innerHTML = "";

        columns.forEach(column => {
            const option1 = document.createElement("option");
            option1.value = column;
            option1.textContent = column;

            const option2 = document.createElement("option");
            option2.value = column;
            option2.textContent = column;

            column1Select.appendChild(option1);
            column2Select.appendChild(option2);
        });
    }

    // Обработчик нажатия на кнопку анализа
    analyzeButton.addEventListener('click', async () => {
        hideMessage(uploadMessageContainer);
        hideMessage(analysisMessageContainer);
        resultsContainer.innerHTML = '';
        chartContainer.innerHTML = '';
        chartContainer.classList.add('hidden');

        const column1 = column1Select.value;
        const column2 = column2Select.value;
        const analysisType = testTypeSelect.value;

        // Проверка наличия выбора обеих колонок
        if (!column1 || !column2) {
            showMessage(analysisMessageContainer, 'Ошибка: Пожалуйста, выберите обе колонки для анализа.', 'error');
            return;
        }

        // Дополнительная проверка, чтобы выбрать разные колонки
        if (column1 === column2) {
            showMessage(analysisMessageContainer, 'Ошибка: Выберите разные колонки для анализа.', 'error');
            return;
        }

        if (!analysisType) {
            showMessage(analysisMessageContainer, 'Ошибка: Выберите тип анализа.', 'error');
            return;
        }

        const analysisData = {
            tests: [
                {
                    type: analysisType,
                    column1: column1,
                    column2: column2
                }
            ]
        };

        const token = localStorage.getItem('token');

        try {
            const response = await fetch('/custom-analyze/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify(analysisData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                let userFriendlyMessage = errorData.error || 'Неизвестная ошибка';

                // Обработка специфических ошибок
                userFriendlyMessage = mapErrorMessage(userFriendlyMessage);

                if (userFriendlyMessage) {
                    showMessage(analysisMessageContainer, `Ошибка выполнения анализа: ${userFriendlyMessage}`, 'error');
                }

                throw new Error(userFriendlyMessage);
            }

            const result = await response.json();
            console.log('Результат анализа:', result);

            if (!result || Object.keys(result).length === 0) {
                showMessage(analysisMessageContainer, 'Ошибка: Сервер вернул пустой результат. Проверьте данные.', 'error');
                return;
            }

            // Проверка на наличие NaN значений в результате
            if (hasNaNOrNull(result)) {
                showMessage(analysisMessageContainer, 'Ошибка: Некоторые значения в результате анализа равны NaN. Пожалуйста, проверьте ваши данные.', 'error');
                return;
            }

            displayFormattedResults(result);
        } catch (error) {
            // Ошибка уже отображена выше, дополнительная обработка не требуется
            console.error('Ошибка при выполнении анализа:', error);
        }
    });

    /**
     * Функция для сопоставления исходного сообщения об ошибке с понятным пользователю сообщением.
     * @param {string} errorMessage - Исходное сообщение об ошибке от сервера.
     * @returns {string} - Понятное пользователю сообщение об ошибке.
     */
    function mapErrorMessage(errorMessage) {
        const typeErrorPattern = /unsupported operand type\(s\) for .*: 'str' and 'int'/i;
        const mixedTypeErrorPattern = /'int'\s+and\s+'str'|'str'\s+and\s+'int'/i;
        const binaryErrorPattern = /Column2 must contain binary values \(0 and 1\)/i;
        const nanPattern = /nan/i;

        if (typeErrorPattern.test(errorMessage) || mixedTypeErrorPattern.test(errorMessage)) {
            return 'Вы выбрали строковые и числовые значения одновременно. Пожалуйста, выберите либо две числовые колонки, либо две строковые.';
        } else if (binaryErrorPattern.test(errorMessage)) {
            return 'Column2 должна содержать только бинарные значения (0 и 1).';
        } else if (nanPattern.test(errorMessage)) {
            return 'Некоторые значения в результате анализа равны NaN. Пожалуйста, проверьте ваши данные.';
        }
        // Добавьте дополнительные условия для других типов ошибок здесь

        // Для неизвестных ошибок возвращаем общую ошибку
        return 'Произошла неизвестная ошибка при выполнении анализа. Пожалуйста, попробуйте позже или свяжитесь с поддержкой.';
    }

    /**
     * Функция для проверки наличия NaN или null значений в объекте.
     * @param {Object} obj - Объект для проверки.
     * @returns {boolean} - Возвращает true, если найдено NaN или null, иначе false.
     */
    function hasNaNOrNull(obj) {
        if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    if (value === null || value !== value) { // value !== value проверяет NaN
                        return true;
                    }
                    if (typeof value === 'object') {
                        if (hasNaNOrNull(value)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    // Функция для отображения результатов анализа
    function displayFormattedResults(result) {
        resultsContainer.innerHTML = '';

        const header = document.createElement('h3');
        header.textContent = 'Результаты анализа';
        resultsContainer.appendChild(header);

        if (result.error) {
            const errorPara = document.createElement('p');
            errorPara.textContent = `Ошибка: ${result.error}`;
            errorPara.classList.add('error-message');
            resultsContainer.appendChild(errorPara);
            resultsContainer.classList.remove('hidden');
            return;
        }

        // Рекурсивная функция для отображения объектов
        function createElementFromData(key, value) {
            const container = document.createElement('div');
            container.classList.add('result-section');

            if (key) {
                const title = document.createElement('h4');
                title.textContent = formatKey(key);
                container.appendChild(title);
            }

            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    const list = document.createElement('ul');
                    value.forEach(item => {
                        const listItem = document.createElement('li');
                        if (typeof item === 'object' && item !== null) {
                            listItem.appendChild(createElementFromData('', item));
                        } else {
                            listItem.textContent = item;
                        }
                        list.appendChild(listItem);
                    });
                    container.appendChild(list);
                } else {
                    const table = document.createElement('table');
                    table.classList.add('result-table');

                    for (const [subKey, subValue] of Object.entries(value)) {
                        const row = document.createElement('tr');

                        const cellKey = document.createElement('td');
                        cellKey.textContent = formatKey(subKey);
                        cellKey.classList.add('table-key');
                        row.appendChild(cellKey);

                        const cellValue = document.createElement('td');
                        cellValue.innerHTML = formatValue(subValue);
                        cellValue.classList.add('table-value');
                        row.appendChild(cellValue);

                        table.appendChild(row);
                    }

                    container.appendChild(table);
                }
            } else {
                const para = document.createElement('p');
                para.textContent = value;
                container.appendChild(para);
            }

            return container;
        }

        /**
         * Функция для форматирования значения.
         * @param {any} value - Значение для форматирования.
         * @returns {string} - Отформатированное значение в виде строки.
         */
        function formatValue(value) {
            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    return `<ul>${value.map(item => `<li>${item}</li>`).join('')}</ul>`;
                } else {
                    // Если объект, создаем вложенную таблицу
                    return createHtmlFromObject(value);
                }
            }
            return value;
        }

        /**
         * Функция для создания HTML из объекта.
         * @param {Object} obj - Объект для преобразования в HTML.
         * @returns {string} - HTML-строка.
         */
        function createHtmlFromObject(obj) {
            let html = '<table class="result-table">';
            for (const [key, value] of Object.entries(obj)) {
                html += '<tr>';
                html += `<td class="table-key">${formatKey(key)}</td>`;
                if (typeof value === 'object' && value !== null) {
                    if (Array.isArray(value)) {
                        html += `<td>${createHtmlFromObject(value)}</td>`;
                    } else {
                        html += `<td>${createHtmlFromObject(value)}</td>`;
                    }
                } else {
                    html += `<td>${value}</td>`;
                }
                html += '</tr>';
            }
            html += '</table>';
            return html;
        }

        for (const [key, value] of Object.entries(result)) {
            const element = createElementFromData(key, value);
            resultsContainer.appendChild(element);
        }

        resultsContainer.classList.remove('hidden');
    }

    function formatKey(key) {
        // Преобразуем ключи из snake_case в читаемый формат
        return key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }
});
