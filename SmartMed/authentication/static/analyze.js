document.addEventListener('DOMContentLoaded', () => {
    // Получение элементов DOM
    const uploadForm = document.getElementById('file-upload-form');
    const fileInput = document.getElementById('file-input');
    const messageContainer = document.getElementById('message-container');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const chartOptions = document.getElementById('chart-options');
    const chartTypeSelect = document.getElementById('chart-type');
    const chartTooltip = document.getElementById('chart-tooltip');
    const buildChartButton = document.getElementById('build-chart');
    const clearChartsButton = document.getElementById('clear-charts');
    const chartContainer = document.getElementById('chart-container');
    const checkboxContainer = document.getElementById('checkbox-container');
    const statsContainer = document.getElementById('stats-container');
    const statsDescriptionContainer = document.getElementById('stats-description-container');
    let columns = [];

    // Описания типов графиков
    const chartDescriptions = {
        scatter_matrix: "Матрица рассеяния: это диаграмма, где каждая переменная представлена на обоих осях, создавая сетку диаграмм рассеяния для каждой пары переменных. Это позволяет визуально оценить взаимосвязи между всеми парами переменных в наборе данных.",
        histogram: "Гистограмма: это графическое представление распределения данных, разделённых на интервалы (бары). Каждая колонка показывает количество наблюдений, попадающих в соответствующий интервал.",
        heatmap: "Тепловая карта: это визуальный инструмент для отображения величин через цвета. Используется для представления плотности распределения или корреляции между переменными.",
        scatter_plot: "Диаграмма рассеяния: показывает взаимосвязь между двумя количественными переменными, где каждая точка представляет наблюдение с координатами по этим переменным.",
        box_plot: "Ящиковая диаграмма: визуализирует распределение данных по пяти числовым характеристикам: минимум, первый квартиль, медиана, третий квартиль и максимум. Также показывает выбросы.",
        pie_chart: "Круговая диаграмма: отображает доли или процентное соотношение различных категорий данных в виде секторов круга.",
        multiple_histograms: "Множественная гистограмма: включает несколько гистограмм на одном графике для сравнения распределений различных категорий или групп данных.",
        line_chart: "Линейный график: используется для отображения изменений значений переменных во времени или другой непрерывной шкале.",
        logarithmic_chart: "Логарифмический график: график, где одна из осей (или обе) имеет логарифмическую шкалу, что позволяет отображать данные с широким диапазоном значений более компактно."
    };

    // Обработчик изменения типа графика
    chartTypeSelect.addEventListener('change', () => {
        const selectedType = chartTypeSelect.value;
        chartTooltip.textContent = chartDescriptions[selectedType] || "Выберите тип графика для анализа данных.";
    });

    // Инициализация подсказки при загрузке страницы
    const initialType = chartTypeSelect.value;
    chartTooltip.textContent = chartDescriptions[initialType] || "Выберите тип графика для анализа данных.";

    // Обработчик отправки формы загрузки файла
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        hideElements(['message-container', 'chart-options', 'chart-container', 'stats-container', 'stats-description-container']);
        chartContainer.innerHTML = '';
        statsContainer.innerHTML = '';
        statsDescriptionContainer.innerHTML = '';

        const file = fileInput.files[0];
        if (!file) {
            showMessage('Ошибка: Выберите файл для загрузки.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('Ошибка: Токен не найден. Пожалуйста, авторизуйтесь.', 'error');
            return;
        }

        progressContainer.style.display = 'flex';
        progressBar.value = 0;

        try {
            const response = await fetch('/upload/', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            progressBar.value = 50;

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Ошибка загрузки файла: ${errorData.error || 'Неизвестная ошибка'}`);
            }

            const data = await response.json();
            progressBar.value = 100;
            setTimeout(() => progressContainer.style.display = 'none', 500);

            if (data.error) {
                showMessage(data.error, 'error');
            } else {
                showMessage('Файл успешно загружен.', 'success');
                columns = data.columns;
                createCheckboxes(columns);
                chartOptions.classList.remove('hidden');

                // После успешной загрузки файла получаем описательную статистику
                fetchDescriptiveStats(token);
            }
        } catch (error) {
            progressContainer.style.display = 'none';
            showMessage(`Ошибка при загрузке файла: ${error.message}`, 'error');
            console.error('Ошибка при загрузке файла:', error);
        }
    });

    // Функция для отображения сообщений
    function showMessage(message, type) {
        messageContainer.classList.remove('hidden');
        messageContainer.textContent = message;
        messageContainer.className = `message-container ${type}`;
    }

    // Функция для скрытия элементов
    function hideElements(elements) {
        elements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                element.classList.add('hidden');
            }
        });
    }

    // Функция для создания чекбоксов на основе колонок данных
    function createCheckboxes(columns) {
        checkboxContainer.innerHTML = '';
        columns.forEach(column => {
            const label = document.createElement('label');
            label.textContent = column;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'columns';
            checkbox.value = column;

            label.prepend(checkbox);
            label.className = 'checkbox-label';
            checkboxContainer.appendChild(label);
        });
    }

    // Обработчик нажатия на кнопку построения графика
    buildChartButton.addEventListener('click', () => {
        const selectedGraph = chartTypeSelect.value;
        const selectedColumns = Array.from(checkboxContainer.querySelectorAll('input[name="columns"]:checked')).map(cb => cb.value);

        if (selectedColumns.length === 0) {
            showMessage('Ошибка: Выберите хотя бы один столбец.', 'error');
            return;
        }

        let x_axis = null;
        let y_axis = null;
        let column = null;

        if (['scatter_plot', 'line_chart', 'logarithmic_chart'].includes(selectedGraph)) {
            if (selectedColumns.length !== 2) {
                showMessage('Ошибка: Для этого графика необходимо выбрать ровно два столбца.', 'error');
                return;
            }
            x_axis = selectedColumns[0];
            y_axis = selectedColumns[1];
        }

        if (selectedGraph === 'scatter_matrix' && selectedColumns.length < 3) {
            showMessage('Ошибка: Для матрицы рассеяния выберите минимум 3 столбца.', 'error');
            return;
        }

        if (selectedGraph === 'pie_chart') {
            if (selectedColumns.length !== 1) {
                showMessage('Ошибка: Для круговой диаграммы необходимо выбрать ровно один столбец.', 'error');
                return;
            }
            column = selectedColumns[0];
        }

        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('Ошибка: Токен не найден. Пожалуйста, авторизуйтесь.', 'error');
            return;
        }

        const requestData = {
            chart_type: selectedGraph,
            selected_columns: selectedColumns
        };

        if (x_axis && y_axis) {
            requestData.x_axis = x_axis;
            requestData.y_axis = y_axis;
        }
        if (column) {
            requestData.column = column;
        }

        fetch('/generate-chart/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.error || 'Неизвестная ошибка');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Полученные данные от сервера:', data);
            if (data.error) {
                showMessage(data.error, 'error');
            } else if (data.figure) {
                displayPlotlyChart(data.figure);
            } else {
                showMessage('Ошибка: данные для графика отсутствуют.', 'error');
            }
        })
        .catch(error => {
            console.error('Ошибка при запросе:', error);
            showMessage(`Ошибка при запросе на сервер: ${error.message}`, 'error');
        });
    });

    // Функция для отображения графика Plotly с встроенными кнопками
    function displayPlotlyChart(figure) {
        if (!figure || !figure.data || !Array.isArray(figure.data) || figure.data.length === 0) {
            console.error('Ошибка: Данные для графика отсутствуют или некорректны.', figure);
            showMessage('Ошибка: Данные для графика отсутствуют или некорректны.', 'error');
            return;
        }

        const chartCard = document.createElement('div');
        chartCard.className = 'chart-card';

        const graphDiv = document.createElement('div');
        chartCard.appendChild(graphDiv);

        // Проверка типа графика
        const isScatterMatrix = figure.type === 'splom'; // 'splom' - тип Scatter Matrix в Plotly

        chartContainer.appendChild(chartCard);
        chartContainer.classList.remove('hidden');
        messageContainer.classList.add('hidden');

        // Настройка layout графика
        figure.layout = figure.layout || {};
        figure.layout = {
            ...figure.layout,
            autosize: true,
            margin: { l: 50, r: 50, t: 50, b: 50 },
            font: { family: 'Montserrat, sans-serif', size: 12, color: '#333' },
            title: { text: figure.layout.title?.text || 'График', font: { size: 16 } },
            plot_bgcolor: '#ffffff',
            paper_bgcolor: '#ffffff',
            xaxis: {
                title: { text: figure.layout.xaxis?.title?.text || 'Ось X', font: { size: 14 } },
                tickfont: { size: 12 }
            },
            yaxis: {
                title: { text: figure.layout.yaxis?.title?.text || 'Ось Y', font: { size: 14 } },
                tickfont: { size: 12 }
            },
            legend: { font: { size: 12 } }
        };

        const config = {
            responsive: true,
            displayModeBar: true // Показываем встроенную панель инструментов Plotly
        };

        try {
            Plotly.newPlot(graphDiv, figure.data, figure.layout, config);
        } catch (error) {
            console.error('Ошибка при отрисовке графика:', error);
            showMessage('Ошибка при отрисовке графика. Проверьте данные.', 'error');
        }
    }

    // Обработчик нажатия на кнопку очистки графиков
    clearChartsButton.addEventListener('click', () => {
        chartContainer.innerHTML = '';
        chartContainer.classList.add('hidden');
    });

    // Функция для получения описательной статистики
    function fetchDescriptiveStats(token) {
        fetch('/get_descriptive_stats/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`
            }
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(errData => {
                    throw new Error(errData.error || 'Неизвестная ошибка');
                });
            }
            return res.json();
        })
        .then(data => {
            console.log('Полученные данные статистики:', data); // Для отладки
            if (data.error) {
                showMessage(data.error, 'error');
            } else if (data.stats) {
                renderDescriptiveTable(data.stats);
                renderDescriptions();
                statsContainer.classList.remove('hidden');
                statsDescriptionContainer.classList.remove('hidden');
            }
        })
        .catch(error => {
            console.error('Ошибка получения статистики:', error);
            showMessage('Ошибка получения статистики.', 'error');
        });
    }

    // Функция для отображения таблицы описательной статистики
    function renderDescriptiveTable(stats) {
        // Явно указываем желаемые столбцы, включая 'geom_mean' и 'variation'
        const desiredColumns = ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max', 'geom_mean', 'variation'];
        
        const container = document.createElement('div');
        container.className = 'descriptive-table-container';
    
        const table = document.createElement('table');
        table.className = 'descriptive-table';
    
        // Создание заголовка таблицы
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
    
        // Первый столбец заголовка — "Метрики"
        const thMetric = document.createElement('th');
        thMetric.textContent = 'Метрики';
        headerRow.appendChild(thMetric);
    
        // Добавляем заголовки для желаемых столбцов
        desiredColumns.forEach(columnName => {
            const th = document.createElement('th');
            th.textContent = columnName;
            headerRow.appendChild(th);
        });
    
        thead.appendChild(headerRow);
        table.appendChild(thead);
    
        // Создание тела таблицы
        const tbody = document.createElement('tbody');
    
        // Итерация по каждой колонке в stats
        Object.keys(stats).forEach(columnName => {
            const row = document.createElement('tr');
    
            // Первая ячейка — имя колонки
            const columnCell = document.createElement('td');
            columnCell.textContent = columnName;
            row.appendChild(columnCell);
    
            // Добавляем значения для желаемых метрик
            desiredColumns.forEach(metric => {
                const cell = document.createElement('td');
                const value = stats[columnName][metric];
                cell.textContent = value !== undefined && value !== null ? value : '-';
                row.appendChild(cell);
            });
    
            tbody.appendChild(row);
        });
    
        table.appendChild(tbody);
        container.appendChild(table);
    
        // Добавляем контейнер с таблицей в statsContainer
        statsContainer.innerHTML = ''; // Очищаем предыдущие данные
        statsContainer.appendChild(container);
    }      

    // Функция для отображения описаний статистических показателей
    function renderDescriptions() {
        statsDescriptionContainer.className = 'description-container';
        statsDescriptionContainer.innerHTML = `
            <h2>Описание статистических показателей</h2>
            <p><strong>Среднее (mean)</strong> - значение, рассчитываемое делением суммы всех значений выборки на её объём.</p>
            <p><strong>Стандартное отклонение (std)</strong> - мера разброса значений вокруг среднего. Чем больше std, тем больше вариабельность данных.</p>
            <p><strong>Количество (count)</strong> - количество наблюдений (строк) в выборке.</p>
            <p><strong>Квартиль (25%, 50%, 75%)</strong> - значения, которые делят упорядоченную выборку на четыре части. 50% - это медиана.</p>
            <p><strong>Минимум (min)</strong> - наименьшее значение выборки.</p>
            <p><strong>Максимум (max)</strong> - наибольшее значение выборки.</p>
            <p><strong>Геометрическое среднее (geom_mean)</strong> - среднее значение, рассчитанное через логарифмы, отражает средний темп роста.</p>
            <p><strong>Вариация (variation)</strong> - коэффициент вариации (std/mean), мера относительного разброса данных.</p>
        `;
    }
});
