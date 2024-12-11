document.addEventListener('DOMContentLoaded', () => {
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

    const chartDescriptions = {
        scatter_matrix: "Матрица рассеяния: это диаграмма, где данные представлены точками на плоскости...",
        histogram: "Гистограмма: это графическое представление распределения данных по интервалам...",
        heatmap: "Тепловая карта: это визуальный инструмент для отображения плотности распределения...",
        scatter_plot: "Диаграмма рассеяния: показывает связь между двумя переменными...",
        box_plot: "Ящиковая диаграмма: визуализирует медиану, квартили, разброс данных и выбросы...",
        pie_chart: "Круговая диаграмма: отображает доли или процентное соотношение группы данных...",
        multiple_histograms: "Множественная гистограмма: включает несколько гистограмм для сравнения...",
        line_chart: "Линейный график: используется для отображения изменения значений во времени...",
        logarithmic_chart: "Логарифмический график: график с логарифмической шкалой..."
    };

    chartTypeSelect.addEventListener('change', () => {
        const selectedType = chartTypeSelect.value;
        chartTooltip.textContent = chartDescriptions[selectedType] || "Выберите тип графика для анализа данных.";
    });

    const initialType = chartTypeSelect.value;
    chartTooltip.textContent = chartDescriptions[initialType] || "Выберите тип графика для анализа данных.";

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

    function showMessage(message, type) {
        messageContainer.classList.remove('hidden');
        messageContainer.textContent = message;
        messageContainer.className = `message-container ${type}`;
    }

    function hideElements(elements) {
        elements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (element) {
                element.classList.add('hidden');
            }
        });
    }

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

    function displayPlotlyChart(figure) {
        if (!figure || !figure.data || !Array.isArray(figure.data) || figure.data.length === 0) {
            console.error('Ошибка: Данные для графика отсутствуют или некорректны.', figure);
            showMessage('Ошибка: Данные для графика отсутствуют или некорректны.', 'error');
            return;
        }
    
        const chartCard = document.createElement('div');
        chartCard.className = 'chart-card';
        chartCard.style.position = 'relative'; // Для абсолютного позиционирования кнопок
    
        const graphDiv = document.createElement('div');
        chartCard.appendChild(graphDiv);
    
        // Создание контейнера для кнопок
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.position = 'absolute';
        buttonsContainer.style.top = '10px';
        buttonsContainer.style.right = '10px';
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.flexDirection = 'column';
        buttonsContainer.style.zIndex = '1000'; // Поверх графика
    
        // Создание кнопки Zoom In
        const zoomInButton = document.createElement('button');
        zoomInButton.textContent = '+';
        zoomInButton.style.margin = '2px';
        zoomInButton.style.padding = '5px';
        zoomInButton.style.fontSize = '16px';
        zoomInButton.style.cursor = 'pointer';
        zoomInButton.title = 'Zoom In';
        buttonsContainer.appendChild(zoomInButton);
    
        // Создание кнопки Zoom Out
        const zoomOutButton = document.createElement('button');
        zoomOutButton.textContent = '-';
        zoomOutButton.style.margin = '2px';
        zoomOutButton.style.padding = '5px';
        zoomOutButton.style.fontSize = '16px';
        zoomOutButton.style.cursor = 'pointer';
        zoomOutButton.title = 'Zoom Out';
        buttonsContainer.appendChild(zoomOutButton);
    
        // Создание кнопки Reset Zoom
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset';
        resetButton.style.margin = '2px';
        resetButton.style.padding = '5px';
        resetButton.style.fontSize = '12px';
        resetButton.style.cursor = 'pointer';
        resetButton.title = 'Reset Zoom';
        buttonsContainer.appendChild(resetButton);
    
        chartCard.appendChild(buttonsContainer);
    
        chartContainer.appendChild(chartCard);
        chartContainer.classList.remove('hidden');
        messageContainer.classList.add('hidden');
    
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
            displayModeBar: false // Скрываем стандартную панель управления Plotly
        };
    
        try {
            Plotly.newPlot(graphDiv, figure.data, figure.layout, config);
    
            // Обработчик для кнопки Zoom In
            zoomInButton.addEventListener('click', () => {
                const currentLayout = graphDiv.layout;
                const xRange = currentLayout.xaxis.range;
                const yRange = currentLayout.yaxis.range;
    
                if (xRange && yRange) {
                    const xCenter = (xRange[0] + xRange[1]) / 2;
                    const yCenter = (yRange[0] + yRange[1]) / 2;
                    const xWidth = (xRange[1] - xRange[0]) * 0.5; // Уменьшаем диапазон до 50%
                    const yHeight = (yRange[1] - yRange[0]) * 0.5;
    
                    const newXRange = [xCenter - xWidth / 2, xCenter + xWidth / 2];
                    const newYRange = [yCenter - yHeight / 2, yCenter + yHeight / 2];
    
                    Plotly.relayout(graphDiv, {
                        'xaxis.range': newXRange,
                        'yaxis.range': newYRange
                    });
                }
            });
    
            // Обработчик для кнопки Zoom Out
            zoomOutButton.addEventListener('click', () => {
                const currentLayout = graphDiv.layout;
                const xRange = currentLayout.xaxis.range;
                const yRange = currentLayout.yaxis.range;
    
                if (xRange && yRange) {
                    const xCenter = (xRange[0] + xRange[1]) / 2;
                    const yCenter = (yRange[0] + yRange[1]) / 2;
                    const xWidth = (xRange[1] - xRange[0]) * 2; // Увеличиваем диапазон до 200%
                    const yHeight = (yRange[1] - yRange[0]) * 2;
    
                    const newXRange = [xCenter - xWidth / 2, xCenter + xWidth / 2];
                    const newYRange = [yCenter - yHeight / 2, yCenter + yHeight / 2];
    
                    Plotly.relayout(graphDiv, {
                        'xaxis.range': newXRange,
                        'yaxis.range': newYRange
                    });
                }
            });
    
            // Обработчик для кнопки Reset Zoom
            resetButton.addEventListener('click', () => {
                Plotly.relayout(graphDiv, {
                    'xaxis.autorange': true,
                    'yaxis.autorange': true
                });
            });
    
        } catch (error) {
            console.error('Ошибка при отрисовке графика:', error);
            showMessage('Ошибка при отрисовке графика. Проверьте данные.', 'error');
        }
    }    

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
