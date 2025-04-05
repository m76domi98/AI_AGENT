import requests
from dotenv import load_dotenv
import os

load_dotenv()

url = "http://127.0.0.1:8000/generate"
headers = {
    "x-api-key": os.getenv("API_KEY"),
    "Content-Type": "application/json"
}
data = {"prompt": "Why is the sky blue?"}

response = requests.post(url, headers=headers, json=data)
print(response.json())
