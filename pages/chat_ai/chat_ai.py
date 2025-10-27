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
        self.module_dir = os.path.dirname(__file__)  
        
        directory_for_current_lang = f'files_for_ai/{language_code}'

        self.chatroom_script_dir = f'../../static/js/{language_code}'

        self.user_nick = ""
        self.user_messages_counter = 0

        with open(os.path.join(self.module_dir, f'{directory_for_current_lang}/keywords.json')) as file:
            keywords = json.load(file)

        self.greetings = keywords["GREETINGS"]
        self.questions = keywords["QUESTIONS"]
        self.what_should_we_do = keywords["WHAT_SHOULD_WE_DO"]

        self.what_should_we_do_counter = 0

        self.keywords_from_excel = {}

        self.MAX_EXCEL_INEDX = 361

        for i in range(self.MAX_EXCEL_INEDX + 1):
            if str(i) in keywords:
                self.keywords_from_excel[str(i)] = keywords[str(i)]

        self.gemini_api_key = "error: secrets not found"
        self.gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent"
        
        self.previous_message_timestamp = -100
        self.previous_gibberish_message_timestamp = -1000

        self.chatroom_history = []
        self.sended_messages_history = []

        with open('secrets.yaml', 'r') as file:
            self.gemini_api_key = yaml.safe_load(file)['API_GEMINI']

        with open(os.path.join(self.module_dir, f'{directory_for_current_lang}/responds.json')) as file:
            self.responds = json.load(file)

        with open(os.path.join(self.module_dir, f'{directory_for_current_lang}/responds_in_specific_place.json')) as file:
            self.responds_in_specific_place = json.load(file)

        with open(os.path.join(self.module_dir, f'{directory_for_current_lang}/gemini_prompts.json'), 'r') as file:
            gemini_json = json.load(file)

            self.gemini_prompt_main = gemini_json["main_prompt"]
            
            self.gemini_prompt_gibberish_detector = gemini_json["gibberish_detector"]
            self.gemini_prompt_curse_detector = gemini_json["curse_detector"]

            self.gemini_prompt_yes = gemini_json["yes"]
            self.gemini_prompt_no = gemini_json["no"]

            self.bots = gemini_json["bots_nicks"].split(";")

        with open(os.path.join(self.module_dir, f'{directory_for_current_lang}/never_existing_2_letters_combos.txt'), 'r') as file:
            self.never_existing_2_letters = set(file.read().split())

        with open(os.path.join(self.module_dir, f'{directory_for_current_lang}/never_existing_3_letters_combos.txt'), 'r') as file:
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
        
        headers = {
            "Content-Type": "application/json"
        }

        payload = {
            "contents": [{
                "parts": [{"text": self.gemini_prompt_gibberish_detector + message}]
            }]
        }

        try:
            response = requests.post(self.gemini_url, headers=headers, json=payload, params={"key": self.gemini_api_key})
        except:
            return False

        if response.status_code == 200:
            if self.gemini_prompt_yes == response.json()['candidates'][0]['content']['parts'][0]['text'].lower():
                print("AI twierdzi ze " + message + " to gibberish")
                return True

        return False

    def generateRespondUsingGemini(self, message):
        final_bot = None
        self.user_messages_counter += 1

        result_message = ""

        headers = {
            "Content-Type": "application/json"
        }

        gemini_prompt = self.gemini_prompt_main.replace("CHATROOM_HISTORY", "\n" + "\n".join(self.chatroom_history))
        print("Prompt: " + gemini_prompt + ": " + message)
        
        payload = {
            "contents": [
                {
                    "parts": [{"text": gemini_prompt + ": " + message}]
                }
            ]
        }

        try:
            response = requests.post(self.gemini_url, headers=headers, json=payload, params={"key": self.gemini_api_key})
        except:
            return False

        if response.status_code == 200:
            respond_text = response.json()['candidates'][0]['content']['parts'][0]['text']
            
            print("Response: " + respond_text)

            if "->" in respond_text:
                bot_nick, msg_tmp = respond_text.split("->")

                bot_nick = bot_nick.strip()
                bot_nick = bot_nick.split()[-1]

                result_message = msg_tmp.strip()

                for bot_name in self.bots:
                    if bot_name.lower() == bot_nick.lower():
                        final_bot = bot_name
                        break
            else:
                result_message = respond_text
        else:
            return False 

        if result_message.count("**") >= 2:
            result_message = result_message[result_message.index("**")+2:]
            result_message = result_message[:result_message.index("**")]

        if result_message.count("\"\"") >= 2:
            result_message = result_message[result_message.index("\"\"")+2:]
            result_message = result_message[:result_message.index("\"\"")]

        if "odp:" in result_message.lower():
            result_message[result_message.lower().index("odp:")+4:]
        if "odpowiedz:" in result_message.lower():
            result_message[result_message.lower().index("odpowiedz:")+10:]
        if "odpowiedź:" in result_message.lower():
            result_message[result_message.lower().index("odpowiedź:")+10:]

        result_message.replace("\"", "")

        print("Final response: " + result_message)

        return [final_bot, result_message]

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
    
    def getBotsChatroomHistory(self, message_timestamp, is_manipulation_positive):
        self.chatroom_history = []

        filename = "ERROR"

        if is_manipulation_positive == "RESPECT":
            filename = "positive_bots_messages.js"
        elif is_manipulation_positive == "NONRESPECT":
            filename = "negative_bots_messages.js"
        else:
            print("ERROR!!! INCORRECT IS_MANIPULATION_POSITIVE VALUE IN CHAT AI")

        actual_sended_messages_history_index = 0

        with open(os.path.join(self.module_dir, f'{self.chatroom_script_dir}/{filename}')) as file:
            for line in file:
                line = line.rstrip()

                if ":" in line:
                    timestamp, msg_array = line.split(':', 1)
                    if msg_array[-1] == ",":
                        msg_array = msg_array[:-1]

                    msg_array = eval(msg_array)

                    while actual_sended_messages_history_index < len(self.sended_messages_history) and int(timestamp) >= self.sended_messages_history[actual_sended_messages_history_index][0]:
                        self.chatroom_history.append(self.sended_messages_history[actual_sended_messages_history_index][1])
                        actual_sended_messages_history_index += 1

                    if int(timestamp) <= message_timestamp:
                        self.chatroom_history.append("bot " + msg_array[0] + " - " + msg_array[1])
                    else:
                        break

    def generateRespond(self, message, prev_message_id, message_timestamp, is_manipulation_positive):
        message_timestamp = int(message_timestamp)

        self.getBotsChatroomHistory(message_timestamp, is_manipulation_positive)
        self.chatroom_history.append("user - " + message)

        if message_timestamp - self.previous_message_timestamp < 4:
            return ["", "", ""]

        self.previous_message_timestamp = message_timestamp        

        prev_message_id = int(prev_message_id)
        self.user_messages_counter += 1

        message = self.preprocessMessage(message)

        responding_bot = random.choice(self.bots)

        if self.detectGibberish(message):
            print("GIBBERISH")
            if message_timestamp - self.previous_gibberish_message_timestamp < 120:
                return ["", "", ""]
            else:
                return [random.choice(self.responds["GIBBERISH"]), "GEMINI", responding_bot]
            
        if any(greeting in message.lower().split() for greeting in self.greetings):
            print("GREETING")
            return ["", "", ""]
        
        if any(bot_word in message.lower().split() for bot_word in ["bot", "boty", "bots", "ai", "bota"]):
            print("BOTS")
            return ["", "", ""]
        
        gemini_respond = self.generateRespondUsingGemini(message)

        if gemini_respond:
            responding_message_pair, responding_message_type = [gemini_respond, "GEMINI"]
            responding_message = [responding_message_pair[1]]

            if responding_message_pair[0] != None:
                responding_bot = responding_message_pair[0]
                print("LLM chose bot with nick: " + responding_bot)

        else:
            responding_message, responding_message_type = [self.generateRespondUsingAlgorithm(message, prev_message_id), "ALGORITHM"]

        responding_message = random.choice(responding_message)

        #if self.user_messages_counter % 3 == 0: TODO remove comments
        #    responding_message = ""

        print("RESPOND: " + responding_message)

        self.sended_messages_history.append([message_timestamp + 1, "user - " + message])
        self.sended_messages_history.append([message_timestamp + 2, "bot " + responding_bot + " - " + responding_message])

        return [responding_message, responding_message_type, responding_bot]
        