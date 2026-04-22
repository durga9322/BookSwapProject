from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity
import bcrypt
import pymysql
import json
from config import Config

auth_bp = Blueprint("auth", __name__)

def get_conn():
    return pymysql.connect(
        host=Config.MYSQL_HOST,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        database=Config.MYSQL_DB,
        cursorclass=pymysql.cursors.DictCursor
    )

@auth_bp.route("/register", methods=["POST"])
def register():
    data     = request.get_json()
    name     = data.get("name", "").strip()
    email    = data.get("email", "").strip()
    password = data.get("password", "")
    city     = data.get("city", "")
    pincode  = data.get("pincode", "")

    if not name or not email or not password:
        return jsonify({"error": "name, email and password are required"}), 400

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO users (name,email,password,city,pincode) VALUES (%s,%s,%s,%s,%s)",
                (name, email, hashed, city, pincode)
            )
        conn.commit()
        conn.close()
        return jsonify({"message": "Registered successfully"}), 201
    except pymysql.err.IntegrityError:
        return jsonify({"error": "Email already registered"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    data     = request.get_json()
    email    = data.get("email", "").strip()
    password = data.get("password", "")

    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users WHERE email=%s", (email,))
            user = cur.fetchone()
        conn.close()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    if not user or not bcrypt.checkpw(password.encode(), user["password"].encode()):
        return jsonify({"error": "Invalid email or password"}), 401

    identity = json.dumps({"id": user["id"], "name": user["name"]})
    token = create_access_token(identity=identity)
    return jsonify({
        "token": token,
        "user": {"id": user["id"], "name": user["name"], "email": user["email"]}
    }), 200
