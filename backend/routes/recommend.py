from flask import Blueprint, request, jsonify
from recommender import get_recommendations, get_popular_books, search_titles

recommend_bp = Blueprint("recommend", __name__)

@recommend_bp.route("/popular", methods=["GET"])
def popular():
    books = get_popular_books()
    return jsonify({"books": books}), 200

@recommend_bp.route("/by-book", methods=["GET", "POST"])
def recommend_by_book():
    if request.method == "POST":
        data = request.get_json() or {}
        title = data.get("title", "").strip()
    else:
        title = request.args.get("title", "").strip()

    if not title:
        return jsonify({"error": "title is required"}), 400

    recs = get_recommendations(title)
    if not recs:
        return jsonify({"message": "Book not found in model. Try: 1984, Harry Potter, The Da Vinci Code", "recommendations": []}), 200
    return jsonify({"recommendations": recs}), 200

@recommend_bp.route("/search", methods=["GET"])
def search():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"suggestions": []}), 200
    return jsonify({"suggestions": search_titles(q)}), 200
