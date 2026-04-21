from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stores', '0007_alter_store_banner_alter_store_latitude_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='storetheme',
            name='closing_time',
            field=models.TimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='storetheme',
            name='opening_time',
            field=models.TimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='storetheme',
            name='working_days',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
