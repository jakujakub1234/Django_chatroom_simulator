from django.db import models
from datetime import datetime

class Nicks(models.Model):
    qualtrics_id = models.CharField(max_length=255)
    nick = models.CharField(max_length=255)
    is_manipulation_positive = models.BooleanField(default=True)
    chatroom_start = models.DateTimeField(auto_now_add=True)

class Messages(models.Model):
    qualtrics_id = models.CharField(max_length=255)
    message = models.CharField(max_length=2550)
    message_time = models.IntegerField()
    message_respond_to = models.IntegerField(default=0)
    typing_time = models.IntegerField(default=0)

#class Reactions(models.Model):
#    qualtrics_id = models.CharField(max_length=255)
#    message_id = models.IntegerField()
#    reaction_id = models.IntegerField()

class LikeReactions(models.Model):
    qualtrics_id = models.CharField(max_length=255)
    message_id = models.IntegerField()

class HeartReactions(models.Model):
    qualtrics_id = models.CharField(max_length=255)
    message_id = models.IntegerField()

class AngryReactions(models.Model):
    qualtrics_id = models.CharField(max_length=255)
    message_id = models.IntegerField()

class Interactions(models.Model):
    qualtrics_id = models.CharField(max_length=255)
    hesitation = models.IntegerField()
    mouse_movement_seconds = models.IntegerField()
    scroll_seconds = models.IntegerField()
    input_seconds = models.IntegerField()
