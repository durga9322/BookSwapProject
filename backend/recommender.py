import pickle
import numpy as np
import os

BASE = os.path.dirname(os.path.abspath(__file__))

try:
    popular_df        = pickle.load(open(os.path.join(BASE, "popular.pkl"), "rb"))
    pt                = pickle.load(open(os.path.join(BASE, "pt.pkl"), "rb"))
    books             = pickle.load(open(os.path.join(BASE, "books.pkl"), "rb"))
    similarity_scores = pickle.load(open(os.path.join(BASE, "similarity_scores.pkl"), "rb"))
    MODEL_LOADED = True
    print("ML Model loaded successfully")
except Exception as e:
    MODEL_LOADED = False
    print(f"Model load failed: {e}")

def get_recommendations(book_name, top_n=4):
    if not MODEL_LOADED:
        return []
    try:
        index = np.where(pt.index == book_name)[0][0]
    except IndexError:
        return []
    similar_items = sorted(
        list(enumerate(similarity_scores[index])),
        key=lambda x: x[1], reverse=True
    )[1:top_n+1]
    data = []
    for i in similar_items:
        temp_df = books[books["Book-Title"] == pt.index[i[0]]]
        temp_df = temp_df.drop_duplicates("Book-Title")
        for _, row in temp_df.iterrows():
            data.append({
                "title":  row["Book-Title"],
                "author": row["Book-Author"],
                "image":  row.get("Image-URL-M", ""),
            })
    return data

def get_popular_books():
    if not MODEL_LOADED:
        return []
    result = []
    for _, row in popular_df.iterrows():
        result.append({
            "title":       row["Book-Title"],
            "author":      row["Book-Author"],
            "image":       row.get("Image-URL-M", ""),
            "num_ratings": int(row["num_ratings"]),
            "avg_rating":  round(float(row["avg_rating"]), 2),
        })
    return result

def search_titles(query, top_n=8):
    if not MODEL_LOADED:
        return []
    query = query.lower()
    return [t for t in pt.index if query in t.lower()][:top_n]
