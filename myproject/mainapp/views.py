from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from .models import User  # убедитесь, что модель правильно определена

# Страница регистрации
def registration_view(request):
    """
    Обрабатывает регистрацию пользователя.
    """
    if request.method == 'POST':
        email = request.POST.get('email')
        username = request.POST.get('username')
        password = request.POST.get('password')

        try:
            # Проверка на создание пользователя
            user = User.objects.create_user(email=email, username=username, password=password)
            user.save()
            return redirect('login')
        except IntegrityError as e:
            error_message = f"Ошибка: {str(e)}"
            return render(request, 'mainapp/registration.html', {'error': error_message})

    return render(request, 'mainapp/registration.html')


# Главная страница
def index(request):
    return render(request, 'mainapp/index.html')


# Вход в систему
def login_view(request):
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']
        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            return redirect('welcome')
        else:
            error = "Неверный email или пароль"
            return render(request, 'mainapp/index.html', {'error': error})
    return render(request, 'mainapp/index.html')


# Страница приветствия после входа
@login_required
def welcome_view(request):
    return render(request, 'mainapp/welcome.html', {'user': request.user})
