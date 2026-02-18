🎓 Explainable LMS – Intelligent Student Performance Prediction System
📌 Overview

This project is a full-stack Learning Management System (LMS) integrated with an Explainable Machine Learning model to predict student academic performance.

The system allows:

🎥 Students to watch course videos

📚 Access learning resources

📝 Attend online tests

📊 Receive performance-based predictions

👩‍🏫 Teachers to view predictions and recommendations

The prediction model is built using XGBoost and achieves an accuracy of 89%.

🚀 Core Features
👨‍🎓 Student Features

User authentication (Login / Signup)

Course enrollment

Watch course videos

Access course resources

Attend online tests

View test results

Receive predicted performance (Pass / Fail)

👩‍🏫 Teacher Features

Create and manage courses

Upload videos & resources

Create and manage tests

View student submissions

Access student performance predictions

View ML-based recommendations

Analyze student risk levels

🧠 Machine Learning Module

The system includes a trained XGBoost Classifier that:

Predicts student academic outcome (Pass / Fail)

Uses engagement & performance features

Provides interpretable insights using SHAP

📊 Model Performance
Metric	Value
Accuracy	89%
Model	XGBoost Classifier
Type	Binary Classification
🔍 Explainability with SHAP

To ensure transparency, the system integrates SHAP (SHapley Additive exPlanations):

Global feature importance visualization

SHAP summary plots

Individual student-level waterfall plots

Clear explanation of prediction reasoning

This enables teachers to understand why a student is predicted to pass or fail.

🏗️ Project Architecture
Project Root/
│
├── frontend/        # React-based UI
│
├── backend/         # API and LMS logic
│
├── ml_training/     # XGBoost model training & SHAP analysis
│   ├── train_model.py
│   ├── xgboost_model.pkl
│   ├── model_metrics.json
│   ├── shap plots
│   └── evaluation graphs
│
├── requirements.txt
├── README.md
└── .gitignore

⚙️ Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

2️⃣ Backend Setup
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt


Run backend:

python app.py

3️⃣ Frontend Setup
cd frontend
npm install
npm run dev

🎯 System Objectives

Improve academic performance prediction

Provide transparent AI-based insights

Support teachers in identifying at-risk students

Enhance digital learning environments

Integrate ML with real LMS workflows

🔮 Future Enhancements

Cloud deployment

Personalized adaptive learning paths

Analytics dashboard for administrators

👩‍💻 Contributors

Gayathri G
Arya KJ
Shehin T Shaji
Asvin Thadevoos

📄 License

Developed for academic and research purposes.
