# 🚀 PhishAI Sim: Futuristic Phishing Simulator

**Empowering Security Awareness with AI-Driven Simulations**

Ever wondered how effective your team is at spotting phishing attacks? **PhishAI Sim** is a cutting-edge, easy-to-use platform that lets you create and manage realistic phishing simulations—enhanced by AI—to train and test your organization’s human firewall.

---

## ✨ Key Features

- **🧠 AI-Powered Email Generation**  
  Craft highly convincing phishing emails with Google’s Gemini AI. Just provide a prompt and let the AI do the rest.

- **🌐 Customizable Landing Pages**  
  Simulate a variety of scenarios (fake logins, error pages, software-update prompts) and gauge user reactions.

- **📈 Real-time Analytics Dashboard**  
  Track clicks, credential submissions, and more with dynamic charts and detailed metrics.

- **🚀 Intuitive Campaign Management**  
  Create, launch, and monitor your simulations via a sleek, modern UI.

- **🔒 Secure Data Storage**  
  All templates and results are stored safely in Google Firestore.

- **⚡ Ultrafast & Responsive UI**  
  Built with React and Tailwind CSS for lightning-quick performance on any device.

- **👁️ Live Email Preview**  
  See exactly how your AI-generated emails will appear before you hit “Launch.”

---

## 🛠️ Tech Stack

### Backend (The Brains)  
- **Python & Flask** – API server and AI integration  
- **Google Gemini API** – AI-driven email content  
- **Google Cloud Firestore** – NoSQL datastore  
- **Flask-CORS** – Secure cross-origin communication  

### Frontend (The Face)  
- **React.js** – Dynamic UI components  
- **Tailwind CSS** – Utility-first styling with a futuristic theme  
- **Recharts** – Responsive, interactive charts  
- **Lucide React** – Modern iconography  
- **Firebase SDK** – Real-time data sync & authentication  

---

## 🚀 Quick Start

### 1. Prerequisites

- **Python ≥ 3.9** (with `pip`)  
- **Node.js ≥ 18** (with `npm` or `yarn`)  
- **Git**

### 2. Clone the Repo

```bash
git clone https://github.com/Tillu6/futuristic-phishing-simulator.git
cd futuristic-phishing-simulator
````

### 3. Backend Setup

```bash
cd backend

# Set your Gemini API key:
# Windows PowerShell:
$env:GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
# macOS/Linux:
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

pip install -r requirements.txt
python app.py
```

> 🖥️ The Flask server will run at `http://127.0.0.1:5000`.

### 4. Frontend Setup

```bash
cd ../frontend
npm install

# Initialize Tailwind CSS (if needed):
npx tailwindcss init -p

npm start
```

> 🌐 The React app will open at `http://localhost:3000`.

---

## 💡 Usage

1. **Create a Campaign**

   * Go to **New Campaign**
   * Enter a name, description, and target emails
   * Click **Generate with AI** or write your own email
   * Choose a landing-page type and **Launch**

2. **Simulate & Track**

   * Copy the phishing URL from your campaign dashboard
   * Send it to your test audience
   * Interactions (clicks, credentials) are logged automatically

3. **Analyze Results**

   * Head to **Results**
   * Select any campaign for detailed analytics

---

## 📂 Project Structure

```
phishai-sim/
├── backend/
│   ├── app.py
│   ├── ai_email_generator.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── index.css
│   │   └── components/
│   │       ├── CampaignDashboard.js
│   │       ├── CreateCampaign.js
│   │       ├── EmailEditor.js
│   │       ├── PhishingPageSimulator.js
│   │       ├── ResultsDashboard.js
│   │       └── AuthProvider.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

---

## 🤝 Contributing

1. **Fork** the repo
2. **Create** a branch:

   ```bash
   git checkout -b feature/YourAwesomeFeature
   ```
3. **Commit** your changes:

   ```bash
   git commit -m "feat: Add new simulation landing page"
   ```
4. **Push** to your branch:

   ```bash
   git push origin feature/YourAwesomeFeature
   ```
5. **Open** a Pull Request and describe your improvements!

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

## 📧 Contact

Questions or feedback? Open an issue or reach out at \[[psakethreddy97@gmail.com](mailto:psakethreddy97@gmail.com)].

---

**PhishAI Sim** – Securing the future, one smart simulation at a time!
Made with ❤️ for efficient cybersecurity training.
