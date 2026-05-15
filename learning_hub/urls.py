from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from users.views import AdminStatsView
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/enrollments/', include('enrollments.urls')),
    
    # Admin stats — GET /api/admin/stats/
    path('api/admin/stats/', AdminStatsView.as_view()),
    
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)