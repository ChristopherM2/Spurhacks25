from django.db import models

class DebateHistory(models.Model):
    topic = models.CharField(max_length=255)
    argument = models.TextField()
    ai_response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


