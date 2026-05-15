# from rest_framework import serializers
# from .models import CustomUser


# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = CustomUser
#         fields = ['id', 'username', 'email', 'role', 'password']
#         extra_kwargs = {'password': {'write_only': True}}

#     def create(self, validated_data):
#         user = CustomUser.objects.create_user(**validated_data)
#         return user


from rest_framework import serializers
from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'role',
            'bio',
            'profile_picture',
            'password',
        ]
        extra_kwargs = {
            'password':        {'write_only': True},  # never returned in responses
            'bio':             {'required': False},    # optional on register
            'profile_picture': {'required': False},    # optional on register
            'role':            {'required': False},    # defaults to 'student' in model
        }

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user