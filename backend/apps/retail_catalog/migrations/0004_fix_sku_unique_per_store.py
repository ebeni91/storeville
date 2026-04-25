from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('retail_catalog', '0003_alter_retailcategory_unique_together_and_more'),
    ]

    operations = [
        # Remove the old platform-wide unique constraint on sku
        migrations.AlterField(
            model_name='retailproduct',
            name='sku',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        # Add a per-store unique constraint (NULL skus are excluded)
        migrations.AddConstraint(
            model_name='retailproduct',
            constraint=models.UniqueConstraint(
                condition=models.Q(sku__isnull=False),
                fields=['store', 'sku'],
                name='unique_sku_per_store',
            ),
        ),
    ]
