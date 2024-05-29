from django.views.generic import TemplateView
from django.shortcuts import render
from django.http import HttpResponseRedirect
from .forms import HomeForm
from .models import Nicks

class HomePageView(TemplateView):
    template_name = "home.html"

    def get(self, request):
        form = HomeForm()

        return render(request, "home.html", {"form": form})

    def post(self, request, **kwargs):
        form = HomeForm(request.POST)

        if form.is_valid():
            request.session['nick'] = form.cleaned_data['nick']
            request.session['key'] = form.cleaned_data['key_from_qualtrics']
    
            return HttpResponseRedirect("/lobby/")

        return render(request, 'home.html', {'form':form})

class LobbyPageView(TemplateView):
    template_name = "lobby.html"

    def get(self, request):
        if 'key' not in request.session or request.session['key'] == "":
            form = HomeForm()
            return render(request, 'home.html', {'form':form})

        return super(LobbyPageView, self).get(request)

    def get_context_data(self, *args, **kwargs):            
        context = super(LobbyPageView, self).get_context_data(*args,**kwargs)        
        context['nick'] = self.request.session['nick']

        return context

class ChatroomPageView(TemplateView):  
    template_name = "chatroom.html"

    def get(self, request):
        if 'key' not in request.session or request.session['key'] == "":
            form = HomeForm()
            return render(request, 'home.html', {'form':form})

        return super(ChatroomPageView, self).get(request)

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def get_context_data(self, *args, **kwargs):
        context = super(ChatroomPageView, self).get_context_data(*args,**kwargs)
        #context['visitor_ip'] = self.get_client_ip(self.request)
        context['nick'] = self.request.session['nick']

        return context

class AjaxPageView(TemplateView):  
    def post(self, request, **kwargs):
        form = HomeForm()
        
        nick = Nicks(qualtrics_id='1234', nick=request.POST.get('nick'))
        nick.save()

        return render(request, 'home.html', {'form':form})