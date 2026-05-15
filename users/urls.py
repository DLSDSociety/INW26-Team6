
from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    ProfileView,
    UpdateProfileView,
    AdminOnlyView,
    AllUsersView,
    ChangeUserRoleView,
    DeleteUserView,
)

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────
    path('register/',        RegisterView.as_view()),         # POST  — public
    path('login/',           LoginView.as_view()),            # POST  — public
    path('profile/',         ProfileView.as_view()),          # GET   — authenticated
    path('profile/update/',  UpdateProfileView.as_view()),    # PATCH — authenticated

    # ── Admin: user management ─────────────────────────────────
    path('all/',             AllUsersView.as_view()),         # GET    /api/users/all/
    path('<int:pk>/role/',   ChangeUserRoleView.as_view()),   # PATCH  /api/users/<pk>/role/
    path('<int:pk>/',        DeleteUserView.as_view()),       # DELETE /api/users/<pk>/

    # ── Admin only test ────────────────────────────────────────
    path('admin-only/',      AdminOnlyView.as_view()),        # GET   — admin only
]
