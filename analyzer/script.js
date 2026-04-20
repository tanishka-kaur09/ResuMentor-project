async function analyzeResume() {
  const file = document.getElementById("resumeFile").files[0];
  const box = document.getElementById("analysisResult");

  if (!file) return alert("Upload resume first");
  box.style.display = "block";
  box.innerHTML = "Analyzing...";

  let text = "";

  if (file.name.endsWith(".pdf")) {
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((i) => i.str).join(" ");
    }
  } else if (file.name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({
      arrayBuffer: await file.arrayBuffer(),
    });
    text = result.value;
  } else {
    text = await file.text();
  }

  const skills = [
    "html",
    "css",
    "javascript",
    "python",
    "java",
    "sql",
    "react",
  ].filter((s) => text.toLowerCase().includes(s));

  box.innerHTML = `
    <h3>Detected Skills</h3>
    <p>${skills.join(", ") || "No skills detected"}</p>
    <p><strong>Score:</strong> ${Math.min(100, skills.length * 15)}%</p>
  `;
}

async function analyzeResume() {
  const file = document.getElementById("resumeFile").files[0];
  const box = document.getElementById("analysisResult");

  if (!file) return alert("Please upload resume first");

  box.style.display = "block";
  box.innerHTML = "Analyzing complete resume... ⏳";

  let text = "";

  if (file.name.endsWith(".pdf")) {
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((i) => i.str).join(" ") + " ";
    }
  } else if (file.name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({
      arrayBuffer: await file.arrayBuffer(),
    });
    text = result.value;
  } else {
    text = await file.text();
  }

  const lower = text.toLowerCase();

  const sections = {
    summary: lower.includes("summary") || lower.includes("objective"),
    skills: lower.includes("skills"),
    experience: lower.includes("experience") || lower.includes("intern"),
    education: lower.includes("education"),
    projects: lower.includes("project"),
    certification: lower.includes("certification"),
  };

  const techSkills = [
    "html",
    "css",
    "javascript",
    "react",
    "node",
    "python",
    "java",
    "c++",
    "sql",
    "mongodb",
    "aws",
    "machine learning",
    "next",
    "express",
    "go",
    "rust",
    "ruby",
  ];

  const softSkills = [
    "communication",
    "teamwork",
    "leadership",
    "problem solving",
    "adaptability",
    "critical thinking",
  ];

  const detectedTech = techSkills.filter((s) => lower.includes(s));
  const detectedSoft = softSkills.filter((s) => lower.includes(s));

  const emailFound = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
  const phoneFound = /\b\d{10}\b/.test(text);
  const linkedinFound = lower.includes("linkedin");

  let score = 0;

  Object.values(sections).forEach((v) => v && (score += 10));
  score += detectedTech.length * 3;
  score += detectedSoft.length * 2;
  if (emailFound) score += 5;
  if (phoneFound) score += 5;
  if (linkedinFound) score += 5;

  if (score > 100) score = 100;

  let rating = "Poor ❌";
  if (score >= 80) rating = "Excellent ⭐";
  else if (score >= 60) rating = "Good 👍";
  else if (score >= 40) rating = "Average ⚠️";

  const suggestions = [];

  if (!sections.summary)
    suggestions.push("Add a professional summary or objective.");
  if (!sections.skills) suggestions.push("Add a clear skills section.");
  if (!sections.projects)
    suggestions.push("Mention academic or personal projects.");
  if (!linkedinFound) suggestions.push("Include LinkedIn profile.");
  if (detectedTech.length < 4)
    suggestions.push("Add more relevant technical skills.");
  if (detectedSoft.length < 2)
    suggestions.push("Highlight soft skills like communication or teamwork.");
  if (score < 60)
    suggestions.push("Use numbers and achievements to strengthen experience.");

  box.innerHTML = `
    <h2>Resume Analyzer</h2>
    <hr>

    <h3>Overall Score</h3>
    <p><strong>${score}%</strong> (${rating})</p>

    <h3>Sections Found</h3>
    <ul style="list-style: none;">
      ${Object.entries(sections)
        .map(([k, v]) => `<li>${k.toUpperCase()} : ${v ? "✅" : "❌"}</li>`)
        .join("")}
    </ul>

    <h3>💻 Technical Skills</h3>
    <p>${detectedTech.join(", ") || "Not clearly mentioned"}</p>

    <h3>🧠 Soft Skills</h3>
    <p>${detectedSoft.join(", ") || "Not detected"}</p>

    <h3>📞 Contact Information</h3>
    <p>
       Email: ${emailFound ? "✅" : "❌"} |
       Phone: ${phoneFound ? "✅" : "❌"} |
       LinkedIn: ${linkedinFound ? "✅" : "❌"}
    </p>

    <h3>Improvement Suggestions</h3>
    <ul style="list-style: none;">${suggestions.map((s) => `<li>${s}</li>`).join("")}</ul>
  `;
}
