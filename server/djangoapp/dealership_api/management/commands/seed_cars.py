from django.core.management.base import BaseCommand
from dealership_api.models import CarMake, CarModel


SEED_CARS = {
    "Toyota": {
        "country": "Japan", "founded_year": 1937,
        "models": [
            ("Camry", 2025, "sedan", "hybrid", "A comfortable midsize sedan with available hybrid efficiency."),
            ("RAV4", 2025, "suv", "hybrid", "A versatile compact SUV for everyday errands and long weekends."),
        ],
    },
    "Honda": {
        "country": "Japan", "founded_year": 1948,
        "models": [
            ("Accord", 2025, "sedan", "hybrid", "A refined sedan with a spacious cabin and available hybrid power."),
            ("CR-V", 2025, "suv", "hybrid", "A practical SUV with thoughtful storage and available hybrid efficiency."),
        ],
    },
    "Ford": {
        "country": "United States", "founded_year": 1903,
        "models": [
            ("F-150", 2025, "truck", "gasoline", "A full-size pickup designed for work, towing, and daily driving."),
            ("Mustang Mach-E", 2025, "suv", "electric", "An all-electric SUV with quick acceleration and useful range."),
        ],
    },
    "Subaru": {
        "country": "Japan", "founded_year": 1953,
        "models": [
            ("Outback", 2025, "suv", "gasoline", "A road-trip-ready wagon with standard all-wheel drive."),
        ],
    },
}


class Command(BaseCommand):
    help = "Add a small, repeatable set of makes and models for local development."

    def handle(self, *args, **options):
        count = 0
        for make_name, details in SEED_CARS.items():
            make, _ = CarMake.objects.update_or_create(
                name=make_name,
                defaults={key: value for key, value in details.items() if key != "models"},
            )
            for model_name, year, body_style, fuel_type, description in details["models"]:
                CarModel.objects.update_or_create(
                    make=make,
                    name=model_name,
                    year=year,
                    defaults={
                        "body_style": body_style,
                        "fuel_type": fuel_type,
                        "transmission": "automatic",
                        "description": description,
                        "is_available": True,
                    },
                )
                count += 1
        self.stdout.write(self.style.SUCCESS(f"Loaded {len(SEED_CARS)} makes and {count} models."))
