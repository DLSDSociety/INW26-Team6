from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Enrollment, Progress
from .serializers import EnrollmentSerializer
from courses.models import Course, Lesson
from users.permissions import IsAdmin


# ──────────────────────────────────────────────
# EXISTING VIEWS (unchanged)
# ──────────────────────────────────────────────

class EnrollView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        course_id = request.data.get('course_id')
        if not course_id:
            return Response({'error': 'course_id is required'}, status=400)

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)

        if Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response({'error': 'Already enrolled in this course'}, status=400)

        enrollment = Enrollment.objects.create(student=request.user, course=course)

        lessons = Lesson.objects.filter(course=course)
        for lesson in lessons:
            Progress.objects.create(enrollment=enrollment, lesson=lesson)

        return Response({'message': 'Enrolled successfully'}, status=201)


class MyCoursesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        enrollments = Enrollment.objects.filter(
            student=request.user
        ).select_related('course')
        serializer = EnrollmentSerializer(enrollments, many=True, context={'request': request})
        return Response(serializer.data)


class MarkLessonCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        lesson_id = request.data.get('lesson_id')
        if not lesson_id:
            return Response({'error': 'lesson_id is required'}, status=400)

        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({'error': 'Lesson not found'}, status=404)

        try:
            enrollment = Enrollment.objects.get(student=request.user, course=lesson.course)
        except Enrollment.DoesNotExist:
            return Response({'error': 'Not enrolled in this course'}, status=400)

        progress, _ = Progress.objects.get_or_create(enrollment=enrollment, lesson=lesson)
        progress.is_completed = True
        progress.completed_at = timezone.now()
        progress.save()

        total = lesson.course.lessons.count()
        completed = enrollment.progress.filter(is_completed=True).count()
        if total == completed:
            enrollment.is_completed = True
            enrollment.save()

        return Response({
            'message': 'Lesson marked complete',
            'progress_percent': round((completed / total) * 100)
        })


# ──────────────────────────────────────────────
# ADMIN VIEW
# ──────────────────────────────────────────────

class AllEnrollmentsView(APIView):
    """
    GET /api/enrollments/all/
    Admin only — returns every enrollment on the platform with
    student name, course title, progress % and completion status.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        enrollments = (
            Enrollment.objects
            .select_related('student', 'course')
            .filter(student__role='student')
            .order_by('-enrolled_at')
        )

        result = []
        for enroll in enrollments:
            total_lessons   = enroll.course.lessons.count()
            completed_count = enroll.progress.filter(is_completed=True).count()
            progress_pct    = (
                round((completed_count / total_lessons) * 100)
                if total_lessons > 0 else 0
            )
            result.append({
                "id":               enroll.id,
                "student_name":     enroll.student.username,
                "email":            enroll.student.email,
                "course_title":     enroll.course.title,
                "enrolled_at":      enroll.enrolled_at,
                "progress_percent": progress_pct,
                "is_completed":     enroll.is_completed,
            })

        return Response(result)