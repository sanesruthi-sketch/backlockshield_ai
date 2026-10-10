# CampusIQ Backend — Main Entry Point
# HacXLerate 2026 · Team DEBUG MASTERS

from backend.app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
