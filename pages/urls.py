from django.urls import path
from .views import HomePageView, LobbyPageView, ChatroomPageView  

urlpatterns = [
    path("chatroom/", ChatroomPageView.as_view(), name="chatroom"),
    path("lobby/", LobbyPageView.as_view(), name="lobby"),
    path("", HomePageView.as_view(), name="home"),
]
