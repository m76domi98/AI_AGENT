import ollama
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    #edit these to be more specofc
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["*"]
)

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
