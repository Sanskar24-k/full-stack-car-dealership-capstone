from django.urls import path
from . import views

urlpatterns = [
    path("csrf", views.csrf_cookie, name="csrf-cookie"),
    path("register", views.register, name="register"),
    path("login", views.user_login, name="login"),
    path("logout", views.user_logout, name="logout"),
    path("get_cars", views.get_cars, name="get-cars"),
    path("dealers", views.dealers, name="dealers"),
    path("dealers/state/<str:state>", views.dealers_by_state, name="dealers-by-state"),
    path("dealers/<str:dealer_id>/reviews", views.dealer_reviews, name="dealer-reviews"),
    path("dealers/<str:dealer_id>", views.dealer_detail, name="dealer-detail"),
    path("analyze/<path:text>", views.analyze_sentiment, name="analyze-sentiment"),
]



