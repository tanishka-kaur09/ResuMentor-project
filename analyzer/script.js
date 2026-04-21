let myChart;

function showForm(role) {
    window.currentRole = role;
    document.getElementById('hero').style.display = 'none';
    document.getElementById('upload-section').style.display = 'block';
    document.getElementById('jd-container').style.display = role === 'employer' ? 'block' : 'none';
}

function goBack() {
    document.getElementById('hero').style.display = 'block';
    document.getElementById('upload-section').style.display = 'none';
    document.getElementById('results').style.display = 'none';
    document.getElementById('resume-file').value = "";
}

async function processAnalysis() {
    const fileInput = document.getElementById('resume-file');
    const jdText = document.getElementById('jd-input').value;

    if (!fileInput.files[0]) return alert("Please upload a PDF first.");

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("role", window.currentRole);
    formData.append("jd_text", jdText);

    try {
        const response = await fetch('http://127.0.0.1:8000/analyze', { method: 'POST', body: formData });
        const data = await response.json();
        displayResults(data);
    } catch (err) {
        alert("Backend server is offline! Run main.py.");
    }
}

function displayResults(data) {
    if (data.error) return alert("Error: " + data.error);

    const resultSection = document.getElementById('results');
    resultSection.style.display = 'flex';
    
    const finalScore = parseFloat(data.score).toFixed(1);
    document.getElementById('score-val').innerText = `${finalScore}%`;

    // 📋 Structure
    let sectionHtml = "<h3>📋 Resume Structure</h3>";
    for (let s in data.sections) {
        sectionHtml += `<div class="status-item">${s}: ${data.sections[s] ? '✅' : '❌'}</div>`;
    }
    document.getElementById('section-status').innerHTML = sectionHtml;

    // 💻 Skills
    let skillHtml = "<h3>💻 Tech Detected</h3><div class='tag-container'>";
    skillHtml += data.skills.map(s => `<span class='tag'>${s}</span>`).join('');
    skillHtml += "</div>";
    document.getElementById('skill-tags').innerHTML = skillHtml;

    // 💡 Advice
    let advice = "<h3>💡 Mentor Advice</h3><ul>";
    if (finalScore < 40) advice += "<li><b>Skill Mismatch:</b> Resume lacks keywords from the JD.</li>";
    if (!data.sections.PROJECTS) advice += "<li>Add a <b>Projects</b> section to prove expertise.</li>";
    if (data.skills.length < 3) advice += "<li>List more tools like Git, Docker, or AWS.</li>";
    if (advice === "<h3>💡 Mentor Advice</h3><ul>") advice += "<li>Great job! Your resume is highly compatible.</li>";
    advice += "</ul>";
    document.getElementById('improvement-advice').innerHTML = advice;

    renderChart(parseFloat(finalScore));
    window.scrollTo({ top: resultSection.offsetTop - 20, behavior: 'smooth' });
}

function renderChart(score) {
    const ctx = document.getElementById('scoreChart').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{ data: [score, 100 - score], backgroundColor: ['#0fbcf9', '#1a1b23'], borderWidth: 0 }]
        },
        options: { cutout: '80%', plugins: { legend: { display: false } } }
    });
}
