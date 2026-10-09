from django.db import migrations, models
class Migration(migrations.Migration):
    dependencies = [("transactions", "0004_merge_0003_migrations")]
    operations = [
        migrations.AddField("transaction", "category", models.CharField(blank=True, db_index=True, default="Other", max_length=80)),
        migrations.AddField("transaction", "fraud_status", models.CharField(db_index=True, default="CLEAR", max_length=16)),
        migrations.AddField("transaction", "fraud_reason", models.CharField(blank=True, default="", max_length=255)),
        migrations.AddField("transaction", "location", models.CharField(blank=True, default="", max_length=120)),
        migrations.AddField("transaction", "device_id", models.CharField(blank=True, default="", max_length=120)),
    ]
