from django.db import models
from datetime import datetime

class Nicks(models.Model):
    qualtrics_id = models.CharField(max_length=255)
    nick = models.CharField(max_length=255)
    chatroom_start = models.DateTimeField(auto_now_add=True)

class Messages(models.Model):
    qualtrics_id = models.CharField(max_length=255)
    message = models.CharField(max_length=2550)
    message_time = models.IntegerField()
