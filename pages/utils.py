import json
import os
from django.conf import settings

if not os.path.isfile(os.path.dirname(__file__) + "/../chatroom_configuration.json"):
    print("ERROR: chatroom_configuration.json not found")
    exit()

with open(os.path.dirname(__file__) + "/../chatroom_configuration.json") as file:
    chatroom_configuration = json.load(file)

lobby_time = chatroom_configuration["lobby_time"]
chatroom_time = chatroom_configuration["chatroom_time"]

def load_translations():
    language_code = settings.LANGUAGE_CODE
    translations_path = os.path.join(settings.BASE_DIR, 'static/translations', f'{language_code}.json')
    
    try:
        with open(translations_path, 'r') as f:
            translations = json.load(f)
    except FileNotFoundError:
        translations = {}
    
    return translations