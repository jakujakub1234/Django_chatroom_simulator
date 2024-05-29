from django import forms


class HomeForm(forms.Form):
    nick = forms.CharField(label="Podaj swój nick", max_length=100)
    
    key_from_qualtrics = forms.CharField(
        label="Podaj klucz wygenerowany w Qualtricsie",
        max_length=100,
        error_messages={'required': 'your custom error message'}
    )

    def clean_key_from_qualtrics(self):
        key_from_qualtrics = self.cleaned_data['key_from_qualtrics']
        
        if key_from_qualtrics != "12":
            self._errors["key_from_qualtrics"] = ["Nieprawidłowy klucz z Qualtricsa"]
        
        return key_from_qualtrics