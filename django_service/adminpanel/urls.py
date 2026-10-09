from django.urls import path

from .views import (
    AdminCardDetail, AdminCardList, AdminLogList, AdminTransactionList, AdminUserDetail,
    AdminUserList, DailySummaryView, TransactionExportView, AnalyticsView, SystemHealthView, AnalyticsExportView, FraudLogList,
)

urlpatterns = [
    path("users/", AdminUserList.as_view(), name="admin-users"),
    path("users/<int:pk>/", AdminUserDetail.as_view(), name="admin-user-detail"),
    path("cards/", AdminCardList.as_view(), name="admin-cards"),
    path("cards/<int:pk>/", AdminCardDetail.as_view(), name="admin-card-detail"),
    path("transactions/", AdminTransactionList.as_view(), name="admin-transactions"),
    path("transactions/export/", TransactionExportView.as_view(), name="admin-transactions-export"),
    path("summary/", DailySummaryView.as_view(), name="admin-summary"),
    path("logs/", AdminLogList.as_view(), name="admin-logs"),
    path("analytics/", AnalyticsView.as_view(), name="analytics"),
    path("analytics/export/", AnalyticsExportView.as_view(), name="analytics-export"),
    path("health/", SystemHealthView.as_view(), name="system-health"),
    path("fraud-logs/", FraudLogList.as_view(), name="fraud-logs"),
]
