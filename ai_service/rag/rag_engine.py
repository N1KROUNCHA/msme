import os
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import FAISS

class RAGEngine:
    def __init__(self, data_paths=["rag/data/msme_policies.md"], index_path="rag/faiss_index"):
        self.data_paths = data_paths if isinstance(data_paths, list) else [data_paths]
        self.index_path = index_path
        self.is_simulated = not os.getenv("OPENAI_API_KEY")
        self.qa_chain = None
        
        if not self.is_simulated:
            try:
                self._initialize_rag()
            except Exception as e:
                print(f"RAG init failed for {data_paths}, falling back to simulation: {e}")
                self.is_simulated = True

    def _initialize_rag(self):
        all_texts = []
        for path in self.data_paths:
            if not os.path.exists(path):
                print(f"Warning: Data path {path} not found. Skipping.")
                continue

            loader = TextLoader(path, encoding='utf-8')
            documents = loader.load()
            text_splitter = CharacterTextSplitter(chunk_size=700, chunk_overlap=70)
            texts = text_splitter.split_documents(documents)
            all_texts.extend(texts)
        
        if not all_texts:
            raise ValueError("No documents found to initialize RAG.")

        embeddings = OpenAIEmbeddings()
        vectorstore = FAISS.from_documents(all_texts, embeddings)
        vectorstore.save_local(self.index_path)
        
        llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=llm, chain_type="stuff", retriever=vectorstore.as_retriever()
        )

    def query(self, question):
        if self.is_simulated:
            return self._simulated_query(question)
        if not self.qa_chain:
            return "RAG Engine not initialized."
        return self.qa_chain.run(question)

    def _simulated_query(self, question):
        """High-fidelity NLP-based retrieval with list support and ministry-aware weighting."""
        question_lower = question.lower()
        try:
            full_content = ""
            for path in self.data_paths:
                if os.path.exists(path):
                    with open(path, 'r', encoding='utf-8') as f:
                        full_content += f.read() + "\n\n"
            
            # Split by markdown headers
            sections = [s for s in full_content.split('## ') if s.strip()]
            matches = []
            
            # Identify list-trigger words
            list_triggers = {"all", "list", "show", "give", "schemes", "policies", "benefits", "various", "multiple"}
            is_list_query = any(word in question_lower.split() for word in list_triggers)
            
            # Identify core keywords vs fluff (strip punctuation)
            stop_words = {"what", "is", "the", "for", "how", "can", "get", "about", "tell", "me", "are", "there", "any"}
            raw_keywords = [kw.strip('?!.,()') for kw in question_lower.split()]
            keywords = [kw for kw in raw_keywords if kw not in stop_words and kw not in ["show", "give", "tell"] and len(kw) > 2]
            
            for section in sections:
                header = section.split('\n')[0]
                header_words = [w.strip('?!.,():') for w in header.lower().split()]
                section_lower = section.lower()
                score = 0
                
                # Extract Products line if it exists (for supplier data)
                products_line = ""
                for line in section.split('\n'):
                    if line.strip().startswith('- **Products**:') or line.strip().startswith('**Products**:'):
                        products_line = line.lower()
                        break
                
                for kw in keywords:
                    # Fuzzy match: check if keyword matches any word in header
                    header_match = any(kw.startswith(w) or w.startswith(kw) for w in header_words if len(w) > 2)
                    if header_match:
                        score += 20
                    
                    # CRITICAL: Check Products field with high priority
                    if products_line:
                        # Tokenize products (split by comma, slash, etc.)
                        product_tokens = [p.strip().lower() for p in products_line.replace(',', ' ').replace('/', ' ').replace('(', ' ').replace(')', ' ').split()]
                        # Check if keyword matches any product token
                        product_match = any(kw in token or token.startswith(kw) or kw.startswith(token) for token in product_tokens if len(token) > 2)
                        if product_match:
                            score += 30  # Very high weight for product matches
                    
                    # Also check section body
                    if kw in section_lower or (len(kw) > 4 and kw[:-1] in section_lower):
                        score += 5
                    
                    # Extra weight for ministry matches
                    if "ministry" in header_words and header_match:
                        score += 10

                if score >= 15:
                    matches.append({"score": score, "content": section.strip(), "title": header})


            # Sort by relevance
            matches = sorted(matches, key=lambda x: x['score'], reverse=True)

            if not matches:
                return "I'm sorry, I couldn't find specific details for that query in our MSME database. However, I can help you with topics like MUDRA loans, PMEGP subsidies, GST registration, or credit guarantee schemes. Could you please specify which area you'd like to know more about?"

            # If it's a list query, return multiple summaries
            if is_list_query:
                response = f"### Found {min(len(matches), 5)} Relevant Schemes:\n\n"
                for i, match in enumerate(matches[:5], 1):
                    # Clean title and extract scheme name only
                    import re
                    title = re.sub(r'^(\d+\.\s*|#+\s*)', '', match['title']).strip()
                    
                    # Remove ministry prefix if present (format: "MINISTRY OF XYZ: Scheme Name")
                    if ':' in title:
                        title = title.split(':', 1)[1].strip()
                    
                    # Extract the full description
                    content_lines = match['content'].split('\n')
                    summary = "Details available in the MSME knowledge base."
                    for line in content_lines:
                        if "**Description**:" in line:
                            summary = line.replace("**Description**:", "").strip()
                            break
                    
                    response += f"{i}. **{title}**\n   {summary}\n\n"
                return response

            # Otherwise, return the top match in detail
            primary = matches[0]
            content_lines = primary['content'].split('\n')
            raw_title = content_lines[0]
            
            import re
            title = re.sub(r'^(#+\s*|[\d\.]+\s*)', '', raw_title).strip()
            body = "\n".join(content_lines[1:])
            
            # Check for sub-points if the user is asking for a specific term found in a bullet
            sub_points = re.findall(r'(-\s*\*\*[^*]+\*\*:.*?(?=\n-\s*\*\*|\Z))', body, re.DOTALL)
            if sub_points:
                best_sub = None
                max_sub_score = 0
                for sub in sub_points:
                    sub_lower = sub.lower()
                    sub_score = sum(10 for kw in keywords if kw in sub_lower.split('**')[1].lower() if '**' in sub_lower)
                    sub_score += sum(2 for kw in keywords if kw in sub_lower)
                    if sub_score > max_sub_score:
                        max_sub_score = sub_score
                        best_sub = sub
                if max_sub_score >= 10:
                    body = best_sub

            response = f"## {title}\n\n"
            formatted_body = body.replace("**Description**:", "#### 📝 Summary:\n")
            formatted_body = formatted_body.replace("**Nature of Assistance**:", "#### 💰 Financial Support:\n")
            formatted_body = formatted_body.replace("**Who can Apply**:", "#### 👤 Eligibility:\n")
            formatted_body = formatted_body.replace("**How to Apply**:", "#### 🚀 Application Process:\n")
            
            response += formatted_body.strip()
            return response

        except Exception as e:
            return f"I encountered an error while retrieving the information: {str(e)}. Please try again."

        except Exception as e:
            return f"I encountered an error while retrieving the information: {str(e)}. Please try again."

# Instances for different purposes
_policy_engine = None
_supplier_engine = None

def get_policy_engine():
    global _policy_engine
    if _policy_engine is None:
        _policy_engine = RAGEngine(
            data_paths=["rag/data/msme_policies.md", "rag/data/comprehensive_schemes.md"], 
            index_path="rag/faiss_policy"
        )
    return _policy_engine

def get_supplier_engine():
    global _supplier_engine
    if _supplier_engine is None:
        _supplier_engine = RAGEngine(
            data_paths=["rag/data/suppliers.md", "rag/data/suppliers_retail.md"], 
            index_path="rag/faiss_suppliers"
        )
    return _supplier_engine
