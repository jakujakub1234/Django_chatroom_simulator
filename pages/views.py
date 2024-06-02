from django.views.generic import TemplateView
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.http import JsonResponse
from .forms import HomeForm
from .models import Nicks
from .models import Messages
from .utils import lobby_time, chatroom_time
from .chat_ai import ChatAI

from datetime import datetime

class HomePageView(TemplateView):
    template_name = "home.html"

    def get(self, request):
        form = HomeForm()

        if 1 > 2:
            for key in list(request.session.keys()):
                if not key.startswith("_"): # skip keys set by the django system
                    del request.session[key]

        if False and 'start_timestamp' in request.session and request.session['start_timestamp'] != "": #TODO
            survey_time = datetime.now().timestamp() - int(request.session['start_timestamp'])

            if survey_time > lobby_time + chatroom_time:
                return HttpResponseRedirect("end_chat")

            if survey_time > lobby_time:
                return HttpResponseRedirect("chatroom")

            if survey_time > 1:
                return HttpResponseRedirect("lobby")

        return render(request, "home.html", {"form": form})

    def post(self, request, **kwargs):
        form = HomeForm(request.POST)

        if form.is_valid():
            request.session['nick'] = form.cleaned_data['nick']

            if form.cleaned_data['nick'] == "":
                request.session['nick'] = "Uczestnik badania"

            request.session['key'] = form.cleaned_data['key_from_qualtrics']
            request.session['start_timestamp'] = datetime.now().timestamp()
    
            return HttpResponseRedirect("/lobby/")

        return render(request, 'home.html', {'form':form})

class LobbyPageView(TemplateView):
    template_name = "lobby.html"

    def get(self, request):
        if 'key' not in request.session or request.session['key'] == "":
            form = HomeForm()
            return render(request, 'home.html', {'form':form})

        if False and 'start_timestamp' in request.session and request.session['start_timestamp'] != "": #TODO
            survey_time = datetime.now().timestamp() - int(request.session['start_timestamp'])

            if survey_time > lobby_time + chatroom_time:
                return HttpResponseRedirect("../end_chat")

            if survey_time > lobby_time:
                return HttpResponseRedirect("../chatroom")

            #if survey_time > 1:
            #    return HttpResponseRedirect("../lobby")

        return super(LobbyPageView, self).get(request)

    def get_context_data(self, *args, **kwargs):            
        context = super(LobbyPageView, self).get_context_data(*args,**kwargs)        
        context['nick'] = self.request.session['nick']
        context['start_timestamp'] = self.request.session['start_timestamp']

        return context

class ChatroomPageView(TemplateView):  
    template_name = "chatroom.html"

    def get(self, request):
        if 'key' not in request.session or request.session['key'] == "":
            form = HomeForm()
            return render(request, 'home.html', {'form':form})

        if False and 'start_timestamp' in request.session and request.session['start_timestamp'] != "": #TODO
            survey_time = datetime.now().timestamp() - int(request.session['start_timestamp'])

            if survey_time > lobby_time + chatroom_time:
                return HttpResponseRedirect("../end_chat")

            #if survey_time > lobby_time:
            #    return HttpResponseRedirect("../chatroom")

            if survey_time < lobby_time:
                return HttpResponseRedirect("../lobby")

        return super(ChatroomPageView, self).get(request)

    def get_context_data(self, *args, **kwargs):
        context = super(ChatroomPageView, self).get_context_data(*args,**kwargs)
        context['nick'] = self.request.session['nick']

        context['start_timestamp'] = self.request.session['start_timestamp'] + lobby_time

        return context

class EndChatPageView(TemplateView):
    template_name = "end_chat.html"

    def get(self, request):
        if 'key' not in request.session or request.session['key'] == "":
            form = HomeForm()
            return render(request, 'home.html', {'form':form})

        if False and 'start_timestamp' in request.session and request.session['start_timestamp'] != "":
            survey_time = datetime.now().timestamp() - int(request.session['start_timestamp'])

            #if survey_time > lobby_time + chatroom_time:
            #    return HttpResponseRedirect("../end_chat")

            if survey_time < lobby_time + chatroom_time:
                return HttpResponseRedirect("../chatroom")

            if survey_time < lobby_time:
                return HttpResponseRedirect("../lobby")

        return super(EndChatPageView, self).get(request)

class AjaxPageView(TemplateView):
    chat_ai = ChatAI()

    def post(self, request, **kwargs):
        form = HomeForm()
        
        # TODO wylaczenie bazy
        self.chat_ai.setNick(request.POST.get('nick'))

        print("ZBAZOWANO " + request.POST.get('action'))
        return render(request, 'home.html', {'form':form})
        
        if request.POST.get('action') == "nick":
            nick = Nicks(qualtrics_id='1234', nick=request.POST.get('nick'))
            nick.save()        

        if request.POST.get('action') == "message":
            messages = Messages(
                qualtrics_id = '1234',
                message = request.POST.get('message'),
                message_time = request.POST.get('message_time')
            )
            
            messages.save()
        

        return render(request, 'home.html', {'form':form})

    def get(self, request):
        respond = self.chat_ai.generateRespond(
            request.GET['message'],
            request.GET['responding_bot']
        )

        return JsonResponse({'respond': respond}, status=200, content_type="application/json")