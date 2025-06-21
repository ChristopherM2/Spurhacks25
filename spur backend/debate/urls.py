from django.urls import path
from .views import get_debate_history, create_debate

urlpatterns = [
    #path('', debate_view, name='debate'),
    path('submit/', create_debate),         # POST to /debate/submit/
    path('history/', get_debate_history),   # GET to /debate/history/
]