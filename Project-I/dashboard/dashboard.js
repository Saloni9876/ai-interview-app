    function generateQuestions() {
      const domain = document.getElementById("domainSelect").value;

      fetch("http://localhost:5500/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain })
      })
      .then(async res => {
        if (!res.ok) {
          const errMsg = await res.text(); // fallback in case response is not JSON
          throw new Error(`Server error: ${res.status} ${errMsg}`);
        }
        return res.json();
      })
      .then(data => {
        document.getElementById("output").innerText = data.questions || "No questions returned.";
      })
      .catch(err => {
        console.error("Error:", err);
        document.getElementById("output").innerText = "Failed to load questions.";
      });
    }
// function to generate feedback 
    function getFeedback() {
      const userAnswer = document.getElementById("answer").value;
  
      fetch("http://localhost:5500/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: userAnswer })
      })
      .then(res => res.json())
      .then(data => {
        document.getElementById("feedbackBox").innerText = data.feedback || "No feedback received.";
      })
      .catch(err => {
        console.error("Feedback error:", err);
        document.getElementById("feedbackBox").innerText = "Failed to generate feedback.";
      });
    }