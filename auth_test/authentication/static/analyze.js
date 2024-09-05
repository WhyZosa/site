document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('file-upload-form');
    const fileInput = document.getElementById('file-input');
    const errorMessage = document.getElementById('upload-error');
    const chartContainer = document.getElementById('chart');
    form.addEventListener('submit', function(event) {        event.preventDefault(); // Остановить отправку формы
        // Очистить возможные ошибки
        errorMessage.textContent = '';
        console.log("click")
        // Проверка выбранного файла (пропускаем реальную загрузку для демонстрации)
        if (!fileInput.files.length) {
            errorMessage.textContent = 'Пожалуйста, выберите файл.';            return;
        }
        // Пример данных для отображения (замените на реальную обработку данных при необходимости)
         const exampleData = [
            { "label": "Январь", "value": 30 },
            { "label": "Февраль", "value": 1990 },
            { "label": "Март", "value": 40 }        ];
        // Строим дашборд с примерными данными
        buildDashboard(exampleData);    });
    // Функция для построения графика
    function buildDashboard(data) {        const ctx = document.getElementById('chart').getContext('2d');
        const labels = data.map(item => item.label); // Предположим, что в JSON есть поле "label"
        const values = data.map(item => item.value); // Предположим, что в JSON есть поле "value"
        // Удаляем старый график, если он существует
        if (window.chartInstance) {            window.chartInstance.destroy();
        }
        // Создаем новый столбчатый график
        window.chartInstance = new Chart(ctx, {
            type: 'bar', // Столбчатый график
            data: {
                labels: labels,                datasets: [{
                    label: 'Пример графика',                    data: values,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1                }]
            },            options: {
                responsive: true, // Адаптивность графика
                maintainAspectRatio: false, // График может адаптироваться по высоте и ширине
                scales: {                    y: {
                        beginAtZero: true                    }
                }            }
        });    }
});