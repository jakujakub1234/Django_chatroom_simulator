from django.views.generic import TemplateView
from django.shortcuts import render
import json 

class Message():
    description = ""
    sender_name = ""
    time = ""

class HomePageView(TemplateView):
    template_name = "home.html"


class AboutPageView(TemplateView):  # new
    template_name = "about.html"
    