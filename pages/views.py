from django.views.generic import TemplateView
from django.shortcuts import render


class HomePageView(TemplateView):
    template_name = "home.html"


class AboutPageView(TemplateView):  # new
    template_name = "about.html"

    def my_view(request):
        my_variable = "Hello, Django!"
        return render(request, 'django_project/about.html', {'my_variable': my_variable})