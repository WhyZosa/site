import pandas as pd
import numpy as np
from scipy import stats
import json


def generate_test_kolmogorov_smirnov(df, independent_var, grouping_var):
    """
    Выполняет Критерий Колмогорова-Смирнова для сравнения распределений двух групп.

    :param df: DataFrame с данными.
    :param independent_var: Название независимой переменной (количественной).
    :param grouping_var: Название группирующей переменной (бинарной).
    :return: Словарь с результатами теста или сообщением об ошибке.
    """
    # Проверка наличия группирующей переменной в DataFrame
    if grouping_var not in df.columns:
        return {"error": f'Группирующая переменная "{grouping_var}" не найдена в данных.'}
    
    # Получение уникальных групп
    unique_groups = df[grouping_var].dropna().unique()
    if len(unique_groups) != 2:
        return {"error": f'Группирующая переменная "{grouping_var}" должна быть бинарной (содержать два уникальных значения).'}
    
    # Разделение данных на две группы
    group1 = df[df[grouping_var] == unique_groups[0]][independent_var].dropna()
    group2 = df[df[grouping_var] == unique_groups[1]][independent_var].dropna()
    
    # Проверка, что обе группы не пусты
    if group1.empty or group2.empty:
        return {"error": "Одна из групп пуста для выполнения К-С теста."}
    
    # Выполнение К-С теста
    try:
        stat, p_value = stats.ks_2samp(group1, group2)
        return {"statistic": round(stat, 5), "p_value": round(p_value, 5)}
    except Exception as e:
        return {"error": f"Ошибка при выполнении К-С теста: {str(e)}"}


def generate_t_criterion_student_independent(df, column1, column2):
    """
    Выполняет Т-критерий Стьюдента для независимых выборок.

    :param df: DataFrame с данными.
    :param column1: Название первой колонки (независимая переменная, количественная).
    :param column2: Название второй колонки (группирующая переменная, бинарная).
    :return: Словарь с результатами теста или сообщением об ошибке.
    """
    try:
        # Проверка типа данных независимой переменной
        if not pd.api.types.is_numeric_dtype(df[column1]):
            return {"error": f'Независимая переменная "{column1}" должна быть числовой.'}

        # Проверка бинарности группирующей переменной
        unique_groups = df[column2].dropna().unique()
        if len(unique_groups) != 2:
            return {"error": f'Группирующая переменная "{column2}" должна быть бинарной (содержать два уникальных значения).'}
        
        # Разделение данных на две группы
        group1 = df[df[column2] == unique_groups[0]][column1].dropna()
        group2 = df[df[column2] == unique_groups[1]][column1].dropna()

        # Проверка, что обе группы не пусты
        if group1.empty or group2.empty:
            return {"error": "Одна из групп пуста для выполнения Т-критерия Стьюдента (независимые выборки)."}

        # Выполнение Т-критерия Стьюдента для независимых выборок с неравными дисперсиями (Welch's t-test)
        stat, p_value = stats.ttest_ind(group1, group2, equal_var=False)
        return {"statistic": round(stat, 5), "p_value": round(p_value, 5)}
    except Exception as e:
        return {"error": f"Ошибка при выполнении Т-критерия Стьюдента (независимые выборки): {str(e)}"}


def generate_t_criterion_student_dependent(df, column1, column2):
    """
    Выполняет Т-критерий Стьюдента для зависимых выборок.

    :param df: DataFrame с данными.
    :param column1: Название первой колонки.
    :param column2: Название второй колонки.
    :return: Словарь с результатами теста или сообщением об ошибке.
    """
    try:
        # Проверка наличия колонок
        if column1 not in df.columns or column2 not in df.columns:
            return {"error": f'Одна из переменных "{column1}" или "{column2}" не найдена в данных.'}

        # Проверка типа данных переменных
        if not pd.api.types.is_numeric_dtype(df[column1]) or not pd.api.types.is_numeric_dtype(df[column2]):
            return {"error": f'Обе переменные "{column1}" и "{column2}" должны быть числовыми.'}

        # Проверка на совпадение индексов для зависимых выборок
        if not df[column1].dropna().index.equals(df[column2].dropna().index):
            return {"error": "Индексы данных для зависимых выборок не совпадают."}

        # Выполнение Т-критерия Стьюдента для зависимых выборок
        stat, p_value = stats.ttest_rel(df[column1].dropna(), df[column2].dropna())
        return {"statistic": round(stat, 5), "p_value": round(p_value, 5)}
    except Exception as e:
        return {"error": f"Ошибка при выполнении Т-критерия Стьюдента (зависимые выборки): {str(e)}"}


def generate_u_criterion_mann_whitney(df, column1, column2):
    """
    Выполняет U-критерий Манна-Уитни.

    :param df: DataFrame с данными.
    :param column1: Название первой колонки.
    :param column2: Название второй колонки.
    :return: Словарь с результатами теста или сообщением об ошибке.
    """
    try:
        stat, p_value = stats.mannwhitneyu(df[column1].dropna(), df[column2].dropna())
        return {"statistic": round(stat, 5), "p_value": round(p_value, 5)}
    except Exception as e:
        return {"error": f"Ошибка при выполнении U-критерия Манна-Уитни: {str(e)}"}


def generate_t_criterion_wilcoxon(df, column1, column2):
    """
    Выполняет Т-критерий Уилкоксона.

    :param df: DataFrame с данными.
    :param column1: Название первой колонки.
    :param column2: Название второй колонки.
    :return: Словарь с результатами теста или сообщением об ошибке.
    """
    try:
        stat, p_value = stats.wilcoxon(df[column1].dropna(), df[column2].dropna())
        return {"statistic": round(stat, 5), "p_value": round(p_value, 5)}
    except Exception as e:
        return {"error": f"Ошибка при выполнении Т-критерия Уилкоксона: {str(e)}"}


def generate_chi2_pearson(df, column1, column2):
    """
    Выполняет Критерий Хи-квадрат Пирсона.

    :param df: DataFrame с данными.
    :param column1: Название первой колонки (категориальная).
    :param column2: Название второй колонки (категориальная).
    :return: Словарь с результатами теста или сообщением об ошибке.
    """
    try:
        contingency_table = pd.crosstab(df[column1], df[column2])
        stat, p_value, dof, expected = stats.chi2_contingency(contingency_table)
        return {"statistic": round(stat, 5), "p_value": round(p_value, 5), "dof": dof, "expected": expected.tolist()}
    except Exception as e:
        return {"error": f"Ошибка при выполнении Критерия Хи-квадрат Пирсона: {str(e)}"}


def generate_sensitivity_specificity(df, column1, column2):
    """
    Вычисляет чувствительность и специфичность.

    :param df: DataFrame с данными.
    :param column1: Название первой колонки (предсказание, бинарная).
    :param column2: Название второй колонки (истинный статус, бинарная).
    :return: Словарь с чувствительностью и специфичностью или сообщением об ошибке.
    """
    try:
        # Убедимся, что колонки бинарные
        if not set(df[column1].dropna().unique()).issubset({0, 1}) or not set(df[column2].dropna().unique()).issubset({0, 1}):
            return {"error": "Обе колонки должны содержать только бинарные значения (0 и 1)."}

        true_positive = len(df[(df[column1] == 1) & (df[column2] == 1)])
        false_positive = len(df[(df[column1] == 1) & (df[column2] == 0)])
        true_negative = len(df[(df[column1] == 0) & (df[column2] == 0)])
        false_negative = len(df[(df[column1] == 0) & (df[column2] == 1)])

        sensitivity = true_positive / (true_positive + false_negative) if (true_positive + false_negative) != 0 else np.nan
        specificity = true_negative / (true_negative + false_positive) if (true_negative + false_positive) != 0 else np.nan

        return {"sensitivity": round(sensitivity, 5), "specificity": round(specificity, 5)}
    except Exception as e:
        return {"error": f"Ошибка при расчёте чувствительности и специфичности: {str(e)}"}


def generate_risk_relations(df, column1, column2):
    """
    Вычисляет отношение рисков (Risk Ratio, RR).

    :param df: DataFrame с данными.
    :param column1: Название первой колонки (экспозиция, бинарная).
    :param column2: Название второй колонки (исход, бинарная).
    :return: Словарь с отношением рисков или сообщением об ошибке.
    """
    try:
        # Убедимся, что колонки бинарные
        if not set(df[column1].dropna().unique()).issubset({0, 1}) or not set(df[column2].dropna().unique()).issubset({0, 1}):
            return {"error": "Обе колонки должны содержать только бинарные значения (0 и 1)."}

        risk_group1 = df[df[column1] == 1][column2].mean()
        risk_group0 = df[df[column1] == 0][column2].mean()

        # Если один из рисков не может быть рассчитан, вернуть NaN
        if risk_group0 == 0 or risk_group1 == 0:
            return {"risk_ratio": np.nan}

        risk_ratio = risk_group1 / risk_group0
        return {"risk_ratio": round(risk_ratio, 5)}
    except Exception as e:
        return {"error": f"Ошибка при расчёте отношения рисков: {str(e)}"}


def generate_odds_relations(df, column1, column2):
    """
    Вычисляет отношение шансов (Odds Ratio, OR).

    :param df: DataFrame с данными.
    :param column1: Название первой колонки (экспозиция, бинарная).
    :param column2: Название второй колонки (исход, бинарная).
    :return: Словарь с отношением шансов или сообщением об ошибке.
    """
    try:
        # Убедимся, что колонки бинарные
        if not set(df[column1].dropna().unique()).issubset({0, 1}) or not set(df[column2].dropna().unique()).issubset({0, 1}):
            return {"error": "Обе колонки должны содержать только бинарные значения (0 и 1)."}

        contingency_table = pd.crosstab(df[column1], df[column2])
        # Проверка наличия необходимых категорий
        if not {0, 1}.issubset(contingency_table.columns):
            return {"error": "Column2 must contain binary values (0 and 1)."}

        # Обработка случаев, когда некоторые группы отсутствуют
        try:
            odds_group1 = (contingency_table.at[1, 1] / contingency_table.at[1, 0]) if contingency_table.at[1, 0] != 0 else np.nan
        except KeyError:
            odds_group1 = np.nan

        try:
            odds_group0 = (contingency_table.at[0, 1] / contingency_table.at[0, 0]) if contingency_table.at[0, 0] != 0 else np.nan
        except KeyError:
            odds_group0 = np.nan

        odds_ratio = odds_group1 / odds_group0 if (not np.isnan(odds_group1) and not np.isnan(odds_group0) and odds_group0 != 0) else np.nan
        return {"odds_ratio": round(odds_ratio, 5) if not np.isnan(odds_ratio) else np.nan}
    except Exception as e:
        return {"error": f"Ошибка при расчёте отношения шансов: {str(e)}"}


def process_missing_data(df, method):
    """
    Обрабатывает пропущенные данные в DataFrame.

    :param df: DataFrame с данными.
    :param method: Метод обработки пропущенных данных ('drop', 'fill_mean', 'fill_median', 'fill_mode').
    :return: DataFrame после обработки пропущенных данных.
    """
    if method == 'drop':
        return df.dropna()
    elif method == 'fill_mean':
        return df.fillna(df.mean(numeric_only=True))
    elif method == 'fill_median':
        return df.fillna(df.median(numeric_only=True))
    elif method == 'fill_mode':
        return df.fillna(df.mode().iloc[0])
    else:
        return df  # Если метод не указан или не распознан


def process_json_comparative(input_json):
    """
    Обрабатывает JSON-запрос для сравнительного анализа и выполняет соответствующие тесты.

    :param input_json: JSON-строка с параметрами анализа.
    :return: JSON-строка с результатами анализа.
    """
    user_input = json.loads(input_json)
    data_path = user_input['data_path']
    missing_data_method = user_input.get('missing_data_method', 'fill_mean')
    tests = user_input['tests']

    try:
        df = pd.read_excel(data_path) if data_path.endswith('.xlsx') else pd.read_csv(data_path)
    except Exception as e:
        return json.dumps({"error": f"Ошибка при чтении файла данных: {str(e)}"})

    df = process_missing_data(df, missing_data_method)

    output = {}

    for test in tests:
        test_type = test.get('type')

        if test_type == 'kolmogorov_smirnov':
            independent_var = test.get('independent_variable')
            grouping_var = test.get('grouping_variable')

            if not independent_var or not grouping_var:
                output[test_type] = {"error": "Необходимо указать независимую и группирующую переменные для К-С критерия."}
                continue

            # Проверка наличия колонок в DataFrame
            if independent_var not in df.columns or grouping_var not in df.columns:
                output[test_type] = {"error": f'Указанные переменные "{independent_var}" и/или "{grouping_var}" не найдены в данных.'}
                continue

            # Проверка типа данных независимой переменной
            if not pd.api.types.is_numeric_dtype(df[independent_var]):
                output[test_type] = {"error": f'Независимая переменная "{independent_var}" должна быть числовой.'}
                continue

            # Проверка, что группирующая переменная бинарная
            unique_groups = df[grouping_var].dropna().unique()
            if len(unique_groups) != 2:
                output[test_type] = {"error": f'Группирующая переменная "{grouping_var}" должна быть бинарной (содержать два уникальных значения).'}
                continue

            # Выполнение К-С теста
            result = generate_test_kolmogorov_smirnov(df, independent_var, grouping_var)
            output[test_type] = result

        elif test_type == 't_criterion_student_independent':
            column1 = test.get('column1')  # Независимая переменная
            column2 = test.get('column2')  # Группирующая переменная

            if not column1 or not column2:
                output[test_type] = {"error": "Необходимо указать обе колонки для анализа."}
                continue

            # Проверка наличия колонок в DataFrame
            if column1 not in df.columns or column2 not in df.columns:
                output[test_type] = {"error": f'Указанные колонки "{column1}" и/или "{column2}" не найдены в данных.'}
                continue

            # Проверка типа данных независимой переменной
            if not pd.api.types.is_numeric_dtype(df[column1]):
                output[test_type] = {"error": f'Независимая переменная "{column1}" должна быть числовой.'}
                continue

            # Проверка, что группирующая переменная бинарная
            unique_groups = df[column2].dropna().unique()
            if len(unique_groups) != 2:
                output[test_type] = {"error": f'Группирующая переменная "{column2}" должна быть бинарной (содержать два уникальных значения).'}
                continue

            # Выполнение Т-критерия Стьюдента для независимых выборок
            result = generate_t_criterion_student_independent(df, column1, column2)
            output[test_type] = result

        elif test_type == 't_criterion_student_dependent':
            column1 = test.get('column1')  # Первая переменная
            column2 = test.get('column2')  # Вторая переменная

            if not column1 or not column2:
                output[test_type] = {"error": "Необходимо указать обе колонки для анализа."}
                continue

            # Проверка наличия колонок в DataFrame
            if column1 not in df.columns or column2 not in df.columns:
                output[test_type] = {"error": f'Указанные колонки "{column1}" и/или "{column2}" не найдены в данных.'}
                continue

            # Выполнение Т-критерия Стьюдента для зависимых выборок
            result = generate_t_criterion_student_dependent(df, column1, column2)
            output[test_type] = result

        else:
            column1 = test.get('column1')
            column2 = test.get('column2')

            if not column1 or not column2:
                output[test_type] = {"error": "Необходимо указать обе колонки для анализа."}
                continue

            # Проверка наличия колонок в DataFrame
            if column1 not in df.columns or column2 not in df.columns:
                output[test_type] = {"error": f'Указанные колонки "{column1}" и/или "{column2}" не найдены в данных.'}
                continue

            # В зависимости от типа теста вызываем соответствующую функцию
            if test_type == 'u_criterion_mann_whitney':
                result = generate_u_criterion_mann_whitney(df, column1, column2)
            elif test_type == 't_criterion_wilcoxon':
                result = generate_t_criterion_wilcoxon(df, column1, column2)
            elif test_type == 'chi2_pearson':
                result = generate_chi2_pearson(df, column1, column2)
            elif test_type == 'sensitivity_specificity':
                result = generate_sensitivity_specificity(df, column1, column2)
            elif test_type == 'risk_relations':
                result = generate_risk_relations(df, column1, column2)
            elif test_type == 'odds_relations':
                result = generate_odds_relations(df, column1, column2)
            else:
                result = {"error": f"Неизвестный или некорректно указанный тип анализа: {test_type}"}

            output[test_type] = result

    return json.dumps(output, indent=4, ensure_ascii=False)
