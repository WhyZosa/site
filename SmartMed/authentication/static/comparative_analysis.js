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
    const ksFields = document.getElementById('ks-fields');
    const tIndependentFields = document.getElementById('t-independent-fields'); // Новый блок
    const defaultFields = document.getElementById('default-fields');
    const independentVariableSelect = document.getElementById('independent-variable-select');
    const groupingVariableSelect = document.getElementById('grouping-variable-select');
    const tIndepIndependentVariableSelect = document.getElementById('t-indep-independent-variable-select'); // Новые поля
    const tIndepGroupingVariableSelect = document.getElementById('t-indep-grouping-variable-select');

    let columns = [];

    // Описания типов тестов
    const testDescriptions = {
        kolmogorov_smirnov: "Критерий Колмогорова-Смирнова предназначен для проверки гипотезы о соответствии выборки нормальному распределению.",
        t_criterion_student_independent: "Данный статистический метод служит для сравнения двух независимых между собой групп. Примеры сравниваемых величин: возраст в основной и контрольной группе, содержание глюкозы в крови пациентов, принимавших препарат или плацебо.",
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
    testTypeSelect.addEventListener('change', () => {
        handleTestTypeChange(testTypeSelect.value);
        updateTestTooltip();
    });

    // Инициализация текста тултипа при загрузке страницы
    updateTestTooltip();

    /**
     * Функция для отображения или скрытия соответствующих полей в зависимости от выбранного теста
     * @param {string} testType - Выбранный тип теста
     */
    function handleTestTypeChange(testType) {
        // Проверяем, есть ли уже отображённые результаты или графики
        const hasResults = !resultsContainer.classList.contains('hidden') && resultsContainer.innerHTML.trim() !== '';
        const hasCharts = !chartContainer.classList.contains('hidden') && chartContainer.innerHTML.trim() !== '';

        // Если есть результаты или графики, очищаем их
        if (hasResults || hasCharts) {
            clearAnalysisResults();
        }

        // Скрываем все специфические поля
        ksFields.classList.add('hidden');
        tIndependentFields.classList.add('hidden');
        defaultFields.classList.add('hidden');

        // Показываем нужные поля в зависимости от выбранного теста
        switch(testType) {
            case 'kolmogorov_smirnov':
                ksFields.classList.remove('hidden');
                break;
            case 't_criterion_student_independent':
                tIndependentFields.classList.remove('hidden');
                break;
            default:
                defaultFields.classList.remove('hidden');
        }
    }

    /**
     * Функция для очистки только результатов анализа и сообщений об ошибках
     */
    function clearAnalysisResults() {
        // Скрыть и очистить контейнеры сообщений анализа
        hideMessage(analysisMessageContainer);

        // Очистить и скрыть контейнер результатов
        resultsContainer.innerHTML = '';
        resultsContainer.classList.add('hidden');

        // Очистить и скрыть контейнер графиков
        chartContainer.innerHTML = '';
        chartContainer.classList.add('hidden');

        // Удалить визуальные выделения ошибок
        independentVariableSelect.classList.remove('input-error');
        groupingVariableSelect.classList.remove('input-error');
        column1Select.classList.remove('input-error');
        column2Select.classList.remove('input-error');
        tIndepIndependentVariableSelect.classList.remove('input-error'); // Новые поля
        tIndepGroupingVariableSelect.classList.remove('input-error'); // Новые поля
    }

    /**
     * Функция для заполнения селекторов независимой и группирующей переменных для К-С критерия
     */
    function populateKsVariableSelects() {
        // Очистка текущих опций
        independentVariableSelect.innerHTML = "<option value=''>-- Выберите независимую переменную --</option>";
        groupingVariableSelect.innerHTML = "<option value=''>-- Выберите группирующую переменную --</option>";

        columns.forEach(column => {
            // Добавляем все колонки как возможные независимые переменные
            const optionIndependent = document.createElement("option");
            optionIndependent.value = column;
            optionIndependent.textContent = column;
            independentVariableSelect.appendChild(optionIndependent);

            // Добавляем все колонки как возможные группирующие переменные
            const optionGrouping = document.createElement("option");
            optionGrouping.value = column;
            optionGrouping.textContent = column;
            groupingVariableSelect.appendChild(optionGrouping);
        });
    }

    /**
     * Функция для заполнения селекторов независимой и группирующей переменных для Т-критерия Стьюдента (независимые выборки)
     */
    function populateTIndepVariableSelects() {
        // Очистка текущих опций
        tIndepIndependentVariableSelect.innerHTML = "<option value=''>-- Выберите независимую переменную --</option>";
        tIndepGroupingVariableSelect.innerHTML = "<option value=''>-- Выберите группирующую переменную --</option>";

        columns.forEach(column => {
            // Добавляем все колонки как возможные независимые переменные
            const optionIndependent = document.createElement("option");
            optionIndependent.value = column;
            optionIndependent.textContent = column;
            tIndepIndependentVariableSelect.appendChild(optionIndependent);

            // Добавляем все колонки как возможные группирующие переменные
            const optionGrouping = document.createElement("option");
            optionGrouping.value = column;
            optionGrouping.textContent = column;
            tIndepGroupingVariableSelect.appendChild(optionGrouping);
        });
    }

    // Обработчик отправки формы загрузки файла
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        hideMessage(uploadMessageContainer);
        hideMessage(analysisMessageContainer);
        resultsContainer.innerHTML = '';
        chartContainer.innerHTML = '';
        chartContainer.classList.add('hidden');
        columnSelection.classList.add('hidden');
        ksFields.classList.add('hidden');
        tIndependentFields.classList.add('hidden');

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
                        populateKsVariableSelects();
                        populateTIndepVariableSelects(); // Заполнение для нового теста
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
        column1Select.innerHTML = "<option value=''>-- Выберите колонку --</option>";
        column2Select.innerHTML = "<option value=''>-- Выберите колонку --</option>";

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

        let analysisData = {
            tests: []
        };

        const analysisType = testTypeSelect.value;

        if (!analysisType) {
            showMessage(analysisMessageContainer, 'Ошибка: Выберите тип анализа.', 'error');
            return;
        }

        if (analysisType === 'kolmogorov_smirnov') {
            const independentVariable = independentVariableSelect.value;
            const groupingVariable = groupingVariableSelect.value;

            if (!independentVariable || !groupingVariable) {
                showMessage(analysisMessageContainer, 'Ошибка: Пожалуйста, выберите независимую и группирующую переменные для Критерия Колмогорова-Смирнова.', 'error');
                return;
            }

            analysisData.tests.push({
                type: analysisType,
                independent_variable: independentVariable,
                grouping_variable: groupingVariable
            });
        } else if (analysisType === 't_criterion_student_independent') {
            const tIndepIndependentVariable = tIndepIndependentVariableSelect.value;
            const tIndepGroupingVariable = tIndepGroupingVariableSelect.value;

            if (!tIndepIndependentVariable || !tIndepGroupingVariable) {
                showMessage(analysisMessageContainer, 'Ошибка: Пожалуйста, выберите независимую и группирующую переменные для Т-критерия Стьюдента (независимые выборки).', 'error');
                return;
            }

            analysisData.tests.push({
                type: analysisType,
                column1: tIndepIndependentVariable,
                column2: tIndepGroupingVariable
            });
        } else {
            const column1 = column1Select.value;
            const column2 = column2Select.value;

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

            analysisData.tests.push({
                type: analysisType,
                column1: column1,
                column2: column2
            });
        }

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

            const result = await response.json();

            if (!response.ok) {
                let userFriendlyMessage = result.error || 'Неизвестная ошибка';

                // Обработка специфических ошибок
                userFriendlyMessage = mapErrorMessage(userFriendlyMessage);

                if (userFriendlyMessage) {
                    showMessage(analysisMessageContainer, `Ошибка выполнения анализа: ${userFriendlyMessage}`, 'error');
                }

                throw new Error(userFriendlyMessage);
            }

            console.log('Результат анализа:', result);

            if (!result || Object.keys(result).length === 0) {
                showMessage(analysisMessageContainer, 'Ошибка: Сервер вернул пустой результат. Проверьте данные.', 'error');
                return;
            }

            // Удаление предыдущих ошибок, если они есть
            hideMessage(analysisMessageContainer);

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
        const binaryErrorPattern = /Группирующая переменная ".+" должна быть бинарной \(содержать два уникальных значения\)/i;
        const nanPattern = /nan/i;

        if (typeErrorPattern.test(errorMessage) || mixedTypeErrorPattern.test(errorMessage)) {
            return 'Вы выбрали строковые и числовые значения одновременно. Пожалуйста, выберите либо две числовые колонки, либо две строковые.';
        } else if (binaryErrorPattern.test(errorMessage)) {
            return 'Группирующая переменная должна содержать только бинарные значения (0 и 1).';
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

        // Проверка наличия секции "Результаты"
        if (!result.Результаты || typeof result.Результаты !== 'object') {
            showMessage(analysisMessageContainer, 'Ошибка: Недостаточные данные для отображения результатов.', 'error');
            return;
        }

        const results = result.Результаты;

        // Итерация по каждому тесту в результатах
        for (const [testName, testResult] of Object.entries(results)) {
            const section = document.createElement('div');
            section.classList.add('result-section');

            const testTitle = document.createElement('h4');
            testTitle.textContent = formatKey(testName);
            section.appendChild(testTitle);

            if (testResult.error) {
                const errorPara = document.createElement('p');
                errorPara.textContent = `Ошибка: ${testResult.error}`;
                errorPara.classList.add('error-message');
                section.appendChild(errorPara);

                // Визуальное выделение соответствующих полей
                switch(testName) {
                    case 'kolmogorov_smirnov':
                        if (testResult.error.includes('независимую переменную')) {
                            independentVariableSelect.classList.add('input-error');
                        } else if (testResult.error.includes('группирующую переменную')) {
                            groupingVariableSelect.classList.add('input-error');
                        }
                        break;
                    case 't_criterion_student_independent':
                        if (testResult.error.includes('column1')) {
                            tIndepIndependentVariableSelect.classList.add('input-error');
                        }
                        if (testResult.error.includes('column2')) {
                            tIndepGroupingVariableSelect.classList.add('input-error');
                        }
                        break;
                    default:
                        if (testResult.error.includes('колонки') || testResult.error.includes('переменные')) {
                            column1Select.classList.add('input-error');
                            column2Select.classList.add('input-error');
                        }
                }
            } else {
                // Удаление выделения ошибок, если анализ прошёл успешно
                independentVariableSelect.classList.remove('input-error');
                groupingVariableSelect.classList.remove('input-error');
                column1Select.classList.remove('input-error');
                column2Select.classList.remove('input-error');
                tIndepIndependentVariableSelect.classList.remove('input-error'); // Новые поля
                tIndepGroupingVariableSelect.classList.remove('input-error'); // Новые поля

                // Создание таблицы с результатами теста
                const table = document.createElement('table');
                table.classList.add('result-table');

                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');

                const thParam = document.createElement('th');
                thParam.textContent = 'Параметр';
                headerRow.appendChild(thParam);

                const thValue = document.createElement('th');
                thValue.textContent = 'Значение';
                headerRow.appendChild(thValue);

                thead.appendChild(headerRow);
                table.appendChild(thead);

                const tbody = document.createElement('tbody');

                for (const [key, value] of Object.entries(testResult)) {
                    const dataRow = document.createElement('tr');

                    const tdKey = document.createElement('td');
                    tdKey.textContent = formatKey(key);
                    dataRow.appendChild(tdKey);

                    const tdValue = document.createElement('td');
                    tdValue.textContent = value;
                    dataRow.appendChild(tdValue);

                    tbody.appendChild(dataRow);
                }

                table.appendChild(tbody);
                section.appendChild(table);

                // Добавление пояснительного текста для конкретных тестов
                if (testName === 'kolmogorov_smirnov') {
                    const explanation = document.createElement('div');
                    explanation.classList.add('description-container');

                    const p1 = document.createElement('p');
                    p1.textContent = `Если p < 0.05, нулевая гипотеза отвергается, принимается альтернативная, выборка не подчиняется закону нормального распределения.`;

                    const p2 = document.createElement('p');
                    p2.textContent = `Если p ≥ 0.05, принимается нулевая гипотеза, выборка подчиняется закону нормального распределения.`;

                    explanation.appendChild(p1);
                    explanation.appendChild(p2);

                    section.appendChild(explanation);
                } else if (testName === 't_criterion_student_independent') {
                    const explanation = document.createElement('div');
                    explanation.classList.add('description-container');

                    const p1 = document.createElement('p');
                    p1.textContent = `Если p < 0.05, нулевая гипотеза отвергается, принимается альтернативная, различия обладают статистической значимостью и носят системный характер.`;

                    const p2 = document.createElement('p');
                    p2.textContent = `Если p ≥ 0.05, принимается нулевая гипотеза, различия не являются статистически значимыми и носят случайный характер.`;

                    explanation.appendChild(p1);
                    explanation.appendChild(p2);

                    section.appendChild(explanation);
                }
            }

            resultsContainer.appendChild(section);
        }

        resultsContainer.classList.remove('hidden');
    }

    function formatKey(key) {
        // Преобразуем ключи из snake_case в читаемый формат
        return key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }
});
