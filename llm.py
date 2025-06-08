from fastapi import FastAPI, Request, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY_CREDITS = {os.getenv("API_KEY"): 20}
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/summarize")
async def summarize(request: Request):
    summarize_data = await request.json()

    prompt = f"""
    Summarize the following text into less than 30 words:
    {summarize_data["selectedText"]}
    """

    response = ollama.generate(
        model="llama3", 
        prompt=prompt,
        options={'temperature': 0.7}
    )

    summary_text = response.get("response", "No summary returned")

    return {"response": summary_text}
