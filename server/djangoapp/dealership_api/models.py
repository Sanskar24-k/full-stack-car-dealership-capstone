from django.db import models


class CarMake(models.Model):
    name = models.CharField(max_length=80, unique=True)
    country = models.CharField(max_length=80, blank=True)
    founded_year = models.PositiveSmallIntegerField(null=True, blank=True)
    description = models.TextField(blank=True)
    logo_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "car make"
        verbose_name_plural = "car makes"

    def __str__(self):
        return self.name


class CarModel(models.Model):
    BODY_STYLE_CHOICES = [
        ("sedan", "Sedan"),
        ("suv", "SUV"),
        ("truck", "Truck"),
        ("coupe", "Coupe"),
        ("hatchback", "Hatchback"),
        ("van", "Van"),
        ("other", "Other"),
    ]
    FUEL_CHOICES = [
        ("gasoline", "Gasoline"),
        ("diesel", "Diesel"),
        ("hybrid", "Hybrid"),
        ("electric", "Electric"),
        ("other", "Other"),
    ]
    TRANSMISSION_CHOICES = [("automatic", "Automatic"), ("manual", "Manual"), ("other", "Other")]

    make = models.ForeignKey(CarMake, on_delete=models.CASCADE, related_name="models")
    name = models.CharField(max_length=100)
    year = models.PositiveSmallIntegerField()
    body_style = models.CharField(max_length=20, choices=BODY_STYLE_CHOICES, default="other")
    fuel_type = models.CharField(max_length=20, choices=FUEL_CHOICES, default="gasoline")
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES, default="automatic")
    starting_price = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True)
    image_url = models.URLField(blank=True)
    description = models.TextField(blank=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["make__name", "name", "-year"]
        constraints = [
            models.UniqueConstraint(fields=["make", "name", "year"], name="unique_make_model_year"),
        ]

    def __str__(self):
        return f"{self.year} {self.make.name} {self.name}"
