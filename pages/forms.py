from django import forms


class HomeForm(forms.Form):
    nick = forms.CharField(label="Podaj swój nick", max_length=100)