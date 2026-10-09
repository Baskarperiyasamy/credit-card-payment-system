from django.db import migrations, models


def seed_roles(apps, schema_editor):
    Role = apps.get_model("accounts", "Role")
    for name, description in [("ADMIN", "Full administrative access"), ("SUPPORT", "Support and investigation access"), ("READ_ONLY", "Read-only analytics and transaction access"), ("CUSTOMER", "Own cards and transactions")]:
        Role.objects.get_or_create(name=name, defaults={"description": description})

def unseed_roles(apps, schema_editor):
    apps.get_model("accounts", "Role").objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [("accounts", "0001_initial")]
    operations = [
        migrations.CreateModel(name="Role", fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("name", models.CharField(max_length=24, unique=True)), ("description", models.CharField(blank=True, default="", max_length=160))], options={"db_table": "roles"}),
        migrations.AddField(model_name="user", name="role", field=models.CharField(choices=[("ADMIN", "Admin"), ("SUPPORT", "Support"), ("READ_ONLY", "Read-only"), ("CUSTOMER", "Customer")], db_index=True, default="CUSTOMER", max_length=24)),
        migrations.RunPython(seed_roles, unseed_roles),
        migrations.RunSQL("UPDATE users SET role='ADMIN' WHERE is_staff=1", migrations.RunSQL.noop),
    ]
