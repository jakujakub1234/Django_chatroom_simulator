from django.db import models
from datetime import datetime

class Nicks(models.Model):
    qualtrics_id = models.CharField(max_length=255)
    nick = models.CharField(max_length=255)
    is_manipulation_positive = models.BooleanField(default=True)
    chatroom_start = models.DateTimeField(auto_now_add=True)
    language_version = models.CharField(max_length=32, default="pl")

class Messages(models.Model):
    qualtrics_id = models.CharField(max_length=255)
    message = models.CharField(max_length=2550)
    prev_message = models.CharField(max_length=2550, default="DEFAULT")
    prev_prev_message = models.CharField(max_length=2550, default="DEFAULT")
    bot_response = models.CharField(max_length=2550, default="DEFAULT")
    message_time = models.IntegerField()
    message_respond_to = models.IntegerField(default=0)
    typing_time = models.IntegerField(default=0)

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
    is_chatroom_finished = models.IntegerField(default=0)
    chatroom_exit_time = models.IntegerField(default=0)

class Reports(models.Model):
    qualtrics_id = models.CharField(max_length=255)
    message_id = models.IntegerField()
    report_id = models.IntegerField()

class ExitPoll(models.Model):
    qualtrics_id = models.CharField(max_length=255)
    is_yes = models.BooleanField(default=True)
    vote_seconds = models.IntegerField(default=0)