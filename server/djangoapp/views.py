import json
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_http_methods

from dealership_api.models import CarMake

User = get_user_model()


def request_data(request):
    if request.content_type and "application/json" in request.content_type:
        try:
            payload = json.loads(request.body or "{}")
        except (json.JSONDecodeError, UnicodeDecodeError):
            return None, JsonResponse({"error": "Request body must be valid JSON."}, status=400)
        if not isinstance(payload, dict):
            return None, JsonResponse({"error": "Request body must be a JSON object."}, status=400)
        return payload, None
    return request.POST.dict(), None


def user_payload(user):
    return {
        "id": user.pk,
        "username": user.get_username(),
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
    }


@require_GET
@ensure_csrf_cookie
def csrf_cookie(request):
    return JsonResponse({"csrfToken": get_token(request)})


@require_http_methods(["POST"])
def register(request):
    data, error = request_data(request)
    if error:
        return error
    required = ["username", "first_name", "last_name", "email", "password"]
    errors = {field: "This field is required." for field in required if not str(data.get(field, "")).strip()}
    username = str(data.get("username", "")).strip()
    first_name = str(data.get("first_name", "")).strip()
    last_name = str(data.get("last_name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if username and len(username) < 3:
        errors["username"] = "Username must contain at least 3 characters."
    if email:
        try:
            validate_email(email)
        except ValidationError:
            errors["email"] = "Enter a valid email address."
    if email and User.objects.filter(email__iexact=email).exists():
        errors["email"] = "An account with this email already exists."
    if username and User.objects.filter(username__iexact=username).exists():
        errors["username"] = "That username is already taken."

    if password:
        candidate = User(username=username, first_name=first_name, last_name=last_name, email=email)
        try:
            validate_password(password, user=candidate)
        except ValidationError as exc:
            errors["password"] = list(exc.messages)

    if errors:
        return JsonResponse({"error": "Please correct the highlighted fields.", "errors": errors}, status=400)

    try:
        user = User.objects.create_user(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password,
        )
    except IntegrityError:
        return JsonResponse({"error": "An account with these details already exists."}, status=409)

    login(request, user)
    return JsonResponse({"message": "Account created successfully.", "user": user_payload(user)}, status=201)


@require_http_methods(["POST"])
def user_login(request):
    data, error = request_data(request)
    if error:
        return error
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", ""))
    if not username or not password:
        return JsonResponse({"error": "Username and password are required."}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is None and "@" in username:
        match = User.objects.filter(email__iexact=username).first()
        if match:
            user = authenticate(request, username=match.get_username(), password=password)
    if user is None:
        return JsonResponse({"error": "The username or password is incorrect."}, status=401)

    login(request, user)
    return JsonResponse({"message": "Login successful.", "user": user_payload(user)})


@require_http_methods(["POST"])
def user_logout(request):
    logout(request)
    return JsonResponse({"message": "Logout successful."})


@require_GET
def get_cars(_request):
    models = CarMake.objects.prefetch_related("models").all()
    car_models = [
        {"CarModel": model.name, "CarMake": make.name}
        for make in models
        for model in make.models.all()
    ]
    return JsonResponse({"CarModels": car_models})


def proxy_get(base_url, path):
    url = f"{base_url}{path}"
    upstream = Request(url, headers={"Accept": "application/json"}, method="GET")
    try:
        with urlopen(upstream, timeout=5) as response:
            payload = json.loads(response.read().decode("utf-8"))
            return JsonResponse(payload, status=response.status, safe=not isinstance(payload, list))
    except HTTPError as exc:
        try:
            payload = json.loads(exc.read().decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            payload = {"error": "Upstream service returned an error."}
        return JsonResponse(payload, status=exc.code, safe=not isinstance(payload, list))
    except (URLError, TimeoutError, json.JSONDecodeError, UnicodeDecodeError) as exc:
        return JsonResponse(
            {"error": "Upstream service is unavailable.", "detail": str(exc)},
            status=502,
        )


@require_GET
def dealers(request):
    return proxy_get(settings.DEALER_SERVICE_URL, "/dealers")


@require_GET
def dealer_detail(_request, dealer_id):
    return proxy_get(settings.DEALER_SERVICE_URL, f"/dealers/{quote(dealer_id, safe='')}")


@require_GET
def dealers_by_state(_request, state):
    return proxy_get(settings.DEALER_SERVICE_URL, f"/dealers/state/{quote(state, safe='')}")


@require_http_methods(["GET", "POST"])
def dealer_reviews(request, dealer_id):
    path = f"/dealers/{quote(dealer_id, safe='')}/reviews"
    if request.method == "GET":
        return proxy_get(settings.DEALER_SERVICE_URL, path)
    data, error = request_data(request)
    if error:
        return error
    upstream = Request(
        f"{settings.DEALER_SERVICE_URL}{path}",
        data=json.dumps(data).encode("utf-8"),
        headers={"Accept": "application/json", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(upstream, timeout=5) as response:
            payload = json.loads(response.read().decode("utf-8"))
            return JsonResponse(payload, status=response.status)
    except HTTPError as exc:
        try:
            payload = json.loads(exc.read().decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            payload = {"error": "Upstream service returned an error."}
        return JsonResponse(payload, status=exc.code)
    except (URLError, TimeoutError) as exc:
        return JsonResponse({"error": "Upstream service is unavailable.", "detail": str(exc)}, status=502)


@require_GET
def analyze_sentiment(_request, text):
    encoded_text = quote(text, safe="")
    return proxy_get(settings.SENTIMENT_SERVICE_URL, f"/analyze/{encoded_text}")

