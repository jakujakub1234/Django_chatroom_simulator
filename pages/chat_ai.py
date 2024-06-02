from enum import Enum

class Gender(Enum):
    MALE=1
    FEMALE=2
    NONE=3

class ChatAI:
    def __init__(self):
        self.user_nick = ""
        self.user_gender = Gender.NONE
        self.user_messages_counter = 0

    def setNick(self, nick):
        self.user_nick = nick

        consonants = "wrtpsdfghjklzxcvbnm"

        first_word = nick.split()[0]
        first_word = first_word.lower()

        if first_word[-1] == "a" and first_word != "kuba":
            self.user_gender = Gender.FEMALE

        if first_word[-1] in consonants:
            self.user_gender = Gender.MALE

    def generateRespond(self, message, responding_bot): 
        responding_bot_gender = Gender.MALE

        if responding_bot[-1] == "a":
            responding_bot_gender = Gender.FEMALE

        self.user_messages_counter += 1

        if self.user_messages_counter > 50:
            return self.user_nick + " przestań spamować już"

        if len(message) > 300:
            return "tl;dr"

        return "O hejka " + self.user_nick + ", fajnie napisał" + ["e","a"][self.user_gender == Gender.FEMALE] + "ś <3"
        