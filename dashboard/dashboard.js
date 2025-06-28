// //     function generateQuestions() {
// //       const domain = document.getElementById("domainSelect").value;

// //       fetch("http://localhost:5500/api/generate", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ domain: domain })
// //       })
// //       .then(async res => {
// //         if (!res.ok) {
// //           const errMsg = await res.text(); // fallback in case response is not JSON
// //           throw new Error(`Server error: ${res.status} ${errMsg}`);
// //         }
// //         return res.json();
// //       })
// //       .then(data => {
// //         document.getElementById("output").innerText = data.questions || "No questions returned.";
// //       })
// //       .catch(err => {
// //         console.error("Error:", err);
// //         document.getElementById("output").innerText = "Failed to load questions.";
// //       });
// //     }
// // // function to generate feedback 
// //     function getFeedback() {
// //       const userAnswer = document.getElementById("answer").value;
  
// //       fetch("http://localhost:5500/api/feedback", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ answer: userAnswer })
// //       })
// //       .then(res => res.json())
// //       .then(data => {
// //         document.getElementById("feedbackBox").innerText = data.feedback || "No feedback received.";
// //       })
// //       .catch(err => {
// //         console.error("Feedback error:", err);
// //         document.getElementById("feedbackBox").innerText = "Failed to generate feedback.";
// //       });
// //     }
// // // function to store answer with feedback....
// //     function submitAnswerWithFeedback() {
// //       const answer = document.getElementById("answer").value;
// //       const email = localStorage.getItem("user_email"); // assuming you store it on login
    
// //       fetch("http://localhost:5500/api/feedback", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ answer: answer, user_email: email })
// //       })
// //       .then(res => res.json())
// //       .then(data => {
// //         document.getElementById("feedbackBox").innerText = data.feedback || "No feedback received.";
// //       })
// //       .catch(err => {
// //         console.error("Feedback error:", err);
// //       });
// //     }
//     // ...............................................
// let currentQuestion = "";

// function generateQuestion() {
//   const domain = document.getElementById("domain").value;

//   fetch("http://localhost:5500/api/generate", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ domain })
//   })
//   .then(res => res.json())
//   .then(data => {
//     const questions = data.questions.split('\n').filter(q => q.trim() !== '');
//     currentQuestion = questions[0] || "No question received.";
//     document.getElementById("questionBox").innerText = `📝 Question: ${currentQuestion}`;
//   })
//   .catch(err => {
//     console.error("Question fetch error:", err);
//     document.getElementById("questionBox").innerText = "Failed to load question.";
//   });
// }

// function submitAnswer() {
//   const user_email = document.getElementById("email").value;
//   const answer = document.getElementById("answer").value;

//   if (!user_email || !answer || !currentQuestion) {
//     alert("Please fill in all fields and generate a question first.");
//     return;
//   }

//   fetch("http://localhost:5500/api/feedback", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       user_email,
//       question: currentQuestion,
//       answer
//     })
//   })
//   .then(res => res.json())
//   .then(data => {
//     document.getElementById("feedbackBox").innerText = "💬 Feedback:\n" + data.feedback;
//   })
//   .catch(err => {
//     console.error("Feedback error:", err);
//     document.getElementById("feedbackBox").innerText = "Failed to generate feedback.";
//   });
// }

let questions = [];
let currentIndex = 0;

function generateQuestionSet() {
  const domain = document.getElementById("domain").value;
  const email = document.getElementById("email").value;

  if (!email) {
    alert("Please enter your email.");
    return;
  }

  fetch("http://localhost:5500/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain })
  })
  .then(res => res.json())
  .then(data => {
    questions = data.questions.split('\n').filter(q => q.trim());
    currentIndex = 0;
    showCurrentQuestion();
    document.getElementById("feedbackBox").innerText = '';
    document.getElementById("answer").value = '';
  })
  .catch(err => {
    console.error("Error generating questions:", err);
    document.getElementById("questionBox").innerText = "Failed to generate questions.";
  });
}

function showCurrentQuestion() {
  if (currentIndex < questions.length) {
    document.getElementById("questionBox").innerText = `📝 Question ${currentIndex + 1}: ${questions[currentIndex]}`;
  } else {
    document.getElementById("questionBox").innerText = "✅ All questions answered!";
    document.getElementById("answer").disabled = true;
  }
}

function submitCurrentAnswer() {
  const email = document.getElementById("email").value;
  const answer = document.getElementById("answer").value;
  const question = questions[currentIndex];

  if (!email || !answer || !question) {
    alert("Please fill in all fields and generate a question set.");
    return;
  }

  fetch("http://localhost:5500/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_email: email, question, answer })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("feedbackBox").innerText = `💬 Feedback:\n${data.feedback}`;
    currentIndex++;
    setTimeout(() => {
      document.getElementById("answer").value = '';
      document.getElementById("feedbackBox").innerText = '';
      showCurrentQuestion();
    }, 3000);
  })
  // feedback rating....
  .then(data => {
    document.getElementById("feedbackBox").innerText =
      "💬 Feedback:\n" + data.feedback + "\n\n⭐ Rating: " + (data.rating || "N/A");
  })
  
  .catch(err => {
    console.error("Feedback error:", err);
    document.getElementById("feedbackBox").innerText = "Failed to get feedback.";
  });
}
