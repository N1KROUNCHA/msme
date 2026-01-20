import re

def mock_simulated_query_v5(question, content_sections):
    question_lower = question.lower()
    matches = []
    
    # Identify core keywords vs fluff (strip punctuation)
    stop_words = {"what", "is", "the", "for", "how", "can", "get", "about", "tell", "me", "are", "there", "any"}
    raw_keywords = [kw.strip('?!.,()') for kw in question_lower.split()]
    keywords = [kw for kw in raw_keywords if kw not in stop_words and kw not in ["all", "list", "show", "give"] and len(kw) > 2]
    
    is_list_query = any(word in question_lower.split() for word in ["all", "list", "various", "multiple"])

    for section in content_sections:
        header = section.split('\n')[0]
        header_lower = header.lower()
        section_lower = section.lower()
        score = 0
        
        for kw in keywords:
            # Very high weight for ministry matches
            if kw in header_lower: score += 15
            if kw in section_lower: score += 3
            if "ministry" in header_lower and kw in header_lower: score += 10

        if score > 5:
            matches.append({"score": score, "content": section.strip(), "title": header})

    matches = sorted(matches, key=lambda x: x['score'], reverse=True)
    if not matches: return "No match."

    if is_list_query:
        response = f"### Found {min(len(matches), 5)} Relevant Schemes:\n\n"
        for i, match in enumerate(matches[:5], 1):
            title = re.sub(r'^(\d+\.\s*|#+\s*)', '', match['title']).strip()
            summary = match['content'].split('\n')[1].strip()[:150] # Simplified summary for test
            response += f"{i}. **{title}**\n   > {summary}...\n\n"
        return response

    primary = matches[0]
    title = re.sub(r'^(#+\s*|[\d\.]+\s*)', '', primary['title']).strip()
    return f"## {title}\n\n{primary['content']}"

if __name__ == "__main__":
    test_content = [
        "## MINISTRY OF MICRO, SMALL AND MEDIUM ENTERPRISES: Credit Guarantee Scheme\nThis scheme provides credit to MSEs.",
        "## MINISTRY OF TRIBAL AFFAIRS: Adivasi Mahila Sashaktikaran Yojana\nAn exclusive concessional scheme for the economic development of eligible Scheduled Tribe Women.",
        "## MINISTRY OF TRIBAL AFFAIRS: Tribal Forest Dwellers Empowerment Scheme\nGenerating awareness and providing training to forest dwellers.",
        "## MINISTRY OF TRIBAL AFFAIRS: Micro Credit Scheme\nSmall loans for self-employment ventures for tribes."
    ]
    
    print("Test 1: 'give me all schemes for tribals'")
    print(mock_simulated_query_v5("give me all schemes for tribals", test_content))
    
    print("\n" + "="*50 + "\n")
    
    print("Test 2: 'Adivasi Mahila scheme'")
    print(mock_simulated_query_v5("tell me about Adivasi Mahila scheme", test_content))
