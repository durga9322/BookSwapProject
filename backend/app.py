from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"

CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
JWTManager(app)

from routes.auth import auth_bp
from routes.books import books_bp
from routes.recommend import recommend_bp
from routes.swap import swap_bp

app.register_blueprint(auth_bp,      url_prefix="/api/auth")
app.register_blueprint(books_bp,     url_prefix="/api/books")
app.register_blueprint(recommend_bp, url_prefix="/api/recommend")
app.register_blueprint(swap_bp,      url_prefix="/api/swap")

@app.route("/")
def index():
    return jsonify({"message": "BookSwap API running!", "status": "ok"})

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Route not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
