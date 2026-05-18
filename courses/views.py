
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from .models import Course, Lesson, CourseMaterial
from .serializers import CourseSerializer, LessonSerializer, CourseMaterialSerializer
from users.permissions import IsInstructor, IsAdmin


# ──────────────────────────────────────────────
# EXISTING VIEWS
# ──────────────────────────────────────────────

class CourseListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseSerializer

    def get_queryset(self):
        return Course.objects.annotate(enrolled_count=Count('enrollments', filter=Q(enrollments__student__role='student')))

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsInstructor()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            # Only instructor (owner) can edit
            return [permissions.IsAuthenticated(), IsInstructor()]
        if self.request.method == 'DELETE':
            # Both instructor (own course) AND admin can delete
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def destroy(self, request, *args, **kwargs):
        course = self.get_object()
        user   = request.user

        # Admin can delete any course
        # Instructor can only delete their own course
        if user.role == 'admin' or (user.role == 'instructor' and course.instructor == user):
            course.delete()
            return Response(
                {"message": "Course deleted successfully"},
                status=status.HTTP_204_NO_CONTENT
            )

        return Response(
            {"detail": "You do not have permission to delete this course."},
            status=status.HTTP_403_FORBIDDEN
        )


class LessonCreateView(generics.CreateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructor]


class LessonMaterialsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, lesson_id):
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found."}, status=status.HTTP_404_NOT_FOUND)

        materials = CourseMaterial.objects.filter(lesson=lesson)
        serializer = CourseMaterialSerializer(materials, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, lesson_id):
        """Upload a material file for a lesson. Instructor only."""
        try:
            lesson = Lesson.objects.select_related('course').get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found."}, status=status.HTTP_404_NOT_FOUND)

        # Only the course owner (instructor) can upload materials
        if request.user.role not in ('instructor', 'admin'):
            return Response({"error": "Only instructors can upload materials."}, status=status.HTTP_403_FORBIDDEN)
        if request.user.role == 'instructor' and lesson.course.instructor != request.user:
            return Response({"error": "You do not own this course."}, status=status.HTTP_403_FORBIDDEN)

        file = request.FILES.get('file')
        material_type = request.data.get('material_type', 'pdf')

        if not file:
            return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        material = CourseMaterial.objects.create(
            lesson=lesson,
            file=file,
            material_type=material_type,
        )
        serializer = CourseMaterialSerializer(material, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ──────────────────────────────────────────────
# INSTRUCTOR VIEWS
# ──────────────────────────────────────────────

class MyCoursesInstructorView(APIView):
    """
    GET /api/courses/my-courses/
    Instructor only — returns only courses belonging to the logged-in instructor.
    """
    permission_classes = [IsAuthenticated, IsInstructor]

    def get(self, request):
        courses = (
            Course.objects
            .filter(instructor=request.user)
            .annotate(enrolled_count=Count('enrollments', filter=Q(enrollments__student__role='student')))
            .prefetch_related('lessons')
        )
        serializer = CourseSerializer(courses, many=True, context={'request': request})
        data = serializer.data

        for item, course in zip(data, courses):
            item['student_count'] = course.enrolled_count

        return Response(data)


class CourseStudentsView(APIView):
    """
    GET /api/courses/<pk>/students/
    Instructor only — lists every student enrolled in a specific course.
    """
    permission_classes = [IsAuthenticated, IsInstructor]

    def get(self, request, pk):
        from enrollments.models import Enrollment

        try:
            course = Course.objects.get(pk=pk, instructor=request.user)
        except Course.DoesNotExist:
            return Response(
                {"detail": "Course not found or you do not own it."},
                status=status.HTTP_404_NOT_FOUND
            )

        enrollments   = Enrollment.objects.filter(course=course, student__role='student').select_related('student')
        total_lessons = course.lessons.count()
        result        = []

        for enroll in enrollments:
            completed = enroll.progress.filter(is_completed=True).count()
            pct       = round((completed / total_lessons) * 100) if total_lessons > 0 else 0
            result.append({
                "id":               enroll.id,
                "student_name":     enroll.student.username,
                "email":            enroll.student.email,
                "enrolled_at":      enroll.enrolled_at,
                "progress_percent": pct,
                "is_completed":     enroll.is_completed,
            })

        return Response(result)