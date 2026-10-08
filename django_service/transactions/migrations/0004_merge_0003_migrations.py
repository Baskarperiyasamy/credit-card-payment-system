from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("transactions", "0003_alter_transaction_currency"),
        ("transactions", "0003_transaction_currency_inr"),
    ]

    operations = []
