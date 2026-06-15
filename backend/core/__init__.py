from flask import Flask

from .config import build_config
from .routes import api

def create_app(overrides: dict | None = None) -> Flask:
    app = Flask(__name__)
    app.config.update(build_config(overrides))
    app.register_blueprint(api)

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, OPTIONS"
        return response

    return app