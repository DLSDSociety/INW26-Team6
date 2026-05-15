from rest_framework import serializers
from .models import Enrollment, Progress


class ProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model = Progress
        fields = ['id', 'lesson', 'lesson_title', 'is_completed', 'completed_at']


class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_thumbnail = serializers.ImageField(source='course.thumbnail', read_only=True)
    progress = ProgressSerializer(many=True, read_only=True)
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'course_title', 'course_thumbnail',
                  'enrolled_at', 'is_completed', 'progress', 'progress_percent']

    def get_progress_percent(self, obj):
        total = obj.course.lessons.count()
        if total == 0:
            return 0
        completed = obj.progress.filter(is_completed=True).count()
        return round((completed / total) * 100)