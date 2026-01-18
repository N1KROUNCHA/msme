# MSME Business Intelligence & AI Growth Platform

This project is a full-stack application designed to help MSMEs with business intelligence and AI-driven insights. It consists of three main components:

1.  **Client**: A React-based frontend dashboard.
2.  **Server**: A Node.js/Express backend API (currently running in Mock Mode).
3.  **AI Service**: A Python/FastAPI service for pricing optimization and computer vision.

## 🚀 Quick Start Guide

You will need **three separate terminal instances** to run the full application.

### 1. Backend Server (Node.js)
This handles data and API requests.
*   **Path**: `server/`
*   **Port**: `5000`

```bash
cd server
npm install
npm start
```
*You should see: "Server running on port 5000"*

---

### 2. AI Brain (Python)
This powers the pricing engine and shelf analysis.
*   **Path**: `ai_service/`
*   **Port**: `8000`

**Prerequisites**: Python installed.

```bash
cd ai_service
# Optional: Create a virtual environment
# python -m venv venv
# .\venv\Scripts\activate

pip install -r requirements.txt
python main.py
```
*Note: If `requirements.txt` is missing, install dependencies manually:*
`pip install fastapi uvicorn pydantic python-multipart ultralytics pillow`

---

### 3. Client Dashboard (React/Vite)
The user interface.
*   **Path**: `client/`
*   **Port**: `5173`

```bash
cd client
npm install
npm run dev
```
*Open your browser to: `http://localhost:5173`*

## 🛠 Troubleshooting

*   **Ports in use**: Ensure ports 5000, 8000, and 5173 are free.
*   **Dependencies**: If `npm install` fails, try deleting `node_modules` and `package-lock.json` and running it again.
*   **Python**: Ensure `python` or `python3` is added to your system PATH.

### Windows Troubleshooting (Python 3.14+ Issues)
If you encounter `ModuleNotFoundError` or build errors with `numpy`, it is likely because your default Python version (e.g., 3.14) is too new for the required libraries.

**Fix**:
1.  We have created a compatible environment for you in `venv_compatible` (using Python 3.11).
2.  Simply run the provided helper script:
    ```bash
    cd ai_service
    run_ai.bat
    ```
