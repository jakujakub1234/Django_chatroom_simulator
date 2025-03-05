from enum import Enum
import random
import yaml
import os
import json
import string
from django.conf import settings
import requests

language_code = settings.LANGUAGE_CODE

class ChatAI:
    def __init__(self):
        random.seed(96423650032)
        module_dir = os.path.dirname(__file__)  
        directory_for_current_lang = f'files_for_ai/{language_code}'

        self.user_nick = ""
        self.user_messages_counter = 0

        with open(os.path.join(module_dir, f'{directory_for_current_lang}/keywords.json')) as file:
            keywords = json.load(file)

        self.questions = keywords["QUESTIONS"]
        self.what_should_we_do = keywords["WHAT_SHOULD_WE_DO"]

        self.what_should_we_do_counter = 0

        self.keywords_from_excel = {}

        self.MAX_EXCEL_INEDX = 361

        for i in range(self.MAX_EXCEL_INEDX + 1):
            if str(i) in keywords:
                self.keywords_from_excel[str(i)] = keywords[str(i)]

        self.gemini_api_key = "error: secrets not found"

        self.previous_message_timestamp = -100

        with open('secrets.yaml', 'r') as file:
            self.gemini_api_key = yaml.safe_load(file)['API_GEMINI']

        with open(os.path.join(module_dir, f'{directory_for_current_lang}/responds.json')) as file:
            self.responds = json.load(file)

        with open(os.path.join(module_dir, f'{directory_for_current_lang}/responds_in_specific_place.json')) as file:
            self.responds_in_specific_place = json.load(file)

        with open(os.path.join(module_dir, f'{directory_for_current_lang}/gemini_prompt.txt'), 'r') as file:
            self.gemini_prompt = file.read()

        with open(os.path.join(module_dir, f'{directory_for_current_lang}/never_existing_2_letters_combos.txt'), 'r') as file:
            self.never_existing_2_letters = set(file.read().split())

        with open(os.path.join(module_dir, f'{directory_for_current_lang}/never_existing_3_letters_combos.txt'), 'r') as file:
            self.never_existing_3_letters = set(file.read().split())

    def preprocessMessage(self, message):
        message = message.lower()
        
        message = message.replace("ę","e")
        message = message.replace("ó","o")
        message = message.replace("ą","a")
        message = message.replace("ś","s")
        message = message.replace("ż","z")
        message = message.replace("ź","z")
        message = message.replace("ć","c")
        message = message.replace("ń","n")
        message = message.replace("ł","l")

        message = message.translate(str.maketrans('', '', string.punctuation)) # TODO maybe not best idea, user can forgot about space after comma

        return message

    def setNick(self, nick):
        self.user_nick = nick

    def detectGibberish(self, message):
        words = message.split()
        if any(len(word) > 20 for word in words):
            return True

        if sum(letters in message for letters in self.never_existing_2_letters) > 3:
            return True
        if sum(letters in message for letters in self.never_existing_3_letters) > 3:
            return True

        return False

    def generateRespondUsingGemini(self, message):
        self.user_messages_counter += 1

        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        api_key = self.gemini_api_key

        headers = {
            "Content-Type": "application/json"
        }

        payload = {
            "contents": [{
                "parts": [{"text": self.gemini_prompt + message}]
            }]
        }

        try:
            response = requests.post(url, headers=headers, json=payload, params={"key": api_key})
        except:
            return False

        if response.status_code == 200:
            return([response.json()['candidates'][0]['content']['parts'][0]['text']])
        else:
            return False

    def generateRespondUsingAlgorithm(self, message, prev_message_id):
        if prev_message_id < 5 or prev_message_id > 48:
            return [""]

        if self.user_messages_counter > 50:
            return self.responds["SPAM"]

        if self.detectGibberish(message):
            return self.responds["GIBBERISH"]

        if prev_message_id < 10 or prev_message_id > 46:
            return [""]

        if len(message) > 300:
            return self.responds["TL_DR"]
        
        for key in self.keywords_from_excel:
            tmp_keywords = self.keywords_from_excel[key]
            
            for tmp_keyword in tmp_keywords:
                if tmp_keyword in message:
                    if key in self.responds_in_specific_place and int(key)-2 == prev_message_id:
                        return self.responds_in_specific_place[key]
                    if key in self.responds:
                        return self.responds[key]

        if prev_message_id > 11 and prev_message_id < 17 and self.what_should_we_do_counter < 3:
            if any(what_should_we_do_elem in message for what_should_we_do_elem in self.what_should_we_do):
                self.what_should_we_do_counter += 1

                return [self.responds["WHAT_SHOULD_WE_DO"][self.what_should_we_do_counter-1]]
        
        if prev_message_id > 14 and prev_message_id < 40:
            if len(message.split()) < 4:
                return self.responds["EXPLAIN_MORE"]

        if any(question in message.split() for question in self.questions) or "?" in message:
            return self.responds["QUESTIONS"]

        return self.responds["GENERIC"]

    def generateRespond(self, message, prev_message_id, message_timestamp):
        message_timestamp = int(message_timestamp)

        if message_timestamp - self.previous_message_timestamp < 15:
            return ["", ""]

        self.previous_message_timestamp = message_timestamp        

        prev_message_id = int(prev_message_id)
        self.user_messages_counter += 1

        message = self.preprocessMessage(message)

        gemini_respond = self.generateRespondUsingGemini(message)

        if gemini_respond:
            responding_message, responding_message_type = [gemini_respond, "GEMINI"]
        else:
            responding_message, responding_message_type = [self.generateRespondUsingAlgorithm(message, prev_message_id), "ALGORITHM"]

        responding_message = random.choice(responding_message)

        if responding_message in ["gibberish", "curse", "random"]:
            responding_message = ""

        #if self.user_messages_counter % 3 == 0: TODO remove comments
        #    responding_message = ""

        return [responding_message, responding_message_type]
        