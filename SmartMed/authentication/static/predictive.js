document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('model-upload-form');
    const fileInput = document.getElementById('file-input');
    const uploadMessageContainer = document.getElementById('upload-message-container');
    const modelSelection = document.getElementById('model-selection');
    const targetColumn = document.getElementById('target-column');
    const featureColumns = document.getElementById('feature-columns');
    const analyzeButton = document.getElementById('analyze-button');
    const resultsContainer = document.getElementById('analysis-results');
    let uploadedFilePath = '';

    // Загрузка файла
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideElements([uploadMessageContainer, modelSelection, resultsContainer]);
        resultsContainer.innerHTML = '';

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
                body: formData,
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Неизвестная ошибка');
            }

            const data = await response.json();
            if (data.error) {
                showMessage(uploadMessageContainer, data.error, 'error');
            } else {
                showMessage(uploadMessageContainer, 'Файл успешно загружен.', 'success');
                populateDropdowns(data.columns);
                uploadedFilePath = data.file_path;
                modelSelection.classList.remove('hidden');
            }
        } catch (error) {
            showMessage(uploadMessageContainer, `Ошибка при загрузке файла: ${error.message}`, 'error');
        }
    });

    // Анализ модели
    analyzeButton.addEventListener('click', async () => {
        hideElements([uploadMessageContainer, resultsContainer]);
        resultsContainer.innerHTML = '';

        const selectedModel = document.getElementById('model-type').value;
        const selectedTarget = targetColumn.value;
        const selectedFeatures = Array.from(featureColumns.selectedOptions).map(option => option.value);

        if (!selectedTarget || selectedFeatures.length === 0) {
            showMessage(uploadMessageContainer, 'Ошибка: Выберите целевую переменную и хотя бы одну признаковую переменную.', 'error');
            return;
        }

        const requestData = {
            model_type: selectedModel,
            target_column: selectedTarget,
            feature_columns: selectedFeatures,
            data_path: uploadedFilePath
        };

        try {
            const response = await fetch('/analyze/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Неизвестная ошибка');
            }

            const result = await response.json();
            displayResults(result);
        } catch (error) {
            showMessage(uploadMessageContainer, `Ошибка при анализе: ${error.message}`, 'error');
        }
    });

    function showMessage(container, message, type) {
        container.className = `message-container ${type}`;
        container.textContent = message;
        container.classList.remove('hidden');
    }

    function hideElements(elements) {
        elements.forEach(el => el.classList.add('hidden'));
    }

    function populateDropdowns(columns) {
        targetColumn.innerHTML = '';
        featureColumns.innerHTML = '';

        columns.forEach(col => {
            const option = document.createElement('option');
            option.value = col;
            option.textContent = col;

            const featureOption = option.cloneNode(true);
            targetColumn.appendChild(option);
            featureColumns.appendChild(featureOption);
        });
    }

    function displayResults(result) {
        resultsContainer.innerHTML = '<h3>Результаты анализа</h3>';
        const table = document.createElement('table');
        table.className = 'results-table';

        for (const [key, value] of Object.entries(result)) {
            const row = document.createElement('tr');

            const keyCell = document.createElement('td');
            keyCell.textContent = key;
            row.appendChild(keyCell);

            const valueCell = document.createElement('td');
            valueCell.textContent = typeof value === 'object' ? JSON.stringify(value) : value;
            row.appendChild(valueCell);

            table.appendChild(row);
        }

        resultsContainer.appendChild(table);
        resultsContainer.classList.remove('hidden');
    }
});
