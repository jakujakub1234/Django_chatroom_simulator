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
from .utils import lobby_time, chatroom_time, chatroom_configuration, load_translations
from .chat_ai.chat_ai import ChatAI
from django.conf import settings

from datetime import datetime

language_code = settings.LANGUAGE_CODE

translations = load_translations()

class HomePageView(TemplateView):
    template_name = "home.html"

    def get(self, request):
        form = HomeForm()

        if 'start_timestamp' in request.session and request.session['start_timestamp'] != "":
            survey_time = datetime.now().timestamp() - int(request.session['start_timestamp'])

            if survey_time > lobby_time + chatroom_time:
                return HttpResponseRedirect("end_chat")

            if survey_time > lobby_time:
                return HttpResponseRedirect("chatroom")

            if survey_time > 1:
                return HttpResponseRedirect("lobby")

        return render(request, "home.html", {"form": form, 'translations': translations, "debug_mode": settings.DEBUG})

    def post(self, request, **kwargs):
        form = HomeForm(request.POST)

        if form.is_valid():
            request.session['nick'] = form.cleaned_data['nick']

            if form.cleaned_data['nick'] == "":
                request.session['nick'] = translations.get('default_user_name')

            request.session['key'] = form.cleaned_data['key_from_qualtrics']
            request.session['manipulation_type'] = form.data['manipulation_type']
            request.session['start_timestamp'] = datetime.now().timestamp()
            request.session['is_debug_hidden'] =  1 if settings.DEBUG else 0

            if settings.DEBUG:
                request.session['chat_speed_hidden'] = request.POST.get("chat_speed_hidden")
                request.session['not_exit_chat_hidden'] = request.POST.get("not_exit_chat_hidden")
                request.session['dont_scroll_chat_hidden'] = request.POST.get("dont_scroll_chat_hidden")
                request.session['no_user_interaction_hidden'] = request.POST.get("no_user_interaction_hidden")
                request.session['instant_exit_poll_hidden'] = request.POST.get("instant_exit_poll_hidden")
    
            return HttpResponseRedirect("/lobby")

        return render(request, 'home.html', {'form':form, 'translations': translations, "debug_mode": settings.DEBUG})

class LobbyPageView(TemplateView):
    template_name = "lobby.html"

    def get(self, request):
        if 'key' not in request.session or request.session['key'] == "":
            form = HomeForm()
            return render(request, 'home.html', {'form':form, 'translations': translations, "debug_mode": settings.DEBUG})

        if 'start_timestamp' in request.session and request.session['start_timestamp'] != "":
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
        context['lobby_time'] = lobby_time

        context['lobby_title'] = translations.get('lobby_title').format(nick=self.request.session['nick'])

        return context

class ChatroomPageView(TemplateView):  
    template_name = "chatroom.html"

    def loadJsonWithBotsMessages(self, manipulation_type):
        if manipulation_type == "RESPECT":
            path = f"static/js/bots_messages/{language_code}/positive_bots_messages.json"
        elif manipulation_type == "NONRESPECT":
            path = f"static/js/bots_messages/{language_code}/negative_bots_messages.json"
        else:
            path = f"static/js/bots_messages/{language_code}/control_bots_messages.json"

        with open(path, encoding="utf-8") as f:
            return f.read()

    def get(self, request):
        if 'key' not in request.session or request.session['key'] == "":
            form = HomeForm()
            return render(request, 'home.html', {'form':form, 'translations': translations, "debug_mode": settings.DEBUG})

        if 'start_timestamp' in request.session and request.session['start_timestamp'] != "":
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
        context['manipulation_type'] = self.request.session['manipulation_type']
        context['translations'] = translations
        context['language_code'] = language_code
        context['is_debug_hidden'] = 1 if settings.DEBUG else 0
        context['chatroom_time'] = chatroom_time
        context['bots_messages_json'] = self.loadJsonWithBotsMessages(self.request.session['manipulation_type'])
        context['chatroom_configuration'] = chatroom_configuration

        if settings.DEBUG:
            context['chat_speed_hidden'] = self.request.session['chat_speed_hidden']
            context['not_exit_chat_hidden'] = self.request.session['not_exit_chat_hidden']
            context['dont_scroll_chat_hidden'] = self.request.session['dont_scroll_chat_hidden']
            context['no_user_interaction_hidden'] = self.request.session['no_user_interaction_hidden']
            context['instant_exit_poll_hidden'] = self.request.session['instant_exit_poll_hidden']
        else:
            context['chat_speed_hidden'] = 1000
            context['not_exit_chat_hidden'] = 0
            context['dont_scroll_chat_hidden'] = 0
            context['no_user_interaction_hidden'] = 0
            context['instant_exit_poll_hidden'] = 0

        return context

class EndChatNoExitPollPageView(TemplateView):
    template_name = "end_chat_no_exitpoll.html"

    def get(self, request):
        if 'key' not in request.session or request.session['key'] == "":
            form = HomeForm()
            return render(request, 'home.html', {'form':form, 'translations': translations, "debug_mode": settings.DEBUG})

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
            return render(request, 'home.html', {'form':form, 'translations': translations, "debug_mode": settings.DEBUG})

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
            return render(request, 'home.html', {'form':form, 'translations': translations, "debug_mode": settings.DEBUG})

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
            
            if settings.DATABASES_ACTIVE:
                nick = Nicks(
                    qualtrics_id=request.session['key'],
                    nick=request.session['nick'],
                    chatroom_start=datetime.now().timestamp(),
                    language_version=language_code,
                    manipulation_type=request.session['manipulation_type']
                )
            
                nick.save()        

        if request.POST.get('action') == "message":
            if settings.DATABASES_ACTIVE:
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

                messages.save()
        
        if request.POST.get('action') == "like_reactions":
            reactions_array = []

            if settings.DATABASES_ACTIVE:
                for elem in request.POST.get('reactions').split():
                    reactions_array.append({
                        "qualtrics_id": request.session['key'],
                            "message_id": int(elem),
                    })

                django_list = [LikeReactions(**vals) for vals in reactions_array]
                LikeReactions.objects.bulk_create(django_list)
            

        if request.POST.get('action') == "heart_reactions":
            reactions_array = []

            if settings.DATABASES_ACTIVE:
                for elem in request.POST.get('reactions').split():
                    reactions_array.append({
                        "qualtrics_id": request.session['key'],
                            "message_id": int(elem),
                    })

                django_list = [HeartReactions(**vals) for vals in reactions_array]
                HeartReactions.objects.bulk_create(django_list)

        if request.POST.get('action') == "angry_reactions":
            reactions_array = []

            if settings.DATABASES_ACTIVE:
                for elem in request.POST.get('reactions').split():
                    reactions_array.append({
                        "qualtrics_id": request.session['key'],
                            "message_id": int(elem),
                    })

                django_list = [AngryReactions(**vals) for vals in reactions_array]
                AngryReactions.objects.bulk_create(django_list)
            
        if request.POST.get('action') == "interactions":
            if settings.DATABASES_ACTIVE:
                interactions = Interactions(
                    qualtrics_id = request.session['key'],
                    hesitation = request.POST.get('hesitation'),
                    mouse_movement_seconds = request.POST.get('mouse_movement_seconds'),
                    scroll_seconds = request.POST.get('scroll_seconds'),
                    input_seconds = request.POST.get('input_seconds'),
                    is_chatroom_finished = request.POST.get('is_chatroom_finished'),
                    chatroom_exit_time = request.POST.get('chatroom_exit_time'),
                )

                interactions.save()

        if request.POST.get('action') == "reports":
            if settings.DATABASES_ACTIVE:
                reports = Reports(
                    qualtrics_id = request.session['key'],
                    message_id = request.POST.get('message_id'),
                    message_text = request.POST.get('message_text'),
                    report_id = request.POST.get('report_id')
                )
                
                reports.save()

        if request.POST.get('action') == "exit_poll":
            if settings.DATABASES_ACTIVE:
                exit_poll = ExitPoll(
                    qualtrics_id = request.session['key'],
                    is_yes = request.POST.get('is_yes')=="True",
                    vote_seconds = request.POST.get('vote_seconds'),
                )
                
                exit_poll.save()

        return render(request, 'home.html', {'form': form, 'translations': translations, "debug_mode": settings.DEBUG})

    def get(self, request):
        respond, respond_type, responding_bot = self.chat_ai.generateRespond(
            request.GET['message'],
            request.GET['prev_message_id'],
            request.GET['message_timestamp'],
            request.session['manipulation_type']
        )

        return JsonResponse({'respond': respond, "respond_type": respond_type, "responding_bot": responding_bot}, status=200, content_type="application/json")
