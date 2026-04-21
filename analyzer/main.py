# python -m pip install fastapi uvicorn spacy python-multipart
# python -m spacy download en_core_web_md
# python -m pip install pdfplumber

# uper wala install krke uske bad backend run krne k liye na niche wali line run krke chhod diyo  usse backend on ho jayega fir index.html live server pe khol k apna resume dal k b try krliyo
# python -m uvicorn main:app --reload

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import spacy
import pdfplumber
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the NLP model
try:
    nlp = spacy.load("en_core_web_md")
except:
    nlp = spacy.load("en_core_web_sm")

# Global helper function for text cleaning
def clean_text(text):
    doc = nlp(text.lower())
    return " ".join([token.lemma_ for token in doc if not token.is_stop and not token.is_punct])

@app.post("/analyze")
async def analyze_resume(
    role: str = Form(...),
    jd_text: str = Form(None),
    file: UploadFile = File(...)
):
    try:
        pdf_content = await file.read()
        resume_text = ""
        with pdfplumber.open(io.BytesIO(pdf_content)) as pdf:
            resume_text = " ".join([page.extract_text() for page in pdf.pages if page.extract_text()])

        if not resume_text.strip():
            raise HTTPException(status_code=400, detail="Could not read PDF text")

        resume_low = resume_text.lower()
        
        # Technical Skill Library
        tech_vocab = ["python", "javascript", "sql", "react", "fastapi", "docker", "opencv", "c++", "java", "aws", "node", "html", "css", "mongodb", "machine learning"]
        resume_skills = [k for k in tech_vocab if k in resume_low]

        # Section Checklist
        sections = {
            "SUMMARY": any(x in resume_low for x in ["summary", "objective", "about me"]),
            "EXPERIENCE": any(x in resume_low for x in ["experience", "work history", "internship"]),
            "PROJECTS": "projects" in resume_low,
            "EDUCATION": "education" in resume_low
        }

        # Weighted Scoring Logic
        if role == "employer" and jd_text:
            jd_low = jd_text.lower()
            jd_skills = [k for k in tech_vocab if k in jd_low]
            matching_skills = [s for s in resume_skills if s in jd_skills]
            
            if not jd_skills:
                score = nlp(clean_text(resume_text)).similarity(nlp(clean_text(jd_text))) * 100
            else:
                # 70% Skill Intersection, 30% Semantic Vibe
                skill_match_pct = (len(matching_skills) / len(jd_skills)) * 100
                semantic_pct = nlp(clean_text(resume_text)).similarity(nlp(clean_text(jd_text))) * 100
                score = (skill_match_pct * 0.7) + (semantic_pct * 0.3)
        else:
            # Candidate Score: Section richness (60%) + Skill density (40%)
            section_points = sum(sections.values()) * 15 
            skill_points = min(len(resume_skills) * 8, 40)
            score = section_points + skill_points

        return {
            "score": round(min(float(score), 100.0), 2),
            "skills": [s.upper() for s in resume_skills],
            "sections": sections
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)