import uvicorn

if __name__ == "__main__":
    print("🚀 Starting CampusIQ FastAPI Backend Server on http://localhost:8000 ...")
    print("📚 Interactive API Documentation: http://localhost:8000/docs")
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
