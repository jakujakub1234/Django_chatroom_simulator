import json
import os
from django.conf import settings

lobby_time = 14
# TODO remove chatroom interactions 
#lobby_time = 0

chatroom_time = 580

def load_translations():
    language_code = settings.LANGUAGE_CODE
    translations_path = os.path.join(settings.BASE_DIR, 'static/translations', f'{language_code}.json')
    
    try:
        with open(translations_path, 'r') as f:
            translations = json.load(f)
    except FileNotFoundError:
        translations = {}
    
    return translations