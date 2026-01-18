import requests
import os
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
import base64
from typing import Dict, Optional
import urllib.parse

class PosterGenerator:
    def __init__(self):
        # Pollinations.ai - Free AI image generation API
        self.api_url = "https://image.pollinations.ai/prompt/"
        
    def generate_poster(self, prompt: str, business_name: str = "", product_name: str = "") -> Dict:
        """
        Generate a marketing poster using Pollinations.ai (Free & Fast)
        Real Stable Diffusion - No API key needed!
        """
        try:
            # Enhance prompt for marketing
            enhanced_prompt = self._enhance_prompt(prompt, business_name, product_name)
            
            # URL encode the prompt
            encoded_prompt = urllib.parse.quote(enhanced_prompt)
            
            # Pollinations.ai URL format: https://image.pollinations.ai/prompt/{prompt}?width=1024&height=1024
            image_url = f"{self.api_url}{encoded_prompt}?width=1024&height=1024&nologo=true&enhance=true"
            
            print(f"[Pollinations] Generating: {enhanced_prompt[:100]}...")
            
            # Download the generated image
            response = requests.get(image_url, timeout=30)
            
            if response.status_code == 200:
                image_bytes = response.content
                
                # Crop bottom portion to remove gibberish text
                image_bytes = self._crop_bottom(image_bytes, crop_percent=15)
                
                # Add text overlay if business/product name provided
                if business_name or product_name:
                    image_bytes = self._add_text_overlay(image_bytes, business_name, product_name)
                
                # Convert to base64
                image_base64 = base64.b64encode(image_bytes).decode('utf-8')
                
                return {
                    "success": True,
                    "image_base64": image_base64,
                    "prompt": enhanced_prompt,
                    "model": "Pollinations.ai (Stable Diffusion)",
                    "resolution": "1024x1024"
                }
            else:
                return {
                    "success": False,
                    "error": f"API Error: {response.status_code}",
                    "message": "Failed to generate image. Please try again."
                }
                
        except Exception as e:
            print(f"[Pollinations] Error: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to generate poster. Check your internet connection."
            }
    
    def _crop_bottom(self, image_bytes: bytes, crop_percent: int = 15) -> bytes:
        """
        Crop the bottom portion of the image to remove gibberish text
        """
        try:
            image = Image.open(BytesIO(image_bytes))
            width, height = image.size
            
            # Calculate new height (remove bottom X%)
            new_height = int(height * (1 - crop_percent / 100))
            
            # Crop the image
            cropped = image.crop((0, 0, width, new_height))
            
            # Resize back to original dimensions to maintain 1024x1024
            resized = cropped.resize((width, height), Image.Resampling.LANCZOS)
            
            # Convert back to bytes
            buffered = BytesIO()
            resized.save(buffered, format="PNG")
            return buffered.getvalue()
            
        except Exception as e:
            print(f"Crop error: {e}")
            return image_bytes
    
    def _enhance_prompt(self, base_prompt: str, business_name: str, product_name: str) -> str:
        """
        Enhance user prompt with professional marketing keywords
        """
        marketing_keywords = [
            "professional marketing poster",
            "vibrant colors",
            "eye-catching design",
            "high quality",
            "modern aesthetic",
            "commercial advertisement style",
            "no text",  # Prevent AI from generating garbled text
            "clean design"
        ]
        
        enhanced = f"{base_prompt}, {', '.join(marketing_keywords[:4])}"
        
        if product_name:
            enhanced = f"Advertisement poster for {product_name}, {enhanced}"
        
        return enhanced
    
    def _add_text_overlay(self, image_bytes: bytes, business_name: str, product_name: str) -> bytes:
        """
        Add text overlay to generated image using PIL
        """
        try:
            # Open image
            image = Image.open(BytesIO(image_bytes))
            draw = ImageDraw.Draw(image)
            
            # Try to use a nice font, fallback to default
            try:
                font_large = ImageFont.truetype("arial.ttf", 70)
                font_small = ImageFont.truetype("arial.ttf", 50)
            except:
                font_large = ImageFont.load_default()
                font_small = ImageFont.load_default()
            
            # Add business name at top
            if business_name:
                text_bbox = draw.textbbox((0, 0), business_name, font=font_large)
                text_width = text_bbox[2] - text_bbox[0]
                
                x = (image.width - text_width) // 2
                y = 50
                
                # Draw text with outline for visibility
                outline_color = "black"
                for adj_x in range(-3, 4):
                    for adj_y in range(-3, 4):
                        draw.text((x+adj_x, y+adj_y), business_name, font=font_large, fill=outline_color)
                draw.text((x, y), business_name, font=font_large, fill="white")
            
            # Add product name at bottom
            if product_name:
                text_bbox = draw.textbbox((0, 0), product_name, font=font_small)
                text_width = text_bbox[2] - text_bbox[0]
                
                x = (image.width - text_width) // 2
                y = image.height - 120
                
                for adj_x in range(-3, 4):
                    for adj_y in range(-3, 4):
                        draw.text((x+adj_x, y+adj_y), product_name, font=font_small, fill="black")
                draw.text((x, y), product_name, font=font_small, fill="white")
            
            # Convert back to bytes
            buffered = BytesIO()
            image.save(buffered, format="PNG")
            return buffered.getvalue()
            
        except Exception as e:
            print(f"Text overlay error: {e}")
            # Return original image if overlay fails
            return image_bytes

poster_generator = PosterGenerator()
