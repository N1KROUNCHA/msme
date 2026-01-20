import re

def mock_simulated_query_v6(question, content_sections):
    question_lower = question.lower()
    matches = []
    
    list_triggers = {"all", "list", "show", "give", "schemes", "policies", "benefits", "various", "multiple"}
    is_list_query = any(word in question_lower.split() for word in list_triggers)
    
    stop_words = {"what", "is", "the", "for", "how", "can", "get", "about", "tell", "me", "are", "there", "any"}
    raw_keywords = [kw.strip('?!.,()') for kw in question_lower.split()]
    keywords = [kw for kw in raw_keywords if kw not in stop_words and kw not in ["show", "give", "tell"] and len(kw) > 2]
    
    for section in content_sections:
        header = section.split('\n')[0]
        header_words = [w.strip('?!.,():') for w in header.lower().split()]
        section_lower = section.lower()
        score = 0
        
        for kw in keywords:
            # Fuzzy match: check if keyword matches any word in header
            header_match = any(kw.startswith(w) or w.startswith(kw) for w in header_words if len(w) > 2)
            if header_match: score += 20
            
            if kw in section_lower or (len(kw) > 4 and kw[:-1] in section_lower):
                score += 5
            
            if "ministry" in header_words and header_match: score += 10

        if score >= 15:
            matches.append({"score": score, "content": section.strip(), "title": header})

    matches = sorted(matches, key=lambda x: x['score'], reverse=True)
    if not matches: return "No match."

    if is_list_query:
        response = f"### Found {min(len(matches), 5)} Relevant Schemes:\n\n"
        for i, match in enumerate(matches[:5], 1):
            title = re.sub(r'^(\d+\.\s*|#+\s*)', '', match['title']).strip()
            lines = match['content'].split('\n')
            summary = lines[1] if len(lines) > 1 else "No summary available."
            response += f"{i}. **{title}**\n   > {summary[:150]}...\n\n"
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
    
    print("Testing: 'give me all schemes for tribals'")
    result = mock_simulated_query_v6("give me all schemes for tribals", test_content)
    print(result)
    
    if "Found 3 Relevant Schemes" in result:
        print("\nSUCCESS: Found all 3 tribal schemes!")
    else:
        print("\nFAILURE: Did not find all tribal schemes.")
