document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('file-upload-form');
    const fileInput = document.getElementById('file-input');
    const messageContainer = document.getElementById('message-container');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const chartOptions = document.getElementById('chart-options');
    const chartTypeSelect = document.getElementById('chart-type');
    const chartTooltip = document.getElementById('chart-tooltip'); // Исправление: объявлена переменная
    const buildChartButton = document.getElementById('build-chart');
    const clearChartsButton = document.getElementById('clear-charts');
    const chartContainer = document.getElementById('chart-container');
    const checkboxContainer = document.getElementById('checkbox-container');
    let columns = [];
    let uploadedFilePath = '';

    const chartDescriptions = {
        scatter_matrix: "Матрица рассеяния: это диаграмма, где данные представлены точками на плоскости. Используется для визуального анализа взаимосвязей между двумя переменными. Сила корреляции определяется близостью точек на графике.",
        histogram: "Гистограмма: это графическое представление распределения данных по интервалам. Помогает визуально оценить форму распределения данных и выявить его особенности, такие как мода, средние значения и разброс.",
        heatmap: "Тепловая карта (хитмап): это визуальный инструмент для отображения плотности распределения значений данных и выявления их корреляций с помощью цветовой палитры.",
        scatter_plot: "Диаграмма рассеяния: показывает связь между двумя переменными. Используется для анализа корреляций и выявления аномалий.",
        box_plot: "Ящиковая диаграмма: визуализирует медиану, квартили, разброс данных и выбросы. Позволяет оценить диапазон и распределение значений в выборке.",
        pie_chart: "Круговая диаграмма: отображает доли или процентное соотношение группы данных относительно всей совокупности.",
        multiple_histograms: "Множественная гистограмма: включает несколько гистограмм для сравнения форм и плотности распределений между разными группами.",
        line_chart: "Линейный график: используется для отображения изменения значений одной или нескольких переменных во времени или другой зависимости.",
        logarithmic_chart: "Логарифмический график: это график, где одна или обе оси используют логарифмическую шкалу. Применяется для анализа данных с широким диапазоном значений."
    };    

    chartTypeSelect.addEventListener('change', () => {
        const selectedType = chartTypeSelect.value;
        chartTooltip.textContent = chartDescriptions[selectedType] || "Выберите тип графика для анализа данных.";
    });

    const initialType = chartTypeSelect.value;
    chartTooltip.textContent = chartDescriptions[initialType] || "Выберите тип графика для анализа данных.";

    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Hide elements and clear chart container
        hideElements(['messageContainer', 'chartOptions', 'chartContainer']);
        chartContainer.innerHTML = '';

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
                uploadedFilePath = data.file_path; // Get the file path
                createCheckboxes(columns);
                chartOptions.classList.remove('hidden');
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
        checkboxContainer.innerHTML = ''; // Clear the container

        columns.forEach(column => {
            const label = document.createElement('label');
            label.textContent = column;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'columns';
            checkbox.value = column;

            label.prepend(checkbox);
            label.className = 'checkbox-label'; // Add class for styling
            checkboxContainer.appendChild(label);
        });
    }

    buildChartButton.addEventListener('click', () => {
        const selectedGraph = chartTypeSelect.value;
        const selectedColumns = Array.from(checkboxContainer.querySelectorAll('input[name="columns"]:checked')).map(cb => cb.value);

        // Validate that at least one column is selected
        if (selectedColumns.length === 0) {
            showMessage('Ошибка: Выберите хотя бы один столбец.', 'error');
            return;
        }

        let x_axis = null;
        let y_axis = null;
        let column = null; // For pie_chart

        // Logic for charts requiring a specific number of columns
        if (selectedGraph === 'scatter_plot' || selectedGraph === 'line_chart' || selectedGraph === 'logarithmic_chart') {
            if (selectedColumns.length !== 2) {
                showMessage('Ошибка: Для этого графика необходимо выбрать ровно два столбца.', 'error');
                return;
            }
            // Assign first column as x_axis, second as y_axis
            x_axis = selectedColumns[0];
            y_axis = selectedColumns[1];
        }

        // Validation for scatter_matrix
        if (selectedGraph === 'scatter_matrix') {
            if (selectedColumns.length < 3) {
                showMessage('Ошибка: Выберите минимум 3 столбца либо постройте график через Диаграмма Рассеяния.', 'error');
                return;
            }
        }

        // Validation for pie_chart
        if (selectedGraph === 'pie_chart') {
            if (selectedColumns.length !== 1) {
                showMessage('Ошибка: Для круговой диаграммы необходимо выбрать ровно один столбец.', 'error');
                return;
            }
            // Assign the selected column as column
            column = selectedColumns[0];
        }

        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('Ошибка: Токен не найден. Пожалуйста, авторизуйтесь.', 'error');
            return;
        }

        const requestData = {
            chart_type: selectedGraph,
            selected_columns: selectedColumns,
            data_path: uploadedFilePath // Pass the file path
        };

        // Add x_axis and y_axis if necessary
        if (x_axis && y_axis) {
            requestData.x_axis = x_axis;
            requestData.y_axis = y_axis;
        }

        // Add column if necessary
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
            console.log('Полученные данные от сервера:', data); // Logging
            if (data.error) {
                showMessage(data.error, 'error');
            } else if (data.figure) {
                displayPlotlyChart(data.figure);
            } else {
                showMessage('Ошибка: данные для графика отсутствуют.', 'error');
            }
        })
        .catch(error => {
            console.error('Ошибка при запросе:', error); // Logging
            showMessage(`Ошибка при запросе на сервер: ${error.message}`, 'error');
        });
    });

    function displayPlotlyChart(figure) {
        // Check for data and its correctness
        if (!figure || !figure.data || !Array.isArray(figure.data) || figure.data.length === 0) {
            console.error('Ошибка: Данные для графика отсутствуют или некорректны.', figure);
            showMessage('Ошибка: Данные для графика отсутствуют или некорректны.', 'error');
            return;
        }

        // Create a chart card
        const chartCard = document.createElement('div');
        chartCard.className = 'chart-card';

        // Create a container for the chart
        const graphDiv = document.createElement('div');
        chartCard.appendChild(graphDiv);

        // Add the card to the chart container
        chartContainer.appendChild(chartCard);
        chartContainer.classList.remove('hidden');
        messageContainer.classList.add('hidden');

        // Ensure layout is defined
        figure.layout = figure.layout || {};

        // Update layout for responsiveness
        figure.layout = {
            ...figure.layout,
            autosize: true,
            margin: {
                l: 50, r: 50, t: 50, b: 50
            },
            font: {
                family: 'Montserrat, sans-serif',
                size: 12,
                color: '#333'
            },
            title: {
                text: figure.layout.title?.text || 'График',
                font: {
                    size: 16
                }
            },
            plot_bgcolor: '#ffffff',
            paper_bgcolor: '#ffffff',
            xaxis: {
                title: {
                    text: figure.layout.xaxis?.title?.text || 'Ось X',
                    font: {
                        size: 14
                    }
                },
                tickfont: {
                    size: 12
                }
            },
            yaxis: {
                title: {
                    text: figure.layout.yaxis?.title?.text || 'Ось Y',
                    font: {
                        size: 14
                    }
                },
                tickfont: {
                    size: 12
                }
            },
            legend: {
                font: {
                    size: 12
                }
            }
        };

        // Plotly configuration
        const config = {
            responsive: true,
            displayModeBar: false // Disable the toolbar
        };

        try {
            // Display the chart
            Plotly.newPlot(graphDiv, figure.data, figure.layout, config);
        } catch (error) {
            console.error('Ошибка при отрисовке графика:', error);
            showMessage('Ошибка при отрисовке графика. Проверьте данные.', 'error');
        }
    }

    // Button to clear charts
    clearChartsButton.addEventListener('click', () => {
        chartContainer.innerHTML = '';
        chartContainer.classList.add('hidden');
    });
});
