from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

admin.site.site_header = "Online Learning Platform Admin"
admin.site.site_title = "OLP Admin Portal"
admin.site.index_title = "Welcome to Admin Dashboard"
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'role', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Role & Profile', {'fields': ('role', 'bio', 'profile_picture')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)