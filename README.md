# Quiz-App

A browser-based interactive quiz application to test your knowledge on **Web Development & DNS Concepts**.

## 🎯 Project Overview

This is a feature-rich quiz application built with vanilla HTML, CSS, and JavaScript. It provides an engaging way to learn and test your understanding of modern web development practices and DNS (Domain Name System) architecture.

### Features

- ✅ **20 Quiz Questions** - 7 web development + 13 DNS questions
- ⏱️ **Timed Questions** - 60 seconds per question
- 📊 **Score Tracking** - Real-time score updates
- 🎨 **Modern UI** - Dark theme with responsive design
- 📝 **Detailed Feedback** - Review all answers after completion
- 🔄 **Restart Functionality** - Practice multiple times

## 📚 Learning Resources

### DNS Guide
For comprehensive learning before taking the quiz, read the **[Complete DNS Guide](./DNS_GUIDE.md)** which covers:

- **DNS Basics** - What DNS is and its primary function
- **DNS Hierarchy** - Recursive Resolver, Root Nameservers, TLD Nameservers
- **DNS Resolution Process** - Step-by-step query journey
- **DNS Record Types** - A, AAAA, CNAME, MX, TXT records
- **DNS Protocols** - TCP/UDP usage, caching, and TTL

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ch-tril/Quiz-App.git
   ```

2. **Open in browser**
   ```bash
   # Navigate to the project folder
   cd Quiz-App
   
   # Open index.html in your browser
   open index.html
   # or
   start index.html
   ```

3. **Start the Quiz**
   - Click "Start Quiz" button
   - Answer each question within 60 seconds
   - Review your results at the end

## 📖 Quiz Content

### Web Development Questions (7)
- HTML structure elements
- CSS styling
- JSON format
- HTTP methods
- JavaScript concepts
- npm commands
- React hooks

### DNS Questions (13)
- DNS terminology and definitions
- Nameserver hierarchy and types
- DNS resolution process
- DNS record types (A, AAAA, CNAME, MX, TXT)
- DNS protocols (TCP/UDP)
- Caching and TTL concepts

## 🎮 How to Play

1. **Start Screen**: Read the rules and click "Start Quiz"
2. **Question Screen**: 
   - Read the question carefully
   - Select one of 4 options (A, B, C, D)
   - Timer counts down from 60 seconds
   - If time runs out: -1 point penalty
   - Correct answer: +1 point
3. **Results Screen**:
   - See your final score
   - Review all questions and answers
   - Click "Try Again" to restart

## 📁 Project Structure

```
Quiz-App/
├── index.html          # Main quiz application
├── quiz_data.json      # Quiz data file
├── DNS_GUIDE.md        # Comprehensive DNS learning guide
├── README.md           # This file
└── LICENSE             # Project license
```

## 💡 Scoring Rules

- ✅ **Correct Answer**: +1 point
- ❌ **Wrong Answer**: No change
- ⏰ **Timeout (60s)**: -1 point

**Total Questions**: 20  
**Maximum Score**: 20 points  
**Minimum Score**: -13 points (all timeouts)

## 🔧 Technical Details

- **Language**: HTML5, CSS3, JavaScript (Vanilla)
- **Browser Support**: All modern browsers
- **No Dependencies**: Runs entirely in the browser
- **Responsive Design**: Works on desktop and mobile

## 📝 Customization

To add more questions, edit the `quizData` array in `index.html`:

```javascript
const quizData = [
  {
    id: 21,
    question: "Your question here?",
    options: ["Option A", "Option B", "Option C", "Option D"],
    answerIndex: 0  // Index of correct answer (0-3)
  },
  // Add more questions...
];
```

## 📄 Related Links

- 📖 [Original Project on Roadmap.sh](https://roadmap.sh/projects/quiz-app)
- 🔗 [View Solution](https://roadmap.sh/projects/quiz-app/solutions?u=6a7dad9acb44947deb3a5f70)
- 🌐 [GitHub Repository](https://github.com/Ch-tril/Quiz-App)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

Feel free to fork, modify, and submit pull requests to improve the quiz content or add new features!

## 📞 Support

For questions or issues, please open an issue on the GitHub repository.

---

**Happy Learning! 🚀**

Start by reading the [DNS_GUIDE.md](./DNS_GUIDE.md) for comprehensive DNS knowledge, then test your understanding with the quiz!
