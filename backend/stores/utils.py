import re

def parse_search_query(query):
    """
    Extracts price constraints and cleaning the search query.
    Returns: (cleaned_query, max_price)
    Example: "cheap laptop under 50000" -> ("laptop", 50000)
    """
    # Regex to find "under X", "less than X", "below X"
    price_pattern = r'(?:under|less than|below|cheaper than)\s+(\d+)'
    match = re.search(price_pattern, query, re.IGNORECASE)
    
    max_price = None
    if match:
        max_price = float(match.group(1))
        # Remove the price part from the query to get the keyword
        query = re.sub(price_pattern, '', query, flags=re.IGNORECASE)
    
    # Clean up extra spaces and common "filler" words
    query = re.sub(r'\b(i want|looking for|buy|need|a|an|the)\b', '', query, flags=re.IGNORECASE).strip()
    
    return query, max_price