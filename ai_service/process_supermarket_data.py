import pandas as pd
import json
import random
from datetime import datetime, timedelta
import os

# Path to CSV (in server directory)
CSV_PATH = r"C:\msme\msmes_growth\server\Indian_Store_Data.csv"
OUTPUT_PATH = r"C:\msme\msmes_growth\server\utils\supermarket_data.json"

def process_data():
    print("Loading CSV data...")
    try:
        df = pd.read_csv(CSV_PATH, encoding='utf-8')
    except UnicodeDecodeError:
        df = pd.read_csv(CSV_PATH, encoding='latin1')
        
    print(f"Loaded {len(df)} rows.")

    # simplistic cleaning
    # Focus on 'Category' that fits supermarket
    target_categories = ['Fast Food', 'Dairy Products', 'Sessional Fruits & Vegetables', 'Staples', 'Beverages', 'Cleaners', 'Food & Beverage', 'Bakery', 'Snacks', 'Eggs, Meat & Fish']
    
    # Check what categories exist
    print("Categories found:", df['Category of Goods'].unique())
    
    # Filter for relevant categories if they largely exist, else take all 
    # Actually 'Category of Goods' in the snippet showed 'Fast Food', 'Dairy Products', 'Sessional Fruits & Vegetables', etc.
    # So we can filter.
    
    supermarket_df = df[df['Category of Goods'].isin(df['Category of Goods'].unique())] # Take all for now to get 500+
    
    # Get top 600 products by frequency to ensure we have enough data
    top_products = supermarket_df['Product Name'].value_counts().head(600).index.tolist()
    
    products_data = []
    
    print(f"Processing {len(top_products)} top products...")
    
    end_date = datetime.now()
    
    for prod_name in top_products:
        prod_rows = supermarket_df[supermarket_df['Product Name'] == prod_name]
        
        if len(prod_rows) < 1: 
            continue
            
        # Extract basic info
        row = prod_rows.iloc[0]
        category = row['Category of Goods']
        
        # Clean name (remove trailing numbers often found in datasets like "Milk - 123")
        clean_name = prod_name.split(' - ')[0].strip()
        
        # Estimate price from sales/quantity avg
        # Safety check for zero quantity
        avg_price = (prod_rows['Sales'] / prod_rows['Quantity']).mean()
        price = round(avg_price, 2)
        if price > 5000: price = 300 # Cap unrealistic prices for supermarket items
        if price < 10: price = 25 # Min price
        
        # Generate Sales History (Last 60 days)
        # We simulate this based on the item's frequency in the original dataset
        # Higher frequency in dataset -> Higher daily sales volume
        frequency_score = len(prod_rows) / 10 # Normalize
        
        base_daily_sales = max(1, int(frequency_score * 2))
        
        history = []
        for i in range(60):
            # 0 is today, 59 is 60 days ago. 
            # We need chronological order: 60 days ago to today.
            
            day_offset = 60 - i
            current_date = end_date - timedelta(days=day_offset)
            
            # Seasonality & Noise
            is_weekend = current_date.weekday() >= 5
            weekend_boost = 1.3 if is_weekend else 1.0
            noise = random.uniform(0.7, 1.3)
            
            val = int(base_daily_sales * weekend_boost * noise)
            history.append(val)
            
        product_obj = {
            "name": clean_name + f" ({row['Sub-Category']})", # Add sub-cat to make unique
            "category": category,
            "price": price,
            "costPrice": round(price * 0.8, 2),
            "stock": random.randint(20, 200),
            "history": history
        }
        
        products_data.append(product_obj)
        
        if len(products_data) >= 550:
            break
            
    # Save to JSON
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(products_data, f, indent=2)
        
    print(f"Successfully generated {len(products_data)} products in {OUTPUT_PATH}")

if __name__ == "__main__":
    process_data()
