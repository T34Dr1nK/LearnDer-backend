import json

def save_chunks(book_id, chunks, output_path="output.json"):
    data = {
        "book_id": book_id,
        "chunks": chunks
    }
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"[✅] Saved {len(chunks)} chunks to {output_path}")
