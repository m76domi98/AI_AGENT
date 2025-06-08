#embedding our documents and looking them up - vectorizing documents
#vector search - search for relevant information in local database & task to model
from langchain.embeddings import OllamaEmbeddings
from langchain.vectorstores import Chroma
from langchain.schema import Document
import os
import pandas as pd

# Load your data
df = pd.read_csv("realistic_restaurant_reviews.csv")

# Initialize the embedding model
embeddings = OllamaEmbeddings(model="mxbai-embed-large")

# Check if the database exists; if not, set flag to add documents
db_location = "./chroma_langchain_db"
add_documents = not os.path.exists(db_location)

# If the database doesn't exist, create it
if add_documents:
    documents = []
    ids = []

    for i, row in df.iterrows():
        # Ensure column names match your CSV and inspect them before running
        document = Document(
            page_content=row["Title"] + " " + row["Review"],
            metadata={"rating": row["Rating"], "date": row["Date"]},
            id=str(i)
        )
        ids.append(str(i))
        documents.append(document)

    # Initialize the Chroma vector store
    vector_store = Chroma.from_documents(
        documents=documents,
        embedding=embeddings,
        persist_directory=db_location
    )

    # Persist the database
    vector_store.persist()

else:
    # If the database already exists, load it
    vector_store = Chroma(persist_directory=db_location, embedding_function=embeddings)

# Create a retriever for querying
retriever = vector_store.as_retriever(search_kwargs={"k": 5})
