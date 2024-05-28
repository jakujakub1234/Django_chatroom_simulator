from django import forms


class HomeForm(forms.Form):
    nick = forms.CharField(label="Podaj swój nick", max_length=100, error_messages={'required': 'your custom error message'})