from django.views.generic import TemplateView
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.http import JsonResponse
from .forms import HomeForm
from .models import Nicks
from .models import Messages
from .models import LikeReactions, HeartReactions, AngryReactions
from .models import Interactions
from .utils import lobby_time, chatroom_time
from .chat_ai import ChatAI
from django.conf import settings
import json

from datetime import datetime

language_code = settings.LANGUAGE_CODE

with open(f'static/translations/{language_code}.json', 'r') as f:
    translations = json.load(f)

class HomePageView(TemplateView):
    template_name = "home.html"

    def get(self, request):
        form = HomeForm()

        if 1 > 2: # TODO session clearing
            for key in list(request.session.keys()):
                if not key.startswith("_"): # skip keys set by the django system
                    del request.session[key]

        if 'start_timestamp' in request.session and request.session['start_timestamp'] != "": #TODO
            survey_time = datetime.now().timestamp() - int(request.session['start_timestamp'])

            if survey_time > lobby_time + chatroom_time:
                return HttpResponseRedirect("end_chat")

            if survey_time > lobby_time:
                return HttpResponseRedirect("chatroom")

            if survey_time > 1:
                return HttpResponseRedirect("lobby")

        

        return render(request, "home.html", {"form": form, 'translations': translations})

    def post(self, request, **kwargs):
        form = HomeForm(request.POST)

        if form.is_valid():
            request.session['nick'] = form.cleaned_data['nick']

            if form.cleaned_data['nick'] == "":
                request.session['nick'] = "Uczestnik badania"

            request.session['key'] = form.cleaned_data['key_from_qualtrics']
            request.session['is_positive_manipulation'] = form.data['is_positive_manipulation']
            request.session['start_timestamp'] = datetime.now().timestamp()
    
            return HttpResponseRedirect("/lobby/")

        return render(request, 'home.html', {'form':form, 'translations': translations})

class LobbyPageView(TemplateView):
    template_name = "lobby.html"

    def get(self, request):
        if 'key' not in request.session or request.session['key'] == "":
            form = HomeForm()
            return render(request, 'home.html', {'form':form, 'translations': translations})

        if 'start_timestamp' in request.session and request.session['start_timestamp'] != "": #TODO
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
        context['translations'] = translations

        context['lobby_title'] = translations.get('lobby_title').format(nick=self.request.session['nick'])

        return context

class ChatroomPageView(TemplateView):  
    template_name = "chatroom.html"

    def get(self, request):
        if 'key' not in request.session or request.session['key'] == "":
            form = HomeForm()
            return render(request, 'home.html', {'form':form, 'translations': translations})

        if 'start_timestamp' in request.session and request.session['start_timestamp'] != "": #TODO
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
        context['is_positive_manipulation'] = self.request.session['is_positive_manipulation']
        context['translations'] = translations
        context['language_code'] = language_code

        return context

class EndChatPageView(TemplateView):
    template_name = "end_chat.html"

    def get(self, request):
        if 'key' not in request.session or request.session['key'] == "":
            form = HomeForm()
            return render(request, 'home.html', {'form':form, 'translations': translations})

        if False and 'start_timestamp' in request.session and request.session['start_timestamp'] != "":
            survey_time = datetime.now().timestamp() - int(request.session['start_timestamp'])

            #if survey_time > lobby_time + chatroom_time:
            #    return HttpResponseRedirect("../end_chat")

            if survey_time < lobby_time + chatroom_time:
                return HttpResponseRedirect("../chatroom")

            if survey_time < lobby_time:
                return HttpResponseRedirect("../lobby")

        return super(EndChatPageView, self).get(request)

    def get_context_data(self, *args, **kwargs):
        context = super(EndChatPageView, self).get_context_data(*args,**kwargs)
        context['translations'] = translations

        return context

class ReturnQualtricsCodePageView(TemplateView):
    template_name = "return_qualtrics_code.html"

    def get(self, request):
        if 'key' not in request.session or request.session['key'] == "":
            form = HomeForm()
            return render(request, 'home.html', {'form':form, 'translations': translations})

        if False and 'start_timestamp' in request.session and request.session['start_timestamp'] != "":
            survey_time = datetime.now().timestamp() - int(request.session['start_timestamp'])

            #if survey_time > lobby_time + chatroom_time:
            #    return HttpResponseRedirect("../end_chat")

            if survey_time < lobby_time + chatroom_time:
                return HttpResponseRedirect("../chatroom")

            if survey_time < lobby_time:
                return HttpResponseRedirect("../lobby")

        return super(ReturnQualtricsCodePageView, self).get(request)

    def get_context_data(self, *args, **kwargs):
        context = super(ReturnQualtricsCodePageView, self).get_context_data(*args,**kwargs)
        context['translations'] = translations

        return context

class AjaxPageView(TemplateView):
    chat_ai = ChatAI()

    def post(self, request, **kwargs):
        form = HomeForm()
                
        if request.POST.get('action') == "nick":
            self.chat_ai.setNick(request.POST.get('nick'))

            # TODO wylaczenie bazy
            '''
            nick = Nicks(
                qualtrics_id=request.session['key'],
                nick=request.session['nick'],
                chatroom_start=datetime.now().timestamp(),
                is_manipulation_positive=(request.session['is_positive_manipulation']=="True")
            )
            '''

            # TODO wylaczenie bazy
            #nick.save()        

        if request.POST.get('action') == "message":
            # TODO wylaczenie bazy
            '''
            messages = Messages(
                qualtrics_id = request.session['key'],
                message = request.POST.get('message'),
                prev_message = request.POST.get('prev_message'),
                prev_prev_message = request.POST.get('prev_prev_message'),
                bot_response = request.POST.get('bot_response'),
                message_time = request.POST.get('message_time'),
                message_respond_to = request.POST.get('respond_message_id'),
                typing_time = request.POST.get('typing_time')
            )
            '''
            
            # TODO wylaczenie bazy
            #messages.save()
        
        if request.POST.get('action') == "like_reactions":
            reactions_array = []

            # TODO wylaczenie bazy
            '''

            for elem in request.POST.get('reactions').split():
                reactions_array.append({
                       "qualtrics_id": request.session['key'],
                        "message_id": int(elem),
                })

            django_list = [LikeReactions(**vals) for vals in reactions_array]
            LikeReactions.objects.bulk_create(django_list)
            '''

        if request.POST.get('action') == "heart_reactions":
            reactions_array = []

            # TODO wylaczenie bazy
            '''

            for elem in request.POST.get('reactions').split():
                reactions_array.append({
                       "qualtrics_id": request.session['key'],
                        "message_id": int(elem),
                })

            django_list = [HeartReactions(**vals) for vals in reactions_array]
            HeartReactions.objects.bulk_create(django_list)
            '''

        if request.POST.get('action') == "angry_reactions":
            reactions_array = []

            # TODO wylaczenie bazy
            '''
            for elem in request.POST.get('reactions').split():
                reactions_array.append({
                       "qualtrics_id": request.session['key'],
                        "message_id": int(elem),
                })

            django_list = [AngryReactions(**vals) for vals in reactions_array]
            AngryReactions.objects.bulk_create(django_list)
            '''
            
        if request.POST.get('action') == "interactions":
            # TODO wylaczenie bazy
            '''
            interactions = Interactions(
                qualtrics_id = request.session['key'],
                hesitation = request.POST.get('hesitation'),
                mouse_movement_seconds = request.POST.get('mouse_movement_seconds'),
                scroll_seconds = request.POST.get('scroll_seconds'),
                input_seconds = request.POST.get('input_seconds'),
                is_chatroom_finished = request.POST.get('is_chatroom_finished')
            )
            '''
            
            # TODO wylaczenie bazy
            #interactions.save()

        return render(request, 'home.html', {'form':form})

    def get(self, request):
        respond, responding_bot = self.chat_ai.generateRespond(
            request.GET['message'],
            request.GET['prev_message_id']
        )

        return JsonResponse({'respond': respond, "responding_bot": responding_bot}, status=200, content_type="application/json")