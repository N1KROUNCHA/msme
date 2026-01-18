import random
from typing import List, Dict

class InventoryAgent:
    def __init__(self):
        self.suppliers = [
            {"id": "s1", "name": "Metro Cash & Carry", "reliability": 0.9},
            {"id": "s2", "name": "Local Wholesaler A", "reliability": 0.8},
            {"id": "s3", "name": "Farm Fresh Direct", "reliability": 0.95}
        ]

    def analyze_stock(self, products: List[Dict]):
        """
        Analyzes a list of products (with their recent sales metrics) 
        and decides which ones need restocking.
        """
        actions = []
        
        for p in products:
            name = p.get("name")
            stock = p.get("current_stock", 0)
            reorder_level = p.get("reorder_level", 10)
            avg_daily_sales = p.get("avg_daily_sales", 1.0)
            
            # Simple Agentic Logic
            # 1. Perception: Is stock low?
            if stock <= reorder_level:
                # 2. Reasoning: How much to order?
                # Target: 14 days of inventory
                target_stock = int(avg_daily_sales * 14) 
                order_qty = max(10, target_stock - stock) # Minimum order 10
                
                # 3. Action Selection: Which supplier?
                supplier = random.choice(self.suppliers)
                
                action = {
                    "product": name,
                    "reason": f"Stock ({stock}) below reorder level ({reorder_level}). Daily Sales: {avg_daily_sales:.1f}",
                    "action": "Order",
                    "quantity": order_qty,
                    "supplier": supplier["name"],
                    "confidence": 0.95,
                    "estimated_cost": p.get("price", 0) * order_qty * 0.8 # Wholesale cost approx 80%
                }
                actions.append(action)
                
        return {"actions": actions, "total_actions": len(actions)}

inventory_agent = InventoryAgent()
