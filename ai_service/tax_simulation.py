import numpy as np
from typing import Dict, List

class TaxSimulation:
    def __init__(self, iterations: int = 1000):
        self.iterations = iterations

    def run_projection(self, current_monthly_sales: float, itc_velocity: float, tax_rate: float = 0.18):
        """
        Runs a Monte Carlo simulation of 12-month tax liability.
        itc_velocity: Ratio of ITC to Output Tax (historical average)
        """
        results = []
        
        # Mean and Std Dev for sales growth based on typical MSME variance
        mean_growth = 0.05 
        std_dev = 0.15

        for _ in range(self.iterations):
            monthly_path = []
            cumulative_tax = 0
            sales = current_monthly_sales
            
            for month in range(12):
                # Apply random walk to sales
                growth = np.random.normal(mean_growth, std_dev)
                sales *= (1 + growth)
                
                output_tax = sales * tax_rate
                # Input tax credit usually has higher variance (supply chain shocks)
                itc = output_tax * itc_velocity * np.random.uniform(0.7, 1.3)
                
                payable = max(0, output_tax - itc)
                cumulative_tax += payable
                monthly_path.append(payable)
                
            results.append({
                "path": monthly_path,
                "total": cumulative_tax
            })

        totals = [r["total"] for r in results]
        
        return {
            "expected_yearly_tax": float(np.mean(totals)),
            "worst_case_95": float(np.percentile(totals, 95)),
            "best_case_5": float(np.percentile(totals, 5)),
            "confidence_interval": [float(np.percentile(totals, 25)), float(np.percentile(totals, 75))],
            "volatility_index": float(np.std(totals) / np.mean(totals))
        }

    def detect_anomalies(self, transactions: List[Dict]):
        """
        Research-grade anomaly detection using Benford's Law (leading digit analysis).
        Suspicious behavior often deviates from the log-distribution of first digits.
        """
        if not transactions:
            return {"risk_score": 0, "status": "Low"}
            
        digits = []
        for t in transactions:
            amt_str = str(int(abs(t.get('amount', 0)))).lstrip('0')
            if amt_str:
                digits.append(int(amt_str[0]))
        
        if not digits:
            return {"risk_score": 0, "status": "Low"}

        # Benford's expected distribution for first digits 1-9
        expected = [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6]
        observed = [(digits.count(i) / len(digits)) * 100 for i in range(1, 10)]
        
        # Calculate Chi-Square distance (simplified)
        distance = sum([(o - e)**2 / e for o, e in zip(observed, expected)])
        
        risk_score = min(100, distance * 5) # Heuristic scaling
        
        return {
            "risk_score": float(risk_score),
            "status": "High" if risk_score > 40 else "Medium" if risk_score > 20 else "Low",
            "deviation_profile": observed
        }
