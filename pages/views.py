from django.views.generic import TemplateView
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.http import JsonResponse
from .forms import HomeForm
from .models import Nicks
from .models import Messages
from .models import LikeReactions, HeartReactions, AngryReactions
from .models import Interactions
from .models import Reports
from .models import ExitPoll
from .utils import lobby_time, chatroom_time
from .chat_ai.chat_ai import ChatAI
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

        if 'start_timestamp' in request.session and request.session['start_timestamp'] != "": #TODO
            survey_time = datetime.now().timestamp() - int(request.session['start_timestamp'])

            if survey_time > lobby_time + chatroom_time:
                return HttpResponseRedirect("end_chat")

            if survey_time > lobby_time:
                return HttpResponseRedirect("chatroom")

            if survey_time > 1:
                return HttpResponseRedirect("lobby")

        return render(request, "home.html", {"form": form, 'translations': translations, "debug_mode": settings.DEBUG_MODE})

    def post(self, request, **kwargs):
        form = HomeForm(request.POST)

        if form.is_valid():
            request.session['nick'] = form.cleaned_data['nick']

            if form.cleaned_data['nick'] == "":
                request.session['nick'] = translations.get('default_user_name')

            request.session['key'] = form.cleaned_data['key_from_qualtrics']
            request.session['is_positive_manipulation'] = form.data['is_positive_manipulation']
            request.session['start_timestamp'] = datetime.now().timestamp()

            if settings.DEBUG_MODE:
                request.session['chat_speed_hidden'] = request.POST.get("chat_speed_hidden")
                request.session['not_exit_chat_hidden'] = request.POST.get("not_exit_chat_hidden")
                request.session['dont_scroll_chat_hidden'] = request.POST.get("dont_scroll_chat_hidden")
                request.session['no_user_interaction_hidden'] = request.POST.get("no_user_interaction_hidden")
    
            return HttpResponseRedirect("/lobby")

        return render(request, 'home.html', {'form':form, 'translations': translations, "debug_mode": settings.DEBUG_MODE})

class LobbyPageView(TemplateView):
    template_name = "lobby.html"

    def get(self, request):
        if 'key' not in request.session or request.session['key'] == "":
            form = HomeForm()
            return render(request, 'home.html', {'form':form, 'translations': translations, "debug_mode": settings.DEBUG_MODE})

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
            return render(request, 'home.html', {'form':form, 'translations': translations, "debug_mode": settings.DEBUG_MODE})

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

        if settings.DEBUG_MODE:
            context['chat_speed_hidden'] = self.request.session['chat_speed_hidden']
            context['not_exit_chat_hidden'] = self.request.session['not_exit_chat_hidden']
            context['dont_scroll_chat_hidden'] = self.request.session['dont_scroll_chat_hidden']
            context['no_user_interaction_hidden'] = self.request.session['no_user_interaction_hidden']
        else:
            context['chat_speed_hidden'] = 1000
            context['not_exit_chat_hidden'] = 0
            context['dont_scroll_chat_hidden'] = 0
            context['no_user_interaction_hidden'] = 1

        return context

class EndChatNoExitPollPageView(TemplateView):
    template_name = "end_chat_no_exitpoll.html"

    def get(self, request):
        if 'key' not in request.session or request.session['key'] == "":
            form = HomeForm()
            return render(request, 'home.html', {'form':form, 'translations': translations, "debug_mode": settings.DEBUG_MODE})

        return super(EndChatNoExitPollPageView, self).get(request)

    def get_context_data(self, *args, **kwargs):
        context = super(EndChatNoExitPollPageView, self).get_context_data(*args,**kwargs)
        context['translations'] = translations

        return context

class EndChatPageView(TemplateView):
    template_name = "end_chat.html"

    def get(self, request):
        if 'key' not in request.session or request.session['key'] == "":
            form = HomeForm()
            return render(request, 'home.html', {'form':form, 'translations': translations, "debug_mode": settings.DEBUG_MODE})

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
            return render(request, 'home.html', {'form':form, 'translations': translations, "debug_mode": settings.DEBUG_MODE})

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
            
            nick = Nicks(
                qualtrics_id=request.session['key'],
                nick=request.session['nick'],
                chatroom_start=datetime.now().timestamp(),
                is_manipulation_positive=(request.session['is_positive_manipulation']=="True"),
                language_version=language_code,
                manipulation_type=request.session['is_positive_manipulation']
            )
            
            # # TODO wylaczenie bazy
            nick.save()        

        if request.POST.get('action') == "message":
            # TODO wylaczenie bazy
            
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
            
            # # TODO wylaczenie bazy
            messages.save()
        
        if request.POST.get('action') == "like_reactions":
            reactions_array = []

            # TODO wylaczenie bazy

            for elem in request.POST.get('reactions').split():
                reactions_array.append({
                       "qualtrics_id": request.session['key'],
                        "message_id": int(elem),
                })

            django_list = [LikeReactions(**vals) for vals in reactions_array]
            LikeReactions.objects.bulk_create(django_list)
            

        if request.POST.get('action') == "heart_reactions":
            reactions_array = []

            # TODO wylaczenie bazy

            for elem in request.POST.get('reactions').split():
                reactions_array.append({
                       "qualtrics_id": request.session['key'],
                        "message_id": int(elem),
                })

            django_list = [HeartReactions(**vals) for vals in reactions_array]
            HeartReactions.objects.bulk_create(django_list)

        if request.POST.get('action') == "angry_reactions":
            reactions_array = []

            # TODO wylaczenie bazy
            for elem in request.POST.get('reactions').split():
                reactions_array.append({
                       "qualtrics_id": request.session['key'],
                        "message_id": int(elem),
                })

            django_list = [AngryReactions(**vals) for vals in reactions_array]
            AngryReactions.objects.bulk_create(django_list)
            
        if request.POST.get('action') == "interactions":
            # TODO wylaczenie bazy
            interactions = Interactions(
                qualtrics_id = request.session['key'],
                hesitation = request.POST.get('hesitation'),
                mouse_movement_seconds = request.POST.get('mouse_movement_seconds'),
                scroll_seconds = request.POST.get('scroll_seconds'),
                input_seconds = request.POST.get('input_seconds'),
                is_chatroom_finished = request.POST.get('is_chatroom_finished'),
                chatroom_exit_time = request.POST.get('chatroom_exit_time'),
            )

            # TODO wylaczenie bazy
            interactions.save()

        if request.POST.get('action') == "reports":
            # TODO wylaczenie bazy
            reports = Reports(
                qualtrics_id = request.session['key'],
                message_id = request.POST.get('message_id'),
                message_text = request.POST.get('message_text'),
                report_id = request.POST.get('report_id')
            )
            
            # TODO wylaczenie bazy
            reports.save()

        if request.POST.get('action') == "exit_poll":
            # TODO wylaczenie bazy
            exit_poll = ExitPoll(
                qualtrics_id = request.session['key'],
                is_yes = request.POST.get('is_yes')=="True",
                vote_seconds = request.POST.get('vote_seconds'),
            )
            
            # TODO wylaczenie bazy
            exit_poll.save()

        return render(request, 'home.html', {'form': form, 'translations': translations, "debug_mode": settings.DEBUG_MODE})

    def get(self, request):
        respond, respond_type, responding_bot = self.chat_ai.generateRespond(
            request.GET['message'],
            request.GET['prev_message_id'],
            request.GET['message_timestamp']
        )

        return JsonResponse({'respond': respond, "respond_type": respond_type, "responding_bot": responding_bot}, status=200, content_type="application/json")
