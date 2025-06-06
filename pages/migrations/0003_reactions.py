# Generated by Django 4.2 on 2024-06-26 00:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("pages", "0002_messages_message_respond_to"),
    ]

    operations = [
        migrations.CreateModel(
            name="Reactions",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("qualtrics_id", models.CharField(max_length=255)),
                ("message_id", models.IntegerField()),
                ("reaction_id", models.IntegerField()),
            ],
        ),
    ]
