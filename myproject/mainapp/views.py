from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .forms import RegistrationForm

def index(request):
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']
        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            return redirect('welcome')
        else:
            return render(request, 'mainapp/index.html', {'error': 'Неправильный email или пароль'})
    return render(request, 'mainapp/index.html')

def registration(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')
    else:
        form = RegistrationForm()
    return render(request, 'mainapp/registration.html', {'form': form})

@login_required
def welcome(request):
    return render(request, 'mainapp/welcome.html')

@login_required
def profile(request):
    return render(request, 'mainapp/profile.html')

def logout_view(request):
    logout(request)
    return redirect('login')
