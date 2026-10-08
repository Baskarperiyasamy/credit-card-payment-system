from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("transactions", "0002_transaction_user_created_idx")]

    operations = [
        migrations.AlterField(
            model_name="transaction",
            name="currency",
            field=models.CharField(default="INR", max_length=3),
        ),
    ]
