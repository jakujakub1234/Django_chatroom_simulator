from django import forms
from .models import Nicks
from .utils import load_translations
from django.conf import settings

class HomeForm(forms.Form):
    translations = load_translations()

    nick = forms.CharField(
        label=translations.get('home_form_nick'),
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={"class": "form-input"})
        # TODO remove chatroom interactions
        #widget=forms.HiddenInput()
    )

    if settings.DEBUG_MODE:
        key_from_qualtrics = forms.CharField(
            label=translations.get('home_form_qualtrics_key'),
            max_length=100,
            required=False,
            error_messages={'required': 'your custom error message'},
            widget=forms.HiddenInput()
        )
    else:    
        key_from_qualtrics = forms.CharField(
            label=translations.get('home_form_qualtrics_key'),
            max_length=100,
            error_messages={'required': 'your custom error message'},
            widget=forms.TextInput(attrs={"class": "form-input"})
        )

    MANIOULATION_TYPE_CHOICES = [
        ('2', 'Respect Manipulation'),
        ('1', 'Non Respect Manipulation'),
    ]

    if settings.DEBUG_MODE:
        manipulation_type = forms.ChoiceField(
            widget=forms.RadioSelect,
            choices=MANIOULATION_TYPE_CHOICES,
        )

    is_positive_manipulation = forms.CharField(
        widget=forms.HiddenInput(),
        required=False
    )

    def clean_key_from_qualtrics(self):
        translations = load_translations()

        key_from_qualtrics = self.cleaned_data['key_from_qualtrics']

        if settings.DEBUG_MODE:
            key_from_qualtrics = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxss7639" + str(self.data["manipulation_type"]) + "ss"

        key_from_qualtrics = key_from_qualtrics[:-2]

        control_number = key_from_qualtrics[-5:]

        if control_number != "76392" and control_number != "76393" and control_number != "76391":
            self._errors["key_from_qualtrics"] = [translations.get('home_error_qualtrics_key')]

        if control_number == "76392":
            self.data = self.data.copy()
            self.data['is_positive_manipulation'] = "RESPECT"
        elif control_number == "76393":
            self.data = self.data.copy()
            self.data['is_positive_manipulation'] = "CONTROL"
        elif control_number == "76391":
            self.data = self.data.copy()
            self.data['is_positive_manipulation'] = "NONRESPECT"
        else:
            self._errors["key_from_qualtrics"] = [translations.get('home_error_qualtrics_key')]

        key_from_qualtrics = key_from_qualtrics[:-5]

        if settings.DEBUG_MODE:
            return key_from_qualtrics

        if settings.DATABASES_ACTIVE:
            is_key_in_db = Nicks.objects.filter(qualtrics_id=key_from_qualtrics).first()
            if is_key_in_db != None:
                self._errors["key_from_qualtrics"] = ["Klucz z Qualtricsa został już wcześniej użyty - w badaniu można wziąć udział tylko raz"]

        return key_from_qualtrics