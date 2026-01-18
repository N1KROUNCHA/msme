import os
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import FAISS

class RAGEngine:
    def __init__(self, data_path="rag/data/msme_policies.md", index_path="rag/faiss_index"):
        self.data_path = data_path
        self.index_path = index_path
        self.is_simulated = not os.getenv("OPENAI_API_KEY")
        self.qa_chain = None
        
        if not self.is_simulated:
            try:
                self._initialize_rag()
            except Exception as e:
                print(f"RAG init failed for {data_path}, falling back to simulation: {e}")
                self.is_simulated = True

    def _initialize_rag(self):
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"Data path {self.data_path} not found.")

        loader = TextLoader(self.data_path, encoding='utf-8')
        documents = loader.load()
        text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        texts = text_splitter.split_documents(documents)
        
        embeddings = OpenAIEmbeddings()
        vectorstore = FAISS.from_documents(texts, embeddings)
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
        """Simple keyword matching fallback for demo without API key."""
        question = question.lower()
        try:
            with open(self.data_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            sections = content.split('## ')
            best_match = None
            max_hits = 0

            keywords = question.split()
            for section in sections:
                if not section.strip(): continue
                hits = sum(1 for kw in keywords if len(kw) > 3 and kw in section.lower())
                if hits > max_hits:
                    max_hits = hits
                    best_match = section

            if best_match:
                return "SIMULATION MODE: " + best_match.strip()
            else:
                return "SIMULATION MODE: I couldn't find a specific match in my database for that. Try asking about a different category."
        except Exception as e:
            return f"Error in simulation mode: {str(e)}"

# Instances for different purposes
_policy_engine = None
_supplier_engine = None

def get_policy_engine():
    global _policy_engine
    if _policy_engine is None:
        _policy_engine = RAGEngine(data_path="rag/data/msme_policies.md", index_path="rag/faiss_policy")
    return _policy_engine

def get_supplier_engine():
    global _supplier_engine
    if _supplier_engine is None:
        _supplier_engine = RAGEngine(data_path="rag/data/suppliers.md", index_path="rag/faiss_suppliers")
    return _supplier_engine
