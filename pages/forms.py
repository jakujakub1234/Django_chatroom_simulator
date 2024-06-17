from django import forms
from .models import Nicks

class HomeForm(forms.Form):
    nick = forms.CharField(label="Podaj swój nick", max_length=100, required=False, widget=forms.TextInput(attrs={"class": "form-input"}))
    
    key_from_qualtrics = forms.CharField(
        label="Podaj klucz wygenerowany w Qualtricsie",
        max_length=100,
        error_messages={'required': 'your custom error message'},
        widget=forms.TextInput(attrs={"class": "form-input"})
    )

    def clean_key_from_qualtrics(self):
        key_from_qualtrics = self.cleaned_data['key_from_qualtrics']

        is_key_in_db = Nicks.objects.filter(qualtrics_id=key_from_qualtrics).first()
        
        if is_key_in_db != None:
            self._errors["key_from_qualtrics"] = ["Klucz z Qualtricsa został już wcześniej użyty - w badaniu można wziąć udział tylko raz"]

        # TODO wyłączenie zabezpieczenia
        #if key_from_qualtrics != "12":
        #    self._errors["key_from_qualtrics"] = ["Nieprawidłowy klucz z Qualtricsa"]
        
        return key_from_qualtrics