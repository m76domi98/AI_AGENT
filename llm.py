from fastapi import FastAPI, Depends, HTTPException, Header
from pydantic import BaseModel
import ollama
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY_CREDITS = {os.getenv("API_KEY"): 20}
app = FastAPI()

class PromptRequest(BaseModel):
    prompt: str  # JSON body input

def verify_api_key(x_api_key: str = Header(None)):
    credits = API_KEY_CREDITS.get(x_api_key, 0)
    if credits <= 0:
        raise HTTPException(status_code=401, detail="Invalid API Key, or no credits")
    return x_api_key


@app.post("/generate")
def generate(data: PromptRequest, x_api_key: str = Depends(verify_api_key)):
    API_KEY_CREDITS[x_api_key] -= 1
    response = ollama.chat(model="mistral", messages=[{"role": "user", "content": data.prompt}])
    return {"response": response["message"]["content"]}
