from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="CarMake",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=80, unique=True)),
                ("country", models.CharField(blank=True, max_length=80)),
                ("founded_year", models.PositiveSmallIntegerField(blank=True, null=True)),
                ("description", models.TextField(blank=True)),
                ("logo_url", models.URLField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["name"], "verbose_name": "car make", "verbose_name_plural": "car makes"},
        ),
        migrations.CreateModel(
            name="CarModel",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("year", models.PositiveSmallIntegerField()),
                ("body_style", models.CharField(choices=[("sedan", "Sedan"), ("suv", "SUV"), ("truck", "Truck"), ("coupe", "Coupe"), ("hatchback", "Hatchback"), ("van", "Van"), ("other", "Other")], default="other", max_length=20)),
                ("fuel_type", models.CharField(choices=[("gasoline", "Gasoline"), ("diesel", "Diesel"), ("hybrid", "Hybrid"), ("electric", "Electric"), ("other", "Other")], default="gasoline", max_length=20)),
                ("transmission", models.CharField(choices=[("automatic", "Automatic"), ("manual", "Manual"), ("other", "Other")], default="automatic", max_length=20)),
                ("starting_price", models.DecimalField(blank=True, decimal_places=2, max_digits=11, null=True)),
                ("image_url", models.URLField(blank=True)),
                ("description", models.TextField(blank=True)),
                ("is_available", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("make", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="models", to="dealership_api.carmake")),
            ],
            options={"ordering": ["make__name", "name", "-year"]},
        ),
        migrations.AddConstraint(
            model_name="carmodel",
            constraint=models.UniqueConstraint(fields=("make", "name", "year"), name="unique_make_model_year"),
        ),
    ]
