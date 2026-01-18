import numpy as np
import random
from typing import List, Dict

class HyperlocalEnv:
    def __init__(self, num_shops=5):
        self.num_shops = num_shops
        # Initialize shops with random stock and locations
        self.shops = [
            {
                "id": i,
                "stock": random.randint(20, 100),
                "reorder_level": 20,
                "demand_history": [random.randint(5, 15) for _ in range(14)],
                "price": 100.0,
                "in_transit": [], # List of (timestamp_of_arrival, quantity)
            } for i in range(num_shops)
        ]
        self.time_step = 0
        self.total_revenue = 0
        self.total_stockouts = 0

    def get_state(self, shop_id: int):
        """
        Returns the observation for a specific shop agent.
        Includes local state and 'Communication Signals' from neighbors.
        """
        shop = self.shops[shop_id]
        neighbors_stock = [s["stock"] for i, s in enumerate(self.shops) if i != shop_id]
        
        state = {
            "local_stock": shop["stock"],
            "avg_demand": sum(shop["demand_history"][-3:]) / 3,
            "neighbors_stock_sum": sum(neighbors_stock),
            "in_transit_qty": sum(q for t, q in shop["in_transit"]),
            "price": shop["price"]
        }
        return state

    def step(self, actions: Dict[int, Dict]):
        """
        Executes actions for all shops simultaneously.
        actions: { shop_id: { type: 'REORDER'|'BORROW'|'PRICE', qty: x, target: y } }
        """
        rewards = {i: 0 for i in range(self.num_shops)}
        self.time_step += 1
        
        # 1. Process Actions
        for shop_id, action in actions.items():
            shop = self.shops[shop_id]
            a_type = action.get("type")
            qty = action.get("qty", 0)

            if a_type == "REORDER":
                # Supplier order (3 day lead time)
                arrival_time = self.time_step + 3
                shop["in_transit"].append((arrival_time, qty))
                rewards[shop_id] -= 5 # Order processing cost
            
            elif a_type == "BORROW":
                target_id = action.get("target")
                if target_id is not None and self.shops[target_id]["stock"] >= qty:
                    # Instant transfer from neighbor
                    self.shops[target_id]["stock"] -= qty
                    shop["stock"] += qty
                    rewards[shop_id] += 10 # Reward for avoiding stockout
                    rewards[target_id] += 5 # Reward for cooperation
                else:
                    rewards[shop_id] -= 10 # Punishment for failed borrow

            elif a_type == "PRICE":
                # Dynamic pricing adjustment
                shop["price"] = action.get("new_price", shop["price"])

        # 2. Process Daily Demand & Transit
        for i, shop in enumerate(self.shops):
            # Arrival of goods
            for arrival_time, qty in list(shop["in_transit"]):
                if arrival_time <= self.time_step:
                    shop["stock"] += qty
                    shop["in_transit"].remove((arrival_time, qty))

            # Daily Demand (Stochastic)
            demand = np.random.poisson(sum(shop["demand_history"][-7:]) / 7)
            sales = min(demand, shop["stock"])
            
            if sales < demand:
                self.total_stockouts += (demand - sales)
                rewards[i] -= 20 # Stockout penalty
            
            shop["stock"] -= sales
            revenue = sales * shop["price"]
            self.total_revenue += revenue
            rewards[i] += revenue / 100 # Scaling reward
            
            # Update history
            shop["demand_history"].append(demand)
            if len(shop['demand_history']) > 30: shop['demand_history'].pop(0)

        return rewards, self.total_revenue, self.total_stockouts

# Singleton instance
hcipn_simulator = HyperlocalEnv()
