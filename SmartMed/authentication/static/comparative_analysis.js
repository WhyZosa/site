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
    const tIndependentFields = document.getElementById('t-independent-fields');
    const tDependentFields = document.getElementById('t-dependent-fields');
    const uFields = document.getElementById('u-fields'); 
    const wilcoxonFields = document.getElementById('wilcoxon-fields'); // Добавлен блок для Wilcoxon
    const chi2Fields = document.getElementById('chi2-fields'); // Добавлен блок для Chi2
    const sensitivitySpecificityFields = document.getElementById('sensitivity_specificity-fields'); // Добавлен блок для Чувствительности и Специфичности
    const defaultFields = document.getElementById('default-fields');
    const independentVariableSelect = document.getElementById('independent-variable-select');
    const groupingVariableSelect = document.getElementById('grouping-variable-select');
    const tIndepIndependentVariableSelect = document.getElementById('t-indep-independent-variable-select');
    const tIndepGroupingVariableSelect = document.getElementById('t-indep-grouping-variable-select');
    const tDepVariable1Select = document.getElementById('t-dep-variable1-select');
    const tDepVariable2Select = document.getElementById('t-dep-variable2-select');
    const uIndependentVariableSelect = document.getElementById('u-independent-variable-select');
    const uGroupingVariableSelect = document.getElementById('u-grouping-variable-select');
    const chi2Variable1Select = document.getElementById('chi2-variable1-select');
    const chi2Variable2Select = document.getElementById('chi2-variable2-select');
    const sensitivityVariable1Select = document.getElementById('sensitivity-variable1-select');
    const sensitivityVariable2Select = document.getElementById('sensitivity-variable2-select');

    let columns = [];

    // Описания типов тестов
    const testDescriptions = {
        kolmogorov_smirnov: "Критерий Колмогорова-Смирнова предназначен для проверки гипотезы о соответствии выборки нормальному распределению.",
        t_criterion_student_independent: "Данный статистический метод служит для сравнения двух независимых между собой групп. Примеры: возраст в основной и контрольной группе, содержание глюкозы в крови у пациентов, принимавших препарат или плацебо.",
        t_criterion_student_dependent: "Данный метод используется для сравнения двух зависимых групп. Примеры: частота сердечных сокращений до и после приема препарата.",
        u_criterion_mann_whitney: "U-критерий Манна-Уитни применяется для сравнения двух независимых групп при отсутствии нормальности распределения.",
        t_criterion_wilcoxon: "Т-критерий Уилкоксона для сравнения связанных выборок при отсутствии нормальности распределения.",
        chi2_pearson: "Критерий Хи-квадрат Пирсона для проверки зависимости между двумя категориальными переменными.",
        sensitivity_specificity: "Чувствительность и специфичность оценивают точность диагностического теста.",
        risk_relations: "Отношение рисков (RR) сравнивает вероятность события в двух группах.",
        odds_relations: "Отношение шансов (OR) оценивает вероятность события в одной группе по сравнению с другой."
    };

    // Описания параметров для отображения в результирующей таблице
    const parameterExplanations = {
        'dof': 'Степени свободы (Dof): количество независимых элементов, которые могут свободно изменяться в данных.',
        'expected': 'Ожидаемые значения (Expected): значения, ожидаемые при условии независимости переменных.',
        'contingency_table': 'Контингентная таблица (Contingency Table): таблица, показывающая распределение частот по категориям двух переменных.'
    };

    // Функция для обновления текста тултипа
    function updateTestTooltip() {
        const selectedTest = testTypeSelect.value;
        testTooltip.textContent = testDescriptions[selectedTest] || "Выберите тип теста для анализа данных.";
    }

    // Инициализация тултипа при загрузке страницы
    updateTestTooltip();

    // Обработчик изменения типа теста
    testTypeSelect.addEventListener('change', () => {
        handleTestTypeChange(testTypeSelect.value);
        updateTestTooltip();
    });

    // Функция для обработки изменения типа теста
    function handleTestTypeChange(testType) {
        const hasResults = !resultsContainer.classList.contains('hidden') && resultsContainer.innerHTML.trim() !== '';
        const hasCharts = !chartContainer.classList.contains('hidden') && chartContainer.innerHTML.trim() !== '';

        if (hasResults || hasCharts) {
            clearAnalysisResults();
        }

        // Скрываем все поля
        ksFields.classList.add('hidden');
        tIndependentFields.classList.add('hidden');
        tDependentFields.classList.add('hidden');
        uFields.classList.add('hidden');
        wilcoxonFields.classList.add('hidden');
        chi2Fields.classList.add('hidden');
        sensitivitySpecificityFields.classList.add('hidden');
        defaultFields.classList.add('hidden');

        // Отображаем соответствующие поля
        switch(testType) {
            case 'kolmogorov_smirnov':
                ksFields.classList.remove('hidden');
                break;
            case 't_criterion_student_independent':
                tIndependentFields.classList.remove('hidden');
                break;
            case 't_criterion_student_dependent':
                tDependentFields.classList.remove('hidden');
                break;
            case 'u_criterion_mann_whitney':
                uFields.classList.remove('hidden');
                break;
            case 't_criterion_wilcoxon': // Добавляем отображение для Wilcoxon
                wilcoxonFields.classList.remove('hidden');
                break;
            case 'chi2_pearson': // Добавляем отображение для Chi2
                chi2Fields.classList.remove('hidden');
                break;
            case 'sensitivity_specificity': // Добавляем отображение для Чувствительности и Специфичности
                sensitivitySpecificityFields.classList.remove('hidden');
                break;
            default:
                defaultFields.classList.remove('hidden');
        }
    }

    // Функция для очистки результатов анализа
    function clearAnalysisResults() {
        hideMessage(analysisMessageContainer);
        resultsContainer.innerHTML = '';
        resultsContainer.classList.add('hidden');
        chartContainer.innerHTML = '';
        chartContainer.classList.add('hidden');

        // Удаление выделения ошибок
        removeAllInputErrors();
    }

    // Функции для заполнения селектов
    function populateKsVariableSelects() {
        populateSelect(independentVariableSelect, columns, "Выберите независимую переменную");
        populateSelect(groupingVariableSelect, columns, "Выберите группирующую переменную");
    }

    function populateTIndepVariableSelects() {
        populateSelect(tIndepIndependentVariableSelect, columns, "Выберите независимую переменную");
        populateSelect(tIndepGroupingVariableSelect, columns, "Выберите группирующую переменную");
    }

    function populateTDepVariableSelects() {
        populateSelect(tDepVariable1Select, columns, "Выберите первую переменную");
        populateSelect(tDepVariable2Select, columns, "Выберите вторую переменную");
    }

    function populateUVariableSelects() {
        populateSelect(uIndependentVariableSelect, columns, "Выберите независимую переменную");
        populateSelect(uGroupingVariableSelect, columns, "Выберите группирующую переменную");
    }

    function populateChi2VariableSelects() {
        populateSelect(chi2Variable1Select, columns, "Выберите первую переменную");
        populateSelect(chi2Variable2Select, columns, "Выберите вторую переменную");
    }

    // Функция для заполнения селектов Чувствительности и Специфичности
    function populateSensitivitySpecificityVariableSelects() {
        populateSelect(sensitivityVariable1Select, columns, "Выберите фактор риска");
        populateSelect(sensitivityVariable2Select, columns, "Выберите исход");
    }

    // Функция для заполнения селектов Уилкоксона
    function populateWilcoxonVariableSelects() {
        populateSelect(document.getElementById('wilcoxon-variable1-select'), columns, "Выберите первую переменную");
        populateSelect(document.getElementById('wilcoxon-variable2-select'), columns, "Выберите вторую переменную");
    }

    // Универсальная функция для заполнения селектов
    function populateSelect(selectElement, options, placeholder) {
        selectElement.innerHTML = `<option value="">-- ${placeholder} --</option>`;
        options.forEach(option => {
            const opt = document.createElement("option");
            opt.value = option;
            opt.textContent = option;
            selectElement.appendChild(opt);
        });
    }

    // Функция для заполнения всех селектов
    function populateAllVariableSelects() {
        populateSelect(column1Select, columns, "Выберите колонку");
        populateSelect(column2Select, columns, "Выберите колонку");

        populateKsVariableSelects();
        populateTIndepVariableSelects();
        populateTDepVariableSelects();
        populateUVariableSelects();
        populateChi2VariableSelects(); // Добавлено
        populateWilcoxonVariableSelects();
        populateSensitivitySpecificityVariableSelects(); // Добавлено
    }

    // Обработчик отправки формы загрузки файла
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        hideMessage(uploadMessageContainer);
        hideMessage(analysisMessageContainer);
        clearAnalysisResults();

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

        try {
            const response = await fetch('/upload/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                showMessage(uploadMessageContainer, data.error || 'Неизвестная ошибка при загрузке файла.', 'error');
                return;
            }

            showMessage(uploadMessageContainer, 'Файл успешно загружен.', 'success');
            columns = data.columns || [];
            populateAllVariableSelects();
            columnSelection.classList.remove('hidden');
        } catch (error) {
            console.error('Ошибка при загрузке файла:', error);
            showMessage(uploadMessageContainer, 'Ошибка при загрузке файла. Проверьте соединение.', 'error');
        }
    });

    // Функции для отображения и скрытия сообщений
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

    // Обработчик нажатия кнопки анализа
    analyzeButton.addEventListener('click', async () => {
        hideMessage(uploadMessageContainer);
        hideMessage(analysisMessageContainer);
        clearAnalysisResults();

        let analysisData = {
            tests: []
        };

        const analysisType = testTypeSelect.value;

        if (!analysisType) {
            showMessage(analysisMessageContainer, 'Ошибка: Выберите тип анализа.', 'error');
            return;
        }

        // Формирование данных для анализа в зависимости от выбранного типа теста
        switch(analysisType) {
            case 'kolmogorov_smirnov':
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
                break;

            case 't_criterion_student_independent':
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
                break;

            case 't_criterion_student_dependent':
                const tDepVariable1 = tDepVariable1Select.value;
                const tDepVariable2 = tDepVariable2Select.value;

                if (!tDepVariable1 || !tDepVariable2) {
                    showMessage(analysisMessageContainer, 'Ошибка: Пожалуйста, выберите обе переменные для Т-критерия Стьюдента (зависимые выборки).', 'error');
                    return;
                }

                if (tDepVariable1 === tDepVariable2) {
                    showMessage(analysisMessageContainer, 'Ошибка: Выберите разные переменные для анализа.', 'error');
                    return;
                }

                analysisData.tests.push({
                    type: analysisType,
                    column1: tDepVariable1,
                    column2: tDepVariable2
                });
                break;

            case 'u_criterion_mann_whitney':
                const uIndependentVariable = uIndependentVariableSelect.value;
                const uGroupingVariable = uGroupingVariableSelect.value;

                if (!uIndependentVariable || !uGroupingVariable) {
                    showMessage(analysisMessageContainer, 'Ошибка: Пожалуйста, выберите независимую и группирующую переменные для U-критерия Манна-Уитни.', 'error');
                    return;
                }

                if (uIndependentVariable === uGroupingVariable) {
                    showMessage(analysisMessageContainer, 'Ошибка: Нельзя выбирать одинаковые колонки для независимой и группирующей переменной. Пожалуйста, выберите разные колонки.', 'error');
                    return;
                }

                analysisData.tests.push({
                    type: analysisType,
                    column1: uIndependentVariable,
                    column2: uGroupingVariable
                });
                break;

            case 't_criterion_wilcoxon':
                const wilcoxonVariable1 = document.getElementById('wilcoxon-variable1-select').value;
                const wilcoxonVariable2 = document.getElementById('wilcoxon-variable2-select').value;

                if (!wilcoxonVariable1 || !wilcoxonVariable2) {
                    showMessage(analysisMessageContainer, 'Ошибка: Пожалуйста, выберите обе переменные для Т-критерия Уилкоксона.', 'error');
                    return;
                }

                if (wilcoxonVariable1 === wilcoxonVariable2) {
                    showMessage(analysisMessageContainer, 'Ошибка: Выберите разные переменные для анализа.', 'error');
                    return;
                }

                analysisData.tests.push({
                    type: analysisType,
                    column1: wilcoxonVariable1,
                    column2: wilcoxonVariable2
                });
                break;

            case 'chi2_pearson':
                const chi2Variable1 = chi2Variable1Select.value;
                const chi2Variable2 = chi2Variable2Select.value;

                if (!chi2Variable1 || !chi2Variable2) {
                    showMessage(analysisMessageContainer, 'Ошибка: Пожалуйста, выберите обе группирующие переменные для Критерия Хи-квадрат Пирсона.', 'error');
                    return;
                }

                if (chi2Variable1 === chi2Variable2) {
                    showMessage(analysisMessageContainer, 'Ошибка: Выберите разные переменные для анализа.', 'error');
                    return;
                }

                analysisData.tests.push({
                    type: analysisType,
                    column1: chi2Variable1,
                    column2: chi2Variable2
                });
                break;

            case 'sensitivity_specificity':
                const sensitivityVariable1 = sensitivityVariable1Select.value;
                const sensitivityVariable2 = sensitivityVariable2Select.value;

                if (!sensitivityVariable1 || !sensitivityVariable2) {
                    showMessage(analysisMessageContainer, 'Ошибка: Пожалуйста, выберите фактор риска и исход для Чувствительности и Специфичности.', 'error');
                    return;
                }

                analysisData.tests.push({
                    type: analysisType,
                    column1: sensitivityVariable1,
                    column2: sensitivityVariable2
                });
                break;

            // Добавьте другие тесты по необходимости
            default:
                const column1 = column1Select.value;
                const column2 = column2Select.value;

                if (!column1 || !column2) {
                    showMessage(analysisMessageContainer, 'Ошибка: Пожалуйста, выберите обе колонки для анализа.', 'error');
                    return;
                }

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

        if (!token) {
            showMessage(analysisMessageContainer, 'Ошибка: Токен не найден. Пожалуйста, авторизуйтесь.', 'error');
            return;
        }

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

            hideMessage(analysisMessageContainer);
            displayFormattedResults(result);
        } catch (error) {
            console.error('Ошибка при выполнении анализа:', error);
        }
    });

    // Функция для отображения сообщений
    function showMessage(container, message, type) {
        container.classList.remove('hidden', 'success', 'error', 'warning');
        container.textContent = message;
        container.classList.add(type);
    }

    // Функция для скрытия сообщений
    function hideMessage(container) {
        container.classList.add('hidden');
        container.textContent = '';
        container.className = 'message-container hidden';
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

        if (!result.Результаты || typeof result.Результаты !== 'object') {
            showMessage(analysisMessageContainer, 'Ошибка: Недостаточные данные для отображения результатов.', 'error');
            return;
        }

        const results = result.Результаты;

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

                highlightErrorFields(testName, testResult.error);
            } else {
                // Удаление выделения ошибок, если анализ прошёл успешно
                removeAllInputErrors();

                const table = createResultTable(testResult);
                section.appendChild(table);

                addTestExplanation(testName);
            }

            resultsContainer.appendChild(section);
        }

        resultsContainer.classList.remove('hidden');
    }

    // Функция для создания таблицы результатов
    function createResultTable(testResult) {
        console.log('Создание таблицы для:', testResult); // Логируем testResult

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
            // Нормализуем ключ
            const normalizedKey = key.toLowerCase().replace(/ /g, '_');
            if (parameterExplanations[normalizedKey]) {
                tdKey.textContent = `${formatKey(key)} (${parameterExplanations[normalizedKey]})`;
            } else {
                tdKey.textContent = formatKey(key);
            }
            dataRow.appendChild(tdKey);

            const tdValue = document.createElement('td');
            if (Array.isArray(value)) {
                tdValue.textContent = JSON.stringify(value);
            } else {
                tdValue.textContent = value;
            }
            dataRow.appendChild(tdValue);

            tbody.appendChild(dataRow);
        }

        table.appendChild(tbody);
        return table;
    }

    // Функция для форматирования ключей
    function formatKey(key) {
        return key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    }

    // Функция для добавления пояснений к тестам
    function addTestExplanation(testName) {
        const explanation = document.createElement('div');
        explanation.classList.add('description-container');

        let p1, p2;

        switch(testName) {
            case 'kolmogorov_smirnov':
                p1 = document.createElement('p');
                p1.textContent = `Если p < 0.05, нулевая гипотеза отвергается, выборка не подчиняется одному распределению.`;

                p2 = document.createElement('p');
                p2.textContent = `Если p ≥ 0.05, нулевая гипотеза не отвергается, выборки могут подчиняться одному распределению.`;
                break;

            case 't_criterion_student_independent':
                p1 = document.createElement('p');
                p1.textContent = `Если p < 0.05, нулевая гипотеза отвергается, различия между группами статистически значимы.`;

                p2 = document.createElement('p');
                p2.textContent = `Если p ≥ 0.05, нулевая гипотеза не отвергается, различия между группами не являются статистически значимыми.`;
                break;

            case 't_criterion_student_dependent':
                p1 = document.createElement('p');
                p1.textContent = `Если p < 0.05, нулевая гипотеза отвергается, различия между зависимыми группами значимы.`;

                p2 = document.createElement('p');
                p2.textContent = `Если p ≥ 0.05, нулевая гипотеза не отвергается, различия между зависимыми группами не являются статистически значимыми.`;
                break;

            case 'u_criterion_mann_whitney':
                p1 = document.createElement('p');
                p1.textContent = `Если p < 0.05, нулевая гипотеза отвергается, различия между группами статистически значимы и носят системный характер.`;

                p2 = document.createElement('p');
                p2.textContent = `Если p ≥ 0.05, нулевая гипотеза не отвергается, различия не являются статистически значимыми и носят случайный характер.`;
                break;

            case 't_criterion_wilcoxon':
                p1 = document.createElement('p');
                p1.textContent = `Если p < 0.05, нулевая гипотеза отвергается, принимается альтернативная, различия обладают статистической значимостью и носят системный характер.`;

                p2 = document.createElement('p');
                p2.textContent = `Если p ≥ 0.05, принимается нулевая гипотеза, различия не являются статистически значимыми и носят случайный характер.`;
                break;

            case 'chi2_pearson':
                p1 = document.createElement('p');
                p1.textContent = `Если p < 0.05, нулевая гипотеза отвергается, существует статистически значимая зависимость между переменными.`;

                p2 = document.createElement('p');
                p2.textContent = `Если p ≥ 0.05, принимается нулевая гипотеза, зависимости между переменными нет.`;
                break;

            case 'sensitivity_specificity':
                p1 = document.createElement('p');
                p1.textContent = `Чувствительность (Sensitivity) показывает, насколько тест способен правильно идентифицировать положительные случаи. Высокая чувствительность означает, что тест редко пропускает истинные положительные результаты.`;

                p2 = document.createElement('p');
                p2.textContent = `Специфичность (Specificity) показывает, насколько тест способен правильно идентифицировать отрицательные случаи. Высокая специфичность означает, что тест редко ошибается в сторону ложноположительных результатов.`;
                break;

            // Добавьте пояснения для других тестов по необходимости

            default:
                return;
        }

        explanation.appendChild(p1);
        explanation.appendChild(p2);
        resultsContainer.lastChild.appendChild(explanation);
    }

    // Функция для выделения полей с ошибками
    function highlightErrorFields(testName, errorMessage) {
        switch(testName) {
            case 'kolmogorov_smirnov':
                if (errorMessage.includes('независимую переменную')) {
                    independentVariableSelect.classList.add('input-error');
                }
                if (errorMessage.includes('группирующую переменную')) {
                    groupingVariableSelect.classList.add('input-error');
                }
                break;
            case 't_criterion_student_independent':
                if (errorMessage.includes('column1')) {
                    tIndepIndependentVariableSelect.classList.add('input-error');
                }
                if (errorMessage.includes('column2')) {
                    tIndepGroupingVariableSelect.classList.add('input-error');
                }
                break;
            case 't_criterion_student_dependent':
                if (errorMessage.includes('column1')) {
                    tDepVariable1Select.classList.add('input-error');
                }
                if (errorMessage.includes('column2')) {
                    tDepVariable2Select.classList.add('input-error');
                }
                break;
            case 'u_criterion_mann_whitney':
                if (errorMessage.includes('одинаковые колонки')) {
                    uIndependentVariableSelect.classList.add('input-error');
                    uGroupingVariableSelect.classList.add('input-error');
                }
                if (errorMessage.includes('независимую переменную')) {
                    uIndependentVariableSelect.classList.add('input-error');
                }
                if (errorMessage.includes('группирующую переменную')) {
                    uGroupingVariableSelect.classList.add('input-error');
                }
                break;
            case 'chi2_pearson':
                if (errorMessage.includes('переменную')) {
                    chi2Variable1Select.classList.add('input-error');
                    chi2Variable2Select.classList.add('input-error');
                }
                break;
            case 'sensitivity_specificity':
                if (errorMessage.includes('фактор риска')) {
                    sensitivityVariable1Select.classList.add('input-error');
                }
                if (errorMessage.includes('исход')) {
                    sensitivityVariable2Select.classList.add('input-error');
                }
                break;
            // Добавьте обработку для других тестов при необходимости
            default:
                if (errorMessage.includes('колонки') || errorMessage.includes('переменные')) {
                    column1Select.classList.add('input-error');
                    column2Select.classList.add('input-error');
                }
        }
    }

    // Функция для удаления выделения ошибок со всех полей
    function removeAllInputErrors() {
        independentVariableSelect.classList.remove('input-error');
        groupingVariableSelect.classList.remove('input-error');
        column1Select.classList.remove('input-error');
        column2Select.classList.remove('input-error');
        tIndepIndependentVariableSelect.classList.remove('input-error');
        tIndepGroupingVariableSelect.classList.remove('input-error');
        tDepVariable1Select.classList.remove('input-error');
        tDepVariable2Select.classList.remove('input-error');
        uIndependentVariableSelect.classList.remove('input-error');
        uGroupingVariableSelect.classList.remove('input-error');
        chi2Variable1Select.classList.remove('input-error');
        chi2Variable2Select.classList.remove('input-error');
        sensitivityVariable1Select.classList.remove('input-error');
        sensitivityVariable2Select.classList.remove('input-error');
    }

    // Функция для отображения сообщений об ошибках
    function mapErrorMessage(errorMessage) {
        const patterns = [
            { regex: /unsupported operand type\(s\) for .*: 'str' and 'int'/i, message: 'Вы выбрали строковые и числовые значения одновременно. Пожалуйста, выберите либо числовые колонки, либо корректный тип данных.' },
            { regex: /'int'\s+and\s+'str'|'str'\s+and\s+'int'/i, message: 'Вы выбрали строковые и числовые значения одновременно. Пожалуйста, выберите либо числовые колонки, либо корректный тип данных.' },
            { regex: /Группирующая переменная ".+" должна быть бинарной \(содержать два уникальных значения\)/i, message: 'Группирующая переменная должна содержать только два уникальных значения (например, 0 и 1).' },
            { regex: /nan/i, message: 'Некоторые значения в результате анализа равны NaN. Проверьте данные.' },
            { regex: /одинаковые колонки/i, message: 'Нельзя выбирать одинаковые колонки для независимой и группирующей переменной. Пожалуйста, выберите разные колонки.' },
            { regex: /фактор риска/i, message: 'Проверьте выбранный фактор риска. Убедитесь, что он бинарный и правильно выбран.' },
            { regex: /исход/i, message: 'Проверьте выбранный исход. Убедитесь, что он бинарный и правильно выбран.' }
        ];

        for (const pattern of patterns) {
            if (pattern.regex.test(errorMessage)) {
                return pattern.message;
            }
        }

        return 'Произошла неизвестная ошибка при выполнении анализа. Попробуйте позже или свяжитесь с поддержкой.';
    }

});
