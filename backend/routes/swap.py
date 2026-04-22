from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import pymysql
import json
from config import Config

swap_bp = Blueprint("swap", __name__)

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

@swap_bp.route("/request", methods=["POST"])
@jwt_required()
def request_swap():
    user    = get_user()
    data    = request.get_json()
    book_id = data.get("book_id")
    message = data.get("message", "")
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute("SELECT user_id FROM books WHERE id=%s", (book_id,))
        book = cur.fetchone()
        if not book:
            conn.close()
            return jsonify({"error": "Book not found"}), 404
        owner_id = book["user_id"]
        if owner_id == user["id"]:
            conn.close()
            return jsonify({"error": "Cannot request your own book"}), 400
        cur.execute(
            "INSERT INTO swap_requests (requester_id,owner_id,book_id,message) VALUES (%s,%s,%s,%s)",
            (user["id"], owner_id, book_id, message)
        )
        cur.execute(
            "INSERT INTO notifications (user_id,message) VALUES (%s,%s)",
            (owner_id, "New swap request from " + user["name"] + "!")
        )
    conn.commit()
    conn.close()
    return jsonify({"message": "Swap request sent!"}), 201

@swap_bp.route("/my-requests", methods=["GET"])
@jwt_required()
def my_requests():
    user = get_user()
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute("""
            SELECT sr.*,b.title as book_title,u.name as requester_name,u.email as requester_email,u.city as requester_city
            FROM swap_requests sr
            JOIN books b ON sr.book_id=b.id
            JOIN users u ON sr.requester_id=u.id
            WHERE sr.owner_id=%s ORDER BY sr.created_at DESC
        """, (user["id"],))
        result = cur.fetchall()
    conn.close()
    return jsonify({"requests": result}), 200

@swap_bp.route("/respond/<int:req_id>", methods=["PUT"])
@jwt_required()
def respond(req_id):
    user   = get_user()
    status = request.get_json().get("status")
    if status not in ("Accepted", "Rejected"):
        return jsonify({"error": "Invalid status"}), 400
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE swap_requests SET status=%s WHERE id=%s AND owner_id=%s",
            (status, req_id, user["id"])
        )
        if status == "Accepted":
            cur.execute("""
                SELECT u.name, u.email, b.title
                FROM swap_requests sr
                JOIN users u ON sr.requester_id=u.id
                JOIN books b ON sr.book_id=b.id
                WHERE sr.id=%s
            """, (req_id,))
            info = cur.fetchone()
            if info:
                cur.execute(
                    "INSERT INTO notifications (user_id,message) VALUES (%s,%s)",
                    (user["id"], "You accepted swap with " + info["name"] + " for " + info["title"] + ". Contact: " + info["email"])
                )
    conn.commit()
    conn.close()
    return jsonify({"message": "Request " + status}), 200

@swap_bp.route("/delete-book/<int:book_id>", methods=["DELETE"])
@jwt_required()
def delete_book(book_id):
    user = get_user()
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute("SELECT user_id FROM books WHERE id=%s", (book_id,))
        book = cur.fetchone()
        if not book:
            conn.close()
            return jsonify({"error": "Book not found"}), 404
        if book["user_id"] != user["id"]:
            conn.close()
            return jsonify({"error": "Not your book"}), 403
        cur.execute("DELETE FROM swap_requests WHERE book_id=%s", (book_id,))
        cur.execute("DELETE FROM books WHERE id=%s", (book_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Book deleted"}), 200

@swap_bp.route("/notifications", methods=["GET"])
@jwt_required()
def notifications():
    user = get_user()
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute(
            "SELECT * FROM notifications WHERE user_id=%s ORDER BY created_at DESC LIMIT 20",
            (user["id"],)
        )
        result = cur.fetchall()
    conn.close()
    return jsonify({"notifications": result}), 200
