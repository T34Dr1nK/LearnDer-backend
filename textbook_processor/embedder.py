# embedder.py
"""
import openai
from dotenv import load_dotenv
import os

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def get_embedding(text):
    response = openai.Embedding.create(
        model="text-embedding-ada-002",
        input=text
    )
    return response['data'][0]['embedding']
"""

# embedder.py
from sentence_transformers import SentenceTransformer

# Load once globally
model = SentenceTransformer("intfloat/e5-small-v2")

def get_embedding(text):
    # Format required by E5: prefix with "passage: " for passages
    formatted_text = f"passage: {text}"
    embedding = model.encode(formatted_text, convert_to_numpy=True)
    return embedding.tolist()
