from django.db import migrations, models
class Migration(migrations.Migration):
    dependencies = [("transactions", "0005_analytics_fraud_metadata")]
    operations = [migrations.CreateModel(name="FraudLog", fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("transaction_id", models.BigIntegerField(db_index=True)), ("user_id", models.BigIntegerField(db_index=True)), ("reason", models.CharField(max_length=255)), ("location", models.CharField(blank=True, default="", max_length=120)), ("device_id", models.CharField(blank=True, default="", max_length=120)), ("created_at", models.DateTimeField(auto_now_add=True))], options={"db_table": "fraud_logs", "ordering": ["-created_at", "-id"]})]
