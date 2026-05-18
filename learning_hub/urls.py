from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from users.views import AdminStatsView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/enrollments/', include('enrollments.urls')),
    path('api/assessments/', include('assessments.urls')),

    # JWT token refresh — used by api.js interceptor
    path('api/token/refresh/', TokenRefreshView.as_view()),

    # Admin stats — GET /api/admin/stats/
    path('api/admin/stats/', AdminStatsView.as_view()),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)