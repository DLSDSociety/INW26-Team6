from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .models import CustomUser
from .serializers import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdmin


# ──────────────────────────────────────────────
# AUTH VIEWS
# ──────────────────────────────────────────────

class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created"}, status=201)
        return Response(serializer.errors, status=400)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": user.role,
                "username": user.username,
                "email": user.email,
            })
        return Response({"error": "Invalid credentials"}, status=401)


# ──────────────────────────────────────────────
# PROFILE VIEWS
# ──────────────────────────────────────────────

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "bio": user.bio,
        })


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user

        user.username = request.data.get("username", user.username)
        user.email    = request.data.get("email",    user.email)
        user.bio      = request.data.get("bio",      user.bio)

        if "profile_picture" in request.FILES:
            user.profile_picture = request.FILES["profile_picture"]

        user.save()
        return Response({"message": "Profile updated"})


# ──────────────────────────────────────────────
# ADMIN — USER MANAGEMENT
# ──────────────────────────────────────────────

class AdminOnlyView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response({"message": "Welcome Admin"})


class AllUsersView(APIView):
    """
    GET /api/users/all/
    Admin only — returns every registered user.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        users = CustomUser.objects.all().order_by('-date_joined')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class ChangeUserRoleView(APIView):
    """
    PATCH /api/users/<pk>/role/
    Admin only — change a user's role.
    Body: { "role": "student" | "instructor" | "admin" }
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found."}, status=404)

        new_role = request.data.get("role")
        if new_role not in ["student", "instructor", "admin"]:
            return Response(
                {"detail": "Invalid role. Must be: student, instructor, or admin."},
                status=400
            )

        user.role = new_role
        user.save()
        serializer = UserSerializer(user)
        return Response(serializer.data)


class DeleteUserView(APIView):
    """
    DELETE /api/users/<pk>/
    Admin only — permanently delete any user.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, pk):
        try:
            user = CustomUser.objects.get(pk=pk)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found."}, status=404)

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ──────────────────────────────────────────────
# ADMIN — PLATFORM STATS
# ──────────────────────────────────────────────

class AdminStatsView(APIView):
    """
    GET /api/admin/stats/
    Admin only — returns 6 platform-wide metrics.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        # Import here to avoid circular imports
        from courses.models import Course
        from enrollments.models import Enrollment

        return Response({
            "total_users":        CustomUser.objects.count(),
            "total_students":     CustomUser.objects.filter(role="student").count(),
            "total_instructors":  CustomUser.objects.filter(role="instructor").count(),
            "total_courses":      Course.objects.count(),
            "total_enrollments":  Enrollment.objects.count(),
            "total_completions":  Enrollment.objects.filter(is_completed=True).count(),
        })