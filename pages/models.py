from django.db import models

class Nicks(models.Model):
    qualtrics_id = models.CharField(max_length=255)
    nick = models.CharField(max_length=255)

class Messages(models.Model):
    qualtrics_id = models.CharField(max_length=255)
    message = models.CharField(max_length=2550)
    message_time = models.IntegerField()
