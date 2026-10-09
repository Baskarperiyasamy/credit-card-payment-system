from django.urls import path
from .views import AnalyticsView, AnalyticsExportView
urlpatterns = [path("", AnalyticsView.as_view(), name="analytics"), path("export/", AnalyticsExportView.as_view(), name="analytics-export")]
