from rest_framework import generics

from accounts.permissions import TransactionRolePermission
from .filters import apply_filters
from .models import Transaction
from .serializers import TransactionSerializer


class TransactionListView(generics.ListAPIView):
    permission_classes = [TransactionRolePermission]
    """Transaction history of the logged-in user. Filters: date_from, date_to, min_amount, max_amount, status."""

    serializer_class = TransactionSerializer

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user).select_related("user")
        return apply_filters(queryset, self.request.query_params)


class TransactionDetailView(generics.RetrieveAPIView):
    permission_classes = [TransactionRolePermission]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).select_related("user")
