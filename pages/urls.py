from django.urls import path
from .views import HomePageView, LobbyPageView, ChatroomPageView, AjaxPageView, EndChatPageView

urlpatterns = [
    path("chatroom/", ChatroomPageView.as_view(), name="chatroom"),
    path("lobby/", LobbyPageView.as_view(), name="lobby"),
    path("end_chat/", EndChatPageView.as_view(), name="end_chat"),
    path("", HomePageView.as_view(), name="home"),
    path('ajax/', AjaxPageView.as_view(), name='ajax'),
]
