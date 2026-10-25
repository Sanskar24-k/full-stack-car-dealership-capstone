from django.contrib import admin
from .models import CarMake, CarModel


class CarModelInline(admin.TabularInline):
    model = CarModel
    extra = 0


@admin.register(CarMake)
class CarMakeAdmin(admin.ModelAdmin):
    list_display = ("name", "country", "founded_year")
    search_fields = ("name", "country")
    inlines = (CarModelInline,)


@admin.register(CarModel)
class CarModelAdmin(admin.ModelAdmin):
    list_display = ("name", "make", "year", "body_style", "fuel_type", "is_available")
    list_filter = ("make", "year", "body_style", "fuel_type", "is_available")
    search_fields = ("name", "make__name")
