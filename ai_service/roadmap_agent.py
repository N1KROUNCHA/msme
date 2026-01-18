import os
import json
import requests

class GrowthRoadmapAgent:
    def __init__(self):
        self.ollama_url = "http://localhost:11434/api/generate"
        self.model = "llama3.2:3b"
        self.strategies = {
            "Retail": [
                "Optimize inventory turnover by focusing on high-margin items.",
                "Implement a loyalty program to increase repeat customer visits.",
                "Explore local WhatsApp marketing for daily offers."
            ],
            "Manufacturing": [
                "Analyze production waste and implement lean manufacturing steps.",
                "Seek technology upgradation grants via CLCSS scheme.",
                "Develop a B2B sales pipeline for industrial distributors."
            ],
            "Service": [
                "Standardize service delivery to improve customer satisfaction.",
                "Focus on digital reputation management (Google Reviews).",
                "Create package-based pricing to improve cashflow predictability."
            ]
        }

    def generate_roadmap(self, business_type, sector, size, goals, metrics=None):
        """
        Generates a personalized growth roadmap based on business profile using Ollama.
        """
        print(f"Generating high-precision roadmap for {size} {business_type} in {sector}...")
        
        metrics_context = ""
        context_data = metrics or {}
        
        if metrics:
            forecast = context_data.get('forecast_profit', 0)
            stock_risks = context_data.get('stock_risks_count', 0)
            collaboration = context_data.get('collaboration_score', "Active")
            
            metrics_context = f"""
            REAL-WORLD DATA INSIGHTS:
            - Monthly Net Profit: ₹{context_data.get('net_profit', 0)}
            - LSTM Next-Day Forecasted Profit: ₹{forecast}
            - Critical Stockout Risks: {stock_risks} items
            - Local Network Connectivity: {collaboration}
            - Current OpEx: ₹{context_data.get('monthly_expenses', 0)}
            """

        prompt = f"""
        You are a Senior MSME Business Consultant specializing in high-growth Indian retail and manufacturing.
        Create a DATA-DRIVEN, HYPER-PERSONALIZED growth roadmap for a business with the following profile:
        - Type: {business_type} | Sector: {sector} | Scale: {size}
        - Key Goals: {', '.join(goals)}
        
        {metrics_context}

        INSTRUCTIONS:
        1. BE SPECIFIC. Mention the actual numbers (profit, forecast, stock risks) in your advice.
        2. DATA-DRIVEN STRATEGY: If the LSTM forecast is high, suggest immediate expansion. If stock risks are high, prioritize redistribution via the hyperlocal cluster.
        3. AVOID GENERIC ADVICE like "use WhatsApp". Instead suggest "Use the MARL-optimized pricing engine to liquidate [X] items before expiry".
        
        Return a strictly formatted JSON object:
        {{
            "title": "A specific, punchy title using business data",
            "milestones": [
                {{"step": 1, "task": "Aggressive Local Optimization", "details": "Specific action based on current profit/stock levels"}},
                {{"step": 2, "task": "Network-Led Expansion", "details": "How to use neighbor inventory pooling to reduce costs"}},
                {{"step": 3, "task": "Revenue Maximization", "details": "Details on dynamic pricing for specific sector margin uplift"}},
                {{"step": 4, "task": "Scale & Sustain", "details": "Long term plan based on LSTM growth trends"}}
            ],
            "recommendation": "A powerful, 1-sentence expert tip using data-driven reasoning"
        }}
        Only return the JSON object.
        """

        try:
            # Attempt to use Ollama
            response = requests.post(
                self.ollama_url,
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json"
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                ai_content = json.loads(result.get("response", "{}"))
                if ai_content and "milestones" in ai_content:
                    return ai_content
        except Exception as e:
            print(f"Ollama Connection Error: {e}. Falling back to high-precision rule engine.")

        # Fallback to high-precision rule-based system (Much better than before)
        net_profit = context_data.get('net_profit', 0)
        forecast = context_data.get('forecast_profit', 0)
        
        roadmap = {
            "title": f"Data-Driven Growth Roadmap for {business_type} ({sector})",
            "milestones": [
                {
                    "step": 1, 
                    "task": "Stabilize Working Capital", 
                    "details": f"Current monthly profit is ₹{net_profit}. Focus on reducing OpEx by 10% to boost cash reserves for restocking."
                },
                {
                    "step": 2, 
                    "task": "Inventory Pooling", 
                    "details": "Trigger 'Collaborative Restock' alerts. Your neighbor has surplus stock that can reduce your supply-chain lag by 48 hours."
                },
                {
                    "step": 3, 
                    "task": "Dynamic Margin uplift", 
                    "details": f"Adjust prices by +3% on high-demand items identified by LSTM. Expected revenue increase: ₹{int(net_profit * 0.15)}/mo."
                },
                {
                    "step": 4, 
                    "task": "Expansion Readiness", 
                    "details": f"With a positive next-day forecast of ₹{forecast}, initiate the 'Loyalty Boost' via AI Marketing view."
                }
            ],
            "recommendation": f"Prioritize reducing {sector}-specific stockouts to maximize the ₹{forecast} next-day opportunity."
        }
        
        return roadmap

roadmap_agent = GrowthRoadmapAgent()
