
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
    #edit these to be more specofc
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["*"]
)

@app.post("/summarize")
async def summarize(request: Request):
    summarize_data = await request.json()
    
    prompt = f"""
The following text contains the terms and conditions of an application:
{summarize_data["selectedText"]}

Please identify and highlight the most important and potentially concerning clauses. 
Focus especially on any red flags, such as data sharing without consent, permissions to access personal information, or risks of data leaks. 
Summarize these points clearly so the user can easily understand any critical or questionable parts of the agreement.
     """

    response = ollama.generate(
        model="llama3", 
        prompt=prompt,
        options={'temperature': 0.7}
    )

    summary_text = response.get("response", "No summary returned")

    return {"response": summary_text}
<<<<<<< HEAD

chat_history = []

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    user_message = data.get("message", "")

    chat_history.append({"role": "user", "message": user_message})

    if len(chat_history) > 4:
        chat_history.pop(0)

    prompt = ""
    for entry in chat_history:
        role = "User" if entry["role"] == "user" else "Assistant"
        prompt += f"{role}: {entry['message']}\n"

    prompt += "Assistant:"

    response = ollama.generate(
        model="llama3", 
        prompt=prompt,
        options={'temperature': 0.7}
    )

    chat_response = response.get("response", "Sorry, I couldn't understand that.")
    
    chat_history.append({"role": "assistant", "message": chat_response})

    return {"response": chat_response}
=======
main
>>>>>>> 58c8c93b43fbe5fb416ad4d9f3b1fd158d9ee20e
