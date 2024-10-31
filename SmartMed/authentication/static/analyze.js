document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('file-upload-form');
    const fileInput = document.getElementById('file-input');
    const errorMessage = document.getElementById('upload-error');
    const chartTypeSelect = document.getElementById('chart-type');
    const xAxisSelect = document.getElementById('x-axis');
    const yAxisSelect = document.getElementById('y-axis');
    const buildChartButton = document.getElementById('build-chart');
    const chartContainer = document.getElementById('chart-container');
    let chartData = null; // Переменная для хранения данных с сервера

    // Отправка формы и загрузка файла на сервер
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        errorMessage.textContent = '';

        if (!fileInput.files.length) {
            errorMessage.textContent = 'Пожалуйста, выберите файл.';
            return;
        }

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        const token = localStorage.getItem('token');  // Получаем токен (если он нужен)
        if (!token) {
            errorMessage.textContent = 'Токен не найден. Пожалуйста, авторизуйтесь.';
            return;
        }

        // Отправка файла на сервер и получение данных для графиков
        fetch('/upload/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                'Authorization': `Token ${token}`  // Добавляем токен авторизации
            }
        })
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.error) {
                errorMessage.textContent = data.error;
            } else {
                // Сохраняем данные с сервера для дальнейшего использования
                chartData = data;  
                errorMessage.textContent = 'Файл успешно загружен. Теперь выберите тип графика и постройте его.';
                
                // Заполняем селекторы для осей X и Y
                populateAxisSelectors(data.columns);
            }
        })
        .catch(error => {
            errorMessage.textContent = 'Ошибка при загрузке файла. Попробуйте снова.';
            console.error('Ошибка при загрузке файла:', error);
        });
    });

    // Заполнение селекторов осей X и Y
    function populateAxisSelectors(columns) {
        if (!columns || !Array.isArray(columns)) {
            console.error('Ошибка: колонки не были получены');
            return;
        }

        xAxisSelect.innerHTML = '';  
        yAxisSelect.innerHTML = '';  
        
        columns.forEach(column => {
            const optionX = document.createElement('option');
            const optionY = document.createElement('option');
            optionX.value = column;
            optionX.textContent = column;
            optionY.value = column;
            optionY.textContent = column;

            xAxisSelect.appendChild(optionX);
            yAxisSelect.appendChild(optionY);
        });
    }

    // Построение графика при нажатии на кнопку
    buildChartButton.addEventListener('click', () => {
        const selectedGraph = chartTypeSelect.value;
        const xAxis = xAxisSelect.value;
        const yAxis = yAxisSelect.value;

        // Очищаем предыдущую ошибку перед новым построением графика
        errorMessage.textContent = '';

        if (!chartData || !chartData[selectedGraph]) {
            errorMessage.textContent = 'График не найден или данные для графика отсутствуют.';
            return;
        }

        const key = generateGraphKey(selectedGraph, xAxis, yAxis);

        if (chartData[key] && chartData[key].data && chartData[key].layout) {
            displayPlotlyChart(chartData[key], selectedGraph);
        } else {
            errorMessage.textContent = 'График не найден или данные для графика отсутствуют.';
        }
    });

    // Генерация ключа для получения нужных данных из chartData
    function generateGraphKey(graphType, xAxis, yAxis) {
        if (graphType === 'scatter_plot' || graphType === 'line_chart' || graphType === 'logarithmic_chart') {
            return `${graphType}_${xAxis}_vs_${yAxis}`;
        }
        return graphType;  // Для других графиков  возвращаем просто тип
    }

    // Функция для отображения графика с использованием Plotly
    function displayPlotlyChart(graphData, graphType) {
        const plotlyData = graphData.data;
        const plotlyLayout = graphData.layout;

        // Отображаем график с Plotly
        Plotly.newPlot('chart', plotlyData, plotlyLayout);

        // Очищаем сообщение об ошибке, если график успешно построен
        errorMessage.textContent = '';
    }
});
