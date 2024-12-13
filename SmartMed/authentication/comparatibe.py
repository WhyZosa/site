import pandas as pd
import numpy as np
from scipy import stats
import json

def generate_test_kolmogorov_smirnov(df, independent_var, grouping_var):
    if grouping_var not in df.columns:
        return {"error": f'Группирующая переменная "{grouping_var}" не найдена в данных.'}
    
    unique_groups = df[grouping_var].dropna().unique()
    if len(unique_groups) != 2:
        return {"error": f'Группирующая переменная "{grouping_var}" должна быть бинарной (содержать два уникальных значения).'}

    group1 = df[df[grouping_var] == unique_groups[0]][independent_var].dropna()
    group2 = df[df[grouping_var] == unique_groups[1]][independent_var].dropna()
    
    if group1.empty or group2.empty:
        return {"error": "Одна из групп пуста для выполнения К-С теста."}
    
    try:
        stat, p_value = stats.ks_2samp(group1, group2)
        result = {
            "statistic": round(stat, 5),
            "p_value": round(p_value, 5),
            "contingency_table": "Не применяется для К-С критерия.",
            "expected": "Не применяется для К-С критерия."
        }
        # Добавление интерпретации
        if p_value < 0.05:
            result["interpretation"] = "Нулевая гипотеза отвергается, выборки не подчиняются одному распределению."
        else:
            result["interpretation"] = "Нулевая гипотеза не отвергается, выборки могут подчиняться одному распределению."
        return result
    except Exception as e:
        return {"error": f"Ошибка при выполнении К-С теста: {str(e)}"}

def generate_t_criterion_student_independent(df, column1, column2):
    try:
        if not pd.api.types.is_numeric_dtype(df[column1]):
            return {"error": f'Независимая переменная "{column1}" должна быть числовой.'}

        unique_groups = df[column2].dropna().unique()
        if len(unique_groups) != 2:
            return {"error": f'Группирующая переменная "{column2}" должна быть бинарной (содержать два уникальных значения).'}

        group1 = df[df[column2] == unique_groups[0]][column1].dropna()
        group2 = df[df[column2] == unique_groups[1]][column1].dropna()

        if group1.empty or group2.empty:
            return {"error": "Одна из групп пуста для выполнения Т-критерия Стьюдента (независимые выборки)."}

        stat, p_value = stats.ttest_ind(group1, group2, equal_var=False)
        result = {
            "statistic": round(stat, 5),
            "p_value": round(p_value, 5)
        }
        # Добавление интерпретации
        if p_value < 0.05:
            result["interpretation"] = "Нулевая гипотеза отвергается, различия между группами статистически значимы."
        else:
            result["interpretation"] = "Нулевая гипотеза не отвергается, различия между группами не являются статистически значимыми."
        return result
    except Exception as e:
        return {"error": f"Ошибка при выполнении Т-критерия Стьюдента (независимые выборки): {str(e)}"}

def generate_t_criterion_student_dependent(df, column1, column2):
    try:
        if column1 not in df.columns or column2 not in df.columns:
            return {"error": f'Одна из переменных "{column1}" или "{column2}" не найдена в данных.'}

        if not pd.api.types.is_numeric_dtype(df[column1]) or not pd.api.types.is_numeric_dtype(df[column2]):
            return {"error": f'Обе переменные "{column1}" и "{column2}" должны быть числовыми.'}

        stat, p_value = stats.ttest_rel(df[column1].dropna(), df[column2].dropna())
        result = {
            "statistic": round(stat, 5),
            "p_value": round(p_value, 5)
        }
        # Добавление интерпретации
        if p_value < 0.05:
            result["interpretation"] = "Нулевая гипотеза отвергается, различия между зависимыми группами статистически значимы."
        else:
            result["interpretation"] = "Нулевая гипотеза не отвергается, различия между зависимыми группами не являются статистически значимыми."
        return result
    except Exception as e:
        return {"error": f"Ошибка при выполнении Т-критерия Стьюдента (зависимые выборки): {str(e)}"}

def generate_u_criterion_mann_whitney(df, column1, column2):
    try:
        # Проверка наличия колонок
        if column1 not in df.columns or column2 not in df.columns:
            return {"error": f'Указанные колонки "{column1}" и/или "{column2}" не найдены в данных.'}
        
        # Проверка, что столбцы не одинаковы
        if column1 == column2:
            return {"error": 'Нельзя выбирать одинаковые колонки для независимой и группирующей переменной.'}
        
        # Проверка, что независимая переменная числовая
        if not pd.api.types.is_numeric_dtype(df[column1]):
            return {"error": f'Независимая переменная "{column1}" должна быть числовой.'}
        
        # Проверка, что группирующая переменная бинарная
        unique_groups = df[column2].dropna().unique()
        if len(unique_groups) != 2:
            return {"error": f'Группирующая переменная "{column2}" должна быть бинарной (содержать два уникальных значения).'}

        # Разделение данных на две группы
        group1 = df[df[column2] == unique_groups[0]][column1].dropna()
        group2 = df[df[column2] == unique_groups[1]][column1].dropna()
        
        # Проверка, что обе группы не пусты
        if group1.empty or group2.empty:
            return {"error": "Одна из групп пуста для выполнения U-критерия Манна-Уитни."}
        
        # Выполнение U-критерия Манна-Уитни
        stat, p_value = stats.mannwhitneyu(group1, group2, alternative='two-sided')
        result = {
            "statistic": round(stat, 5),
            "p_value": round(p_value, 5)
        }
        # Добавление интерпретации
        if p_value < 0.05:
            result["interpretation"] = "Нулевая гипотеза отвергается, различия между группами статистически значимы и носят системный характер."
        else:
            result["interpretation"] = "Нулевая гипотеза не отвергается, различия не являются статистически значимыми и носят случайный характер."
        return result
    except Exception as e:
        return {"error": f"Ошибка при выполнении U-критерия Манна-Уитни: {str(e)}"}

def generate_t_criterion_wilcoxon(df, column1, column2):
    try:
        if column1 not in df.columns or column2 not in df.columns:
            return {"error": f'Одна из переменных "{column1}" или "{column2}" не найдена в данных.'}

        if not pd.api.types.is_numeric_dtype(df[column1]) or not pd.api.types.is_numeric_dtype(df[column2]):
            return {"error": f'Обе переменные "{column1}" и "{column2}" должны быть числовыми.'}

        # Проверка на одинаковые переменные
        if column1 == column2:
            return {"error": "Переменные для сравнения должны быть разными."}

        # Проверка на достаточное количество наблюдений
        if df[[column1, column2]].dropna().shape[0] < 1:
            return {"error": "Недостаточно данных для выполнения Т-критерия Уилкоксона."}

        stat, p_value = stats.wilcoxon(df[column1].dropna(), df[column2].dropna())
        result = {
            "statistic": round(stat, 5),
            "p_value": round(p_value, 5)
        }
        # Добавление интерпретации
        if p_value < 0.05:
            result["interpretation"] = "Нулевая гипотеза отвергается, принимается альтернативная, различия обладают статистической значимостью и носят системный характер."
        else:
            result["interpretation"] = "Нулевая гипотеза принимается, различия не являются статистически значимыми и носят случайный характер."
        return result
    except Exception as e:
        return {"error": f"Ошибка при выполнении Т-критерия Уилкоксона: {str(e)}"}

def generate_chi2_pearson(df, column1, column2):
    try:
        if column1 not in df.columns or column2 not in df.columns:
            return {"error": f'Одна из колонок "{column1}" или "{column2}" не найдена в данных.'}

        # Проверка, что обе переменные бинарные
        unique1 = df[column1].dropna().unique()
        unique2 = df[column2].dropna().unique()
        if len(unique1) != 2 or len(unique2) != 2:
            return {"error": 'Обе группирующие переменные должны быть бинарными (содержать два уникальных значения).'}

        contingency_table = pd.crosstab(df[column1], df[column2])
        stat, p_value, dof, expected = stats.chi2_contingency(contingency_table)
        result = {
            "statistic": round(stat, 5),
            "p_value": round(p_value, 5),
            "dof": dof,
            "expected": expected.tolist(),
            "contingency_table": contingency_table.to_dict()
        }
        # Добавление интерпретации
        if p_value < 0.05:
            result["interpretation"] = "Нулевая гипотеза отвергается, между переменными существует статистически значимая зависимость."
        else:
            result["interpretation"] = "Нулевая гипотеза не отвергается, между переменными нет статистически значимой зависимости."
        return result
    except Exception as e:
        return {"error": f"Ошибка при выполнении Критерия Хи-квадрат Пирсона: {str(e)}"}

def generate_sensitivity_specificity(df, column1, column2):
    try:
        if column1 not in df.columns or column2 not in df.columns:
            return {"error": f'Указанные колонки "{column1}" и/или "{column2}" не найдены в данных.'}

        # Проверка, что обе колонки содержат только бинарные значения (0 и 1)
        if not set(df[column1].dropna().unique()).issubset({0, 1}) or not set(df[column2].dropna().unique()).issubset({0, 1}):
            return {"error": "Обе колонки должны содержать только бинарные значения (0 и 1)."}

        # Определение истинных положительных, истинных отрицательных, ложноположительных и ложноотрицательных результатов
        TP = len(df[(df[column1] == 1) & (df[column2] == 1)])
        FP = len(df[(df[column1] == 1) & (df[column2] == 0)])
        TN = len(df[(df[column1] == 0) & (df[column2] == 0)])
        FN = len(df[(df[column1] == 0) & (df[column2] == 1)])

        sensitivity = TP / (TP + FN) if (TP + FN) != 0 else np.nan
        specificity = TN / (TN + FP) if (TN + FP) != 0 else np.nan

        result = {
            "sensitivity": round(sensitivity, 5) if not np.isnan(sensitivity) else np.nan,
            "specificity": round(specificity, 5) if not np.isnan(specificity) else np.nan,
            "TP": TP,
            "TN": TN,
            "FP": FP,
            "FN": FN
        }
        # Добавление интерпретации
        interpretation = ""
        if not np.isnan(sensitivity):
            interpretation += f"Чувствительность: {result['sensitivity']}. "
            if result['sensitivity'] >= 0.8:
                interpretation += "Высокая чувствительность. "
            else:
                interpretation += "Низкая чувствительность. "
        else:
            interpretation += "Чувствительность не может быть вычислена. "

        if not np.isnan(specificity):
            interpretation += f"Специфичность: {result['specificity']}. "
            if result['specificity'] >= 0.8:
                interpretation += "Высокая специфичность."
            else:
                interpretation += "Низкая специфичность."
        else:
            interpretation += "Специфичность не может быть вычислена."

        result["interpretation"] = interpretation
        return result
    except Exception as e:
        return {"error": f"Ошибка при расчёте чувствительности и специфичности: {str(e)}"}

def generate_risk_relations(df, column1, column2):
    try:
        if not set(df[column1].dropna().unique()).issubset({0, 1}) or not set(df[column2].dropna().unique()).issubset({0, 1}):
            return {"error": "Обе колонки должны содержать только бинарные значения (0 и 1)."}

        # Определение абсолютного риска в каждой группе
        risk_group1 = df[df[column1] == 1][column2].mean()
        risk_group0 = df[df[column1] == 0][column2].mean()

        if risk_group0 == 0 or np.isnan(risk_group0) or np.isnan(risk_group1):
            return {"error": "Невозможно вычислить отношение рисков из-за нулевого или отсутствующего значения."}

        risk_ratio = risk_group1 / risk_group0
        result = {
            "risk_ratio": round(risk_ratio, 5)
        }
        # Добавление интерпретации
        if risk_ratio > 1:
            result["interpretation"] = "Отношение рисков больше 1, событие более вероятно в группе 1."
        elif risk_ratio < 1:
            result["interpretation"] = "Отношение рисков меньше 1, событие менее вероятно в группе 1."
        else:
            result["interpretation"] = "Отношение рисков равно 1, вероятность события одинакова в обеих группах."

        return result
    except Exception as e:
        return {"error": f"Ошибка при расчёте отношения рисков: {str(e)}"}

def generate_odds_relations(df, column1, column2):
    try:
        if not set(df[column1].dropna().unique()).issubset({0, 1}) or not set(df[column2].dropna().unique()).issubset({0, 1}):
            return {"error": "Обе колонки должны содержать только бинарные значения (0 и 1)."}

        contingency_table = pd.crosstab(df[column1], df[column2])
        if not {0, 1}.issubset(contingency_table.columns):
            return {"error": "Исходная переменная должна содержать бинарные значения (0 и 1)."}

        try:
            odds_group1 = (contingency_table.at[1, 1] / contingency_table.at[1, 0]) if contingency_table.at[1, 0] != 0 else np.nan
        except KeyError:
            odds_group1 = np.nan

        try:
            odds_group0 = (contingency_table.at[0, 1] / contingency_table.at[0, 0]) if contingency_table.at[0, 0] != 0 else np.nan
        except KeyError:
            odds_group0 = np.nan

        odds_ratio = odds_group1 / odds_group0 if (not np.isnan(odds_group1) and not np.isnan(odds_group0) and odds_group0 != 0) else np.nan
        result = {
            "odds_ratio": round(odds_ratio, 5) if not np.isnan(odds_ratio) else np.nan
        }
        # Добавление интерпретации
        if not np.isnan(odds_ratio):
            if odds_ratio > 1:
                result["interpretation"] = "Отношение шансов больше 1, событие более вероятно в группе 1."
            elif odds_ratio < 1:
                result["interpretation"] = "Отношение шансов меньше 1, событие менее вероятно в группе 1."
            else:
                result["interpretation"] = "Отношение шансов равно 1, вероятность события одинакова в обеих группах."
        else:
            result["interpretation"] = "Отношение шансов не может быть вычислено из-за отсутствующих или нулевых значений."

        return result
    except Exception as e:
        return {"error": f"Ошибка при расчёте отношения шансов: {str(e)}"}

def process_missing_data(df, method):
    if method == 'drop':
        return df.dropna()
    elif method == 'fill_mean':
        return df.fillna(df.mean(numeric_only=True))
    elif method == 'fill_median':
        return df.fillna(df.median(numeric_only=True))
    elif method == 'fill_mode':
        return df.fillna(df.mode().iloc[0])
    else:
        return df

def process_json_comparative(input_json):
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

            if independent_var not in df.columns or grouping_var not in df.columns:
                output[test_type] = {"error": f'Указанные переменные "{independent_var}" и/или "{grouping_var}" не найдены в данных.'}
                continue

            if not pd.api.types.is_numeric_dtype(df[independent_var]):
                output[test_type] = {"error": f'Независимая переменная "{independent_var}" должна быть числовой.'}
                continue

            unique_groups = df[grouping_var].dropna().unique()
            if len(unique_groups) != 2:
                output[test_type] = {"error": f'Группирующая переменная "{grouping_var}" должна быть бинарной (содержать два уникальных значения).'}
                continue

            result = generate_test_kolmogorov_smirnov(df, independent_var, grouping_var)
            output[test_type] = result

        elif test_type == 't_criterion_student_independent':
            column1 = test.get('column1')
            column2 = test.get('column2')

            if not column1 or not column2:
                output[test_type] = {"error": "Необходимо указать обе колонки для анализа."}
                continue

            if column1 not in df.columns or column2 not in df.columns:
                output[test_type] = {"error": f'Указанные колонки "{column1}" и/или "{column2}" не найдены в данных.'}
                continue

            if not pd.api.types.is_numeric_dtype(df[column1]):
                output[test_type] = {"error": f'Независимая переменная "{column1}" должна быть числовой.'}
                continue

            unique_groups = df[column2].dropna().unique()
            if len(unique_groups) != 2:
                output[test_type] = {"error": f'Группирующая переменная "{column2}" должна быть бинарной (содержать два уникальных значения).'}
                continue

            result = generate_t_criterion_student_independent(df, column1, column2)
            output[test_type] = result

        elif test_type == 't_criterion_student_dependent':
            column1 = test.get('column1')
            column2 = test.get('column2')

            if not column1 or not column2:
                output[test_type] = {"error": "Необходимо указать обе колонки для анализа."}
                continue

            if column1 not in df.columns or column2 not in df.columns:
                output[test_type] = {"error": f'Указанные колонки "{column1}" и/или "{column2}" не найдены в данных.'}
                continue

            result = generate_t_criterion_student_dependent(df, column1, column2)
            output[test_type] = result

        elif test_type == 't_criterion_wilcoxon':
            column1 = test.get('column1')
            column2 = test.get('column2')

            if not column1 or not column2:
                output[test_type] = {"error": "Необходимо указать обе переменные для Т-критерия Уилкоксона."}
                continue

            if column1 not in df.columns or column2 not in df.columns:
                output[test_type] = {"error": f'Указанные переменные "{column1}" и/или "{column2}" не найдены в данных.'}
                continue

            result = generate_t_criterion_wilcoxon(df, column1, column2)
            output[test_type] = result

        elif test_type == 'chi2_pearson':
            column1 = test.get('column1')
            column2 = test.get('column2')

            if not column1 or not column2:
                output[test_type] = {"error": "Необходимо указать обе группирующие переменные для Критерия Хи-квадрат Пирсона."}
                continue

            if column1 not in df.columns or column2 not in df.columns:
                output[test_type] = {"error": f'Указанные переменные "{column1}" и/или "{column2}" не найдены в данных.'}
                continue

            result = generate_chi2_pearson(df, column1, column2)
            output[test_type] = result

        elif test_type == 'sensitivity_specificity':
            column1 = test.get('column1')
            column2 = test.get('column2')

            if not column1 or not column2:
                output[test_type] = {"error": "Необходимо указать фактор риска и исход для Чувствительности и Специфичности."}
                continue

            if column1 == column2:
                output[test_type] = {"error": "Нельзя выбирать одинаковые переменные для фактора риска и исхода."}
                continue

            if column1 not in df.columns or column2 not in df.columns:
                output[test_type] = {"error": f'Указанные переменные "{column1}" и/или "{column2}" не найдены в данных.'}
                continue

            result = generate_sensitivity_specificity(df, column1, column2)
            output[test_type] = result

        elif test_type == 'risk_relations':
            column1 = test.get('column1')
            column2 = test.get('column2')
            table_type = test.get('table_type')

            if not column1 or not column2:
                output[test_type] = {"error": "Необходимо указать фактор риска и исход для Отношения рисков (RR)." }
                continue

            if column1 == column2:
                output[test_type] = {"error": "Нельзя выбирать одинаковые переменные для фактора риска и исхода."}
                continue

            if column1 not in df.columns or column2 not in df.columns:
                output[test_type] = {"error": f'Указанные переменные "{column1}" и/или "{column2}" не найдены в данных.'}
                continue

            if not table_type:
                output[test_type] = {"error": "Пожалуйста, выберите тип таблицы для Отношения рисков (RR)."}
                continue

            result = generate_risk_relations(df, column1, column2)
            if "error" not in result:
                # Добавляем информацию о таблице сопряженности или метриках, если необходимо
                if table_type == "contingency":
                    contingency_table = pd.crosstab(df[column1], df[column2])
                    result["contingency_table"] = contingency_table.to_dict()
                elif table_type == "metrics":
                    # В данном случае, RR уже добавлен в результат
                    pass
            output[test_type] = result

        elif test_type == 'odds_relations':
            column1 = test.get('column1')
            column2 = test.get('column2')
            table_type = test.get('table_type')

            if not column1 or not column2:
                output[test_type] = {"error": "Необходимо указать фактор риска и исход для Отношения шансов (OR)." }
                continue

            if column1 == column2:
                output[test_type] = {"error": "Нельзя выбирать одинаковые переменные для фактора риска и исхода."}
                continue

            if column1 not in df.columns or column2 not in df.columns:
                output[test_type] = {"error": f'Указанные переменные "{column1}" и/или "{column2}" не найдены в данных.'}
                continue

            if not table_type:
                output[test_type] = {"error": "Пожалуйста, выберите тип таблицы для Отношения шансов (OR)."}
                continue

            result = generate_odds_relations(df, column1, column2)
            if "error" not in result:
                if table_type == "contingency":
                    contingency_table = pd.crosstab(df[column1], df[column2])
                    result["contingency_table"] = contingency_table.to_dict()
                elif table_type == "metrics":
                    # В данном случае, OR уже добавлен в результат
                    pass
            output[test_type] = result

        else:
            column1 = test.get('column1')
            column2 = test.get('column2')

            if not column1 or not column2:
                output[test_type] = {"error": "Необходимо указать обе колонки для анализа."}
                continue

            if column1 not in df.columns or column2 not in df.columns:
                output[test_type] = {"error": f'Указанные колонки "{column1}" и/или "{column2}" не найдены в данных.'}
                continue

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
                result = {"error": f"Неизвестный или некорректный тип анализа: {test_type}"}

            output[test_type] = result

    return json.dumps(output, indent=4, ensure_ascii=False)
