
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama.llms import OllamaLLM
from vector import retriever

# Initialize OllamaLLM model
model = OllamaLLM(model="llama3.2")

# Define the prompt template
template = """
You are an expert in answering questions about a Wikipedia article about Mayan civilization.

Here are some relevant reviews: {reviews}

Here is the question to answer: {question}
"""

# Create the prompt using the template
prompt = ChatPromptTemplate.from_template(template)

# Construct the chain (using LLMChain for this case)
chain = prompt | model

while True:
    print("\n\n-------------------------------------------")
    question = input("Ask your question (q to quit): ")
    print("\n\n")
    if question == "q":
        break

    reviews = retriever.invoke(question)
    result = chain.invoke({"reviews": reviews, "question": question})
    print(result)

import ollama
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
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
main
