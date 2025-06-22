# main.py
from extract_text import extract_text_from_pdf
from chunker import chunk_text
from embedder import get_embedding
from vector_store import save_chunks
import json

book_path = "textbook_processor/18347-กิจกรรมคณิตศาสตร์การเงินม.ปลาย.pdf"
book_id = "sample01-01"
pages = extract_text_from_pdf(book_path)

all_chunks = []

for page in pages:
    chunks = chunk_text(page['text'])
    for i, chunk in enumerate(chunks):
        all_chunks.append({
            "chunk_id": f"{book_id}-p{page['page_number']}-c{i}",
            "text": chunk,
            "page": page['page_number'],
            "embedding": get_embedding(chunk)
        })

save_chunks(book_id, all_chunks)

print(f"[✅] Processing complete. {len(all_chunks)} chunks generated for book: {book_id}")
print("[📄] Sample chunk preview:")
print(json.dumps(all_chunks[0], indent=2, ensure_ascii=False))
