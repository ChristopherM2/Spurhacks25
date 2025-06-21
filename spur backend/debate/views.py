import os

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from dotenv import load_dotenv
from pymongo import MongoClient
import requests
from urllib.parse import unquote

load_dotenv()
uri = os.getenv("URI")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# Create a new client and connect to the server
client = MongoClient(uri)
print("USING MONGO URI:", uri)

db = client["debatrix_db"]
collection = db["debate_history"]



@csrf_exempt
def create_debate(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            topic = data.get("topic")
            argument = data.get("argument")

            # Call GROQ API
            headers = {
                "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
                "Content-Type": "application/json"
            }

            payload = {
                "model": "llama3-70b-8192",  # ✅ RECOMMENDED replacement
                "messages": [
                    {"role": "system", "content": "You are a debate coach. Give feedback on arguments."},
                    {"role": "user", "content": f"My argument on '{topic}' is: {argument}. What do you think?"}
                ],
                "temperature": 0.7
            }

            groq_res = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload
            )

            try:
                response_data = groq_res.json()
            except Exception as parse_error:
                return JsonResponse({ "error": f"Invalid JSON from GROQ: {groq_res.text}" }, status=500)

            if "choices" not in response_data:
                return JsonResponse({ "error": f"'choices' missing in response: {response_data}" }, status=500)

            ai_response = response_data["choices"][0]["message"]["content"]

            # Save to MongoDB
            collection.insert_one({
                "topic": topic,
                "argument": argument,
                "ai_response": ai_response
            })

            return JsonResponse({ "ai_response": ai_response })

        except Exception as e:
            return JsonResponse({ "error": str(e) }, status=500)

    return JsonResponse({ "error": "Only POST allowed" }, status=405)



from urllib.parse import unquote
from django.http import JsonResponse

def get_debate_history(request):
    if request.method == "GET":
        try:
            topic = request.GET.get("topic")

            if not topic:
                return JsonResponse({"error": "Missing 'topic' parameter."}, status=400)

            topic = unquote(topic).strip()
            query = {"topic": {"$regex": f"^{topic}$", "$options": "i"}}


            records = collection.find(query).sort("topic", -1)

            history = [
                {
                    "topic": record.get("topic"),
                    "argument": record.get("argument"),
                    "ai_response": record.get("ai_response"),
                }
                for record in records
            ]
            return JsonResponse({"history": history})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Only GET allowed"}, status=405)
