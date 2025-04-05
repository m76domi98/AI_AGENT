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
