from enum import Enum
import random
import os

class Gender(Enum):
    MALE=1
    FEMALE=2
    NONE=3

class ChatAI:
    def __init__(self):
        module_dir = os.path.dirname(__file__)  

        self.user_nick = ""
        self.user_gender = Gender.NONE
        self.user_messages_counter = 0

        self.bots_names = [
            "Ania",
            "Kasia",
            "Piotrek",
            "Agnieszka",
            "Michal",
            "Arek",
            "Bartek"
        ]

        data_file = open(os.path.join(module_dir, 'words_for_ai/greetings.txt'))
        self.greetings = data_file.read().split()

    def setNick(self, nick):
        self.user_nick = nick

        consonants = "wrtpsdfghjklzxcvbnm"

        first_word = nick.split()[0]
        first_word = first_word.lower()

        if first_word[-1] == "a" and first_word != "kuba":
            self.user_gender = Gender.FEMALE

        if first_word[-1] in consonants:
            self.user_gender = Gender.MALE

    def getRespondingBot(self, message):
        for i in range(len(self.bots_names)):
            if self.bots_names[i].lower() in message:
                return self.bots_names[i]

        return random.choice(self.bots_names)

    def generateRepondMessage(self, message, responding_bot):
        responding_bot_gender = Gender.MALE

        if responding_bot[-1] == "a":
            responding_bot_gender = Gender.FEMALE

        self.user_messages_counter += 1

        if self.user_messages_counter > 50:
            return self.user_nick + " przestań spamować już"

        if len(message) > 300:
            return "tl;dr"

        if any(greeting in message.split() for greeting in self.greetings):
            return "Hejka " + self.user_nick

        return "Fajnie napisał" + ["e","a"][self.user_gender == Gender.FEMALE] + "ś " + self.user_nick + " <3",

    def generateRespond(self, message):
        self.user_messages_counter += 1

        message = message.lower()
        responding_bot = self.getRespondingBot(message)

        responding_message = self.generateRepondMessage(message, responding_bot)

        return [
            responding_message,
            responding_bot
        ]
        