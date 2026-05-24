from django.urls import path
from .views import (
    CourseListCreateView,
    CourseDetailView,
    LessonCreateView,
    LessonMaterialsView,
    MyCoursesInstructorView,
    CourseStudentsView,
)

urlpatterns = [
    # ── Existing ───────────────────────────────────────────────
    path('', CourseListCreateView.as_view()),                      # GET (public) / POST (instructor)
    path('<int:pk>/', CourseDetailView.as_view()),                 # GET / PUT / DELETE
    path('lessons/create/', LessonCreateView.as_view()),          # POST (instructor)
    path('lessons/<int:lesson_id>/materials/', LessonMaterialsView.as_view()),  # GET (authenticated)

    # ── New: Instructor dashboard ───────────────────────────────
    path('my-courses/', MyCoursesInstructorView.as_view()),       # GET /api/courses/my-courses/
    path('<int:pk>/students/', CourseStudentsView.as_view()),      # GET /api/courses/<pk>/students/
]