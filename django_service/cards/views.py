from rest_framework import mixins, status, viewsets
from rest_framework.response import Response
from accounts.permissions import CardRolePermission

from .models import Card
from .serializers import CardCreateSerializer, CardSerializer


class CardViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, mixins.DestroyModelMixin, viewsets.GenericViewSet):
    permission_classes = [CardRolePermission]
    pagination_class = None

    def get_queryset(self):
        return Card.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        return CardCreateSerializer if self.action == "create" else CardSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        card = serializer.save()
        return Response(CardSerializer(card).data, status=status.HTTP_201_CREATED)
