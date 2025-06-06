from django.urls import path
from .views import HomePageView, LobbyPageView, ChatroomPageView, AjaxPageView, EndChatPageView, ReturnQualtricsCodePageView, EndChatNoExitPollPageView

urlpatterns = [
    path("chatroom/", ChatroomPageView.as_view(), name="chatroom"),
    path("lobby/", LobbyPageView.as_view(), name="lobby"),
    path("return_qualtrics_code/", ReturnQualtricsCodePageView.as_view(), name="return_qualtrics_code"),
    path("end_chat/", EndChatPageView.as_view(), name="end_chat"),
    path("end_chat_no_exitpoll/", EndChatNoExitPollPageView.as_view(), name="end_chat_no_exitpoll"),
    path("", HomePageView.as_view(), name="home"),
    path('ajax/', AjaxPageView.as_view(), name='ajax'),
]
