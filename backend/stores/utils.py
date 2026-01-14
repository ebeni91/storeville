import re

def parse_search_query(query):
    """
    Extracts price, categories, and keywords.
    Returns: (keyword, max_price, category)
    """
    # 1. Extract Price
    price_pattern = r'(?:under|less than|below|cheaper than)\s+(\d+)'
    match = re.search(price_pattern, query, re.IGNORECASE)
    
    max_price = None
    if match:
        max_price = float(match.group(1))
        # Remove price text from query
        query = re.sub(price_pattern, '', query, flags=re.IGNORECASE)

    # 2. Extract Category
    # These keywords map to the 'category' field in your Store model
    categories = {
        'electronics': ['electronics', 'phone', 'laptop', 'computer', 'tech', 'gadget'],
        'fashion': ['fashion', 'clothes', 'wear', 'shirt', 'shoe', 'dress', 'jeans'],
        'food': ['food', 'grocery', 'groceries', 'snack', 'drink', 'meal'],
        'home': ['home', 'garden', 'furniture', 'decor', 'table', 'chair'],
        'art': ['art', 'craft', 'painting', 'drawing', 'handmade']
    }

    found_category = None
    query_lower = query.lower()

    for key, synonyms in categories.items():
        for syn in synonyms:
            # Check if the synonym exists as a whole word
            if re.search(r'\b' + re.escape(syn) + r'\b', query_lower):
                found_category = key
                break
        if found_category:
            break

    # 3. Clean Keyword
    # Remove common filler words to isolate the actual product name (if any)
    query = re.sub(r'\b(i want|looking for|buy|need|a|an|the|show me|find)\b', '', query, flags=re.IGNORECASE)
    
    # Also remove the found category words from the keyword search to prevent redundancy
    # (e.g., "Show me fashion" -> keyword becomes empty string, so we show all fashion)
    if found_category:
        for syn in categories[found_category]:
            query = re.sub(r'\b' + re.escape(syn) + r'\b', '', query, flags=re.IGNORECASE)

    return query.strip(), max_price, found_category