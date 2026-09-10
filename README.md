# EduPredict: Student Performance Prediction System

> An explainable machine learning system that predicts student outcomes and delivers personalized recommendations using the OULAD dataset.

---

## 📌 Overview

EduPredict is a web-based Learning Management System that predicts whether a student will **Pass or Fail** based on their learning behavior and academic performance. It combines ensemble machine learning models with **SHAP-based explainability** to provide transparent, interpretable, and actionable insights for both students and instructors.

---

## 🎯 Features

- 🔮 **Outcome Prediction** — Predicts Pass/Fail with confidence score
- 🧠 **Explainability** — SHAP waterfall and feature importance plots
- 📊 **Personalized Recommendations** — Targeted interventions based on negative SHAP contributors
- 👨‍🏫 **Instructor Dashboard** — Class summary, student records, test results
- 👨‍🎓 **Student Dashboard** — Course progress, prediction output, Q&A
- ⚖️ **Class Balancing** — SMOTE applied to handle imbalanced data
- 🔐 **Role-Based Access** — Separate views for students and instructors

---

## 🤖 Machine Learning Models

Three model configurations are supported:

| Type | Models | Ensemble |
|------|--------|----------|
| Type A | XGBoost | Standalone |
| Type B | XGBoost + Random Forest + LightGBM | Soft Voting |
| Type C | XGBoost + Random Forest + Decision Tree + Logistic Regression | Soft Voting |

---

## 📈 Results

| Model | Accuracy | Recall | F1-Score | ROC-AUC |
|-------|----------|--------|----------|---------|
| Type A (XGBoost) | 89.1% | 92.81% | 88.94% | 0.95 |
| Type B (Ensemble) | 88.0% | 97.00% | 88.00% | 0.95 |
| Type C (Ensemble) | 89.05% | 93.73% | 88.98% | 0.95 |

---

## 🗂️ Dataset

This project uses the **Open University Learning Analytics Dataset (OULAD)**.

| Feature | Description |
|---------|-------------|
| `avg_assignment_score` | Average score on assignments (0–100) |
| `course_progress` | Percentage of content completed (0–1) |
| `course_views` | Total video view events |
| `resource_clicks` | Total resource click events |

---

## 🏗️ System Overview

Student Logs
│
▼
Data Preprocessing (Merge CSVs → Clean → Normalise → SMOTE)
│
▼
ML Models (Type A / Type B / Type C)
│
▼
Trained Model → SHAP Tree Explainer → Recommendation Engine
│
▼
Dashboard (Student View / Instructor View)


---
## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js |
| Backend | Python, Flask |
| ML Models | XGBoost, LightGBM, Random Forest, Logistic Regression, Decision Tree |
| Explainability | SHAP (TreeSHAP) |
| Data Balancing | SMOTE (imbalanced-learn) |
| Visualization | Matplotlib |
| Dataset | OULAD (Open University Learning Analytics Dataset) |

---

## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/edupredict.git
cd edupredict

# Install backend dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install

# Run the backend
python app.py

# Run the frontend
npm start
```

---

## 📁 Project Structure

edupredict/
├── backend/
│ ├── models/ # Trained ML models
│ ├── shap/ # SHAP explainability scripts
│ ├── recommendations/ # Recommendation engine
│ └── app.py # Flask API
├── frontend/
│ ├── src/
│ │ ├── components/ # React components
│ │ └── pages/ # Dashboard pages
├── data/
│ └── oulad/ # OULAD dataset CSVs
├── notebooks/ # Training and analysis notebooks
└── README.md


---

## 👥 Team

| Name | Role |
|------|------|
| Gayathri G | ML Model Development |
| Arya K J | Backend Development |
| Ashvin Thadevoos | Frontend Development |
| Shehin T Shaji | Data Processing & SHAP |

**Project Guide:** Ms. Raheena Salihin  
**Institution:** Government Model Engineering College  
**Department:** Computer Science and Engineering  
**Year:** 2025–2026

---

## 📄 License

This project is for academic purposes only.
