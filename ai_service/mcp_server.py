import os
import json
import requests
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="MSME Growth Engine MCP Server")

# Mock Base URL for existing backend
BACKEND_URL = "http://localhost:5000/api"

@app.get("/inventory/snapshot")
def get_inventory_snapshot(user_id: str):
    """Exposes current stock levels and critical items for external AI agents."""
    try:
        res = requests.get(f"{BACKEND_URL}/inventory/{user_id}")
        data = res.json()
        
        critical_items = [p for p in data if p.get('stock', 0) <= p.get('reorderLevel', 5)]
        
        return {
            "total_items": len(data),
            "critical_count": len(critical_items),
            "critical_list": [{"name": p['name'], "stock": p['stock']} for p in critical_items]
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/finance/status")
def get_finance_status(user_id: str):
    """Exposes P&L summary to external AI agents."""
    try:
        res = requests.get(f"{BACKEND_URL}/finance/{user_id}")
        txs = res.json()
        
        income = sum(t['amount'] for t in txs if t['type'] == 'Income')
        expense = sum(t['amount'] for t in txs if t['type'] == 'Expense')
        
        return {
            "net_balance": income - expense,
            "income": income,
            "expense": expense,
            "tx_count": len(txs)
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
