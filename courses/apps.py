# from django.db import models
# from users.models import CustomUser


# class Course(models.Model):
#     title = models.CharField(max_length=255)
#     description = models.TextField()
#     instructor = models.ForeignKey(
#         CustomUser,
#         on_delete=models.CASCADE,
#         limit_choices_to={'role': 'instructor'}
#     )
#     category = models.CharField(max_length=100)
#     thumbnail = models.ImageField(upload_to='course_thumbnails/', blank=True, null=True)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.title


# class Lesson(models.Model):
#     course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
#     title = models.CharField(max_length=255)
#     video_file = models.FileField(upload_to='lesson_videos/', blank=True, null=True)
#     order_number = models.IntegerField()
#     duration = models.CharField(max_length=50)

#     def __str__(self):
#         return f"{self.course.title} - {self.title}"


# class CourseMaterial(models.Model):
#     MATERIAL_CHOICES = (
#         ('pdf', 'PDF'),
#         ('doc', 'Document'),
#         ('video', 'Video'),
#     )

#     lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='materials')
#     file = models.FileField(upload_to='course_materials/')
#     material_type = models.CharField(max_length=20, choices=MATERIAL_CHOICES)

#     def __str__(self):
#         return f"{self.lesson.title} - {self.material_type}"

from django.apps import AppConfig


class CoursesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'courses'