import numpy as np

class CreditRiskAgent:
    def __init__(self):
        # Heuristic-based initialization (Can be upgraded to a trained forest/classifier)
        self.base_recovery_prob = 0.8
        
    def analyze_risk(self, history, total_debt):
        """
        Analyzes customer behavior to determine recovery probability.
        - history: list of dicts {amount, type, date}
        - total_debt: total current Udhaar
        """
        if not history:
            return 0.1, 0.9 # Low risk, high prob for new customers usually
            
        # 1. Behavioral Features
        num_payments = len([t for t in history if t['type'] == 'payment'])
        num_credits = len([t for t in history if t['type'] == 'credit'])
        
        # 2. Timing Features (Recency of payment)
        # Simplify: if last 3 transactions are credits without a payment, risk increases
        recent_types = [t['type'] for t in history[-3:]]
        payment_lag_penalty = 0.2 if 'payment' not in recent_types else 0
        
        # 3. Debt-to-Payment Ratio
        total_paid = sum([t['amount'] for t in history if t['type'] == 'payment'])
        repayment_ratio = total_paid / (total_paid + total_debt) if (total_paid + total_debt) > 0 else 1.0
        
        # 4. Final Risk Calculation
        risk_score = (1.0 - repayment_ratio) + payment_lag_penalty
        risk_score = min(1.0, max(0.0, risk_score))
        
        recovery_prob = 1.0 - risk_score
        
        # Adjust for total debt magnitude
        if total_debt > 10000:
            recovery_prob *= 0.8 # High debt reduces recovery prob
            
        return round(float(risk_score), 2), round(float(recovery_prob), 2)

credit_agent = CreditRiskAgent()
