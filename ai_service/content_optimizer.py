import requests
from typing import Dict

class ContentOptimizer:
    def __init__(self):
        self.ollama_url = "http://localhost:11434/api/generate"
        
    def generate_marketing_copy(self, product_name: str, product_category: str, target_audience: str = "general customers") -> Dict:
        """
        Generate marketing headlines and copy using Ollama (free local LLM)
        """
        prompt = f"""You are a professional marketing copywriter. Create compelling marketing content for:

Product: {product_name}
Category: {product_category}
Target Audience: {target_audience}

Generate:
1. A catchy headline (max 10 words)
2. A compelling tagline (max 15 words)
3. Three key selling points (bullet points)

Format your response as:
HEADLINE: [headline]
TAGLINE: [tagline]
POINTS:
- [point 1]
- [point 2]
- [point 3]
"""
        
        try:
            response = requests.post(
                self.ollama_url,
                json={
                    "model": "llama2",
                    "prompt": prompt,
                    "stream": False
                },
                timeout=180  # 3 minutes - give Ollama enough time to generate
            )
            
            if response.status_code == 200:
                result = response.json()
                generated_text = result.get("response", "")
                
                # Parse the response
                parsed = self._parse_marketing_copy(generated_text)
                
                return {
                    "success": True,
                    "headline": parsed.get("headline", f"Discover {product_name}"),
                    "tagline": parsed.get("tagline", f"The best {product_category} for you"),
                    "selling_points": parsed.get("points", [
                        f"Premium quality {product_category}",
                        "Trusted by thousands",
                        "Best value for money"
                    ]),
                    "raw_response": generated_text
                }
            else:
                return self._fallback_copy(product_name, product_category)
                
        except Exception as e:
            print(f"Ollama error: {e}")
            return self._fallback_copy(product_name, product_category)
    
    def _parse_marketing_copy(self, text: str) -> Dict:
        """Parse the generated marketing copy"""
        result = {}
        
        # Extract headline
        if "HEADLINE:" in text:
            headline_start = text.find("HEADLINE:") + len("HEADLINE:")
            headline_end = text.find("\n", headline_start)
            result["headline"] = text[headline_start:headline_end].strip()
        
        # Extract tagline
        if "TAGLINE:" in text:
            tagline_start = text.find("TAGLINE:") + len("TAGLINE:")
            tagline_end = text.find("\n", tagline_start)
            result["tagline"] = text[tagline_start:tagline_end].strip()
        
        # Extract points
        points = []
        if "POINTS:" in text:
            points_section = text[text.find("POINTS:"):]
            for line in points_section.split("\n"):
                if line.strip().startswith("-"):
                    points.append(line.strip()[1:].strip())
        result["points"] = points[:3]  # Max 3 points
        
        return result
    
    def _fallback_copy(self, product_name: str, product_category: str) -> Dict:
        """Fallback marketing copy if Ollama is unavailable"""
        return {
            "success": True,
            "headline": f"Discover Amazing {product_name}",
            "tagline": f"Your trusted choice for {product_category}",
            "selling_points": [
                f"Premium quality {product_category}",
                "Competitive pricing",
                "Customer satisfaction guaranteed"
            ],
            "note": "Using fallback copy (Ollama unavailable)"
        }

content_optimizer = ContentOptimizer()
