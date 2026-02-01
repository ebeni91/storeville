from django.db import migrations, models
import django.contrib.postgres.fields

class Migration(migrations.Migration):
    dependencies = [
        ('stores', '0004_store_address_store_latitude_store_longitude'),
    ]

    operations = [
        migrations.AddField(
            model_name='store',
            name='payment_methods',
            field=django.contrib.postgres.fields.ArrayField(
                base_field=models.CharField(max_length=20, choices=[('chapa','Chapa'),('telebirr','Telebirr'),('mpesa','M-Pesa')]),
                default=list,
                blank=True,
            ),
        ),
        migrations.AddField(
            model_name='store',
            name='payment_accounts',
            field=models.JSONField(default=dict, blank=True),
        ),
    ]
