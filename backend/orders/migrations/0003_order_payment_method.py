from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('orders', '0002_order_order_reference_order_tracking_token_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='payment_method',
            field=models.CharField(
                max_length=20,
                choices=[('cod','Cash on Delivery'),('chapa','Chapa'),('telebirr','Telebirr'),('mpesa','M-Pesa')],
                default='cod'
            ),
        ),
    ]
