
from django.urls import path
from .views import (
    EnrollView,
    MyCoursesView,
    MarkLessonCompleteView,
    AllEnrollmentsView,
)

urlpatterns = [
    # ── Existing ───────────────────────────────────────────────
    path('enroll/',           EnrollView.as_view()),             # POST  — authenticated
    path('my-courses/',       MyCoursesView.as_view()),          # GET   — authenticated
    path('complete-lesson/',  MarkLessonCompleteView.as_view()), # PATCH — authenticated

    # ── New: Admin dashboard ────────────────────────────────────
    path('all/',              AllEnrollmentsView.as_view()),     # GET   /api/enrollments/all/
]