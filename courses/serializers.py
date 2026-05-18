from rest_framework import serializers
from .models import Course, Lesson, CourseMaterial


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Lesson
        fields = '__all__'


class CourseSerializer(serializers.ModelSerializer):
    lessons       = LessonSerializer(many=True, read_only=True)
    enrolled_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model  = Course
        fields = '__all__'
        extra_kwargs = {
            'instructor': {'read_only': True},   # ← FIX: set by request.user, not by form
            'created_at': {'read_only': True},
        }


class CourseMaterialSerializer(serializers.ModelSerializer):
    file_url  = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()

    class Meta:
        model  = CourseMaterial
        fields = ['id', 'lesson', 'file', 'material_type', 'file_url', 'file_name', 'file_size']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_file_name(self, obj):
        if obj.file:
            return obj.file.name.split('/')[-1]
        return None

    def get_file_size(self, obj):
        try:
            if obj.file:
                return obj.file.size
        except Exception:
            pass
        return None