from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import pymysql
import json
from config import Config

books_bp = Blueprint("books", __name__)

def get_conn():
    return pymysql.connect(
        host=Config.MYSQL_HOST,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        database=Config.MYSQL_DB,
        cursorclass=pymysql.cursors.DictCursor
    )

def get_user():
    return json.loads(get_jwt_identity())

@books_bp.route("/", methods=["GET"])
def get_all_books():
    city    = request.args.get("city", "")
    pincode = request.args.get("pincode", "")
    genre   = request.args.get("genre", "")
    query   = "SELECT b.*,u.name as owner_name FROM books b JOIN users u ON b.user_id=u.id WHERE b.is_available=1"
    params  = []
    if city:    query += " AND b.city=%s";    params.append(city)
    if pincode: query += " AND b.pincode=%s"; params.append(pincode)
    if genre:   query += " AND b.genre=%s";   params.append(genre)
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute(query, params)
        result = cur.fetchall()
    conn.close()
    return jsonify({"books": result}), 200

@books_bp.route("/add", methods=["POST"])
@jwt_required()
def add_book():
    user = get_user()
    data = request.get_json()
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO books (user_id,title,author,genre,`condition`,city,pincode,image_url) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
            (user["id"], data.get("title"), data.get("author"), data.get("genre"),
             data.get("condition","Good"), data.get("city",""), data.get("pincode",""),
             data.get("image_url",""))
        )
    conn.commit()
    conn.close()
    return jsonify({"message": "Book added"}), 201

@books_bp.route("/my", methods=["GET"])
@jwt_required()
def my_books():
    user = get_user()
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM books WHERE user_id=%s", (user["id"],))
        result = cur.fetchall()
    conn.close()
    return jsonify({"books": result}), 200
