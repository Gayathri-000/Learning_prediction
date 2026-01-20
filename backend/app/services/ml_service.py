import joblib
import numpy as np
import shap
from typing import List, Dict
from app.models.models import Enrollment, ShapValue, Recommendation
from sqlalchemy.orm import Session
from datetime import datetime
import os

class MLService:
    def __init__(self, model_path='app/ml/xgboost_model.pkl'):
        """Initialize ML service with trained model"""
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model file not found at {model_path}. "
                "Please run ml_training/train_model.py first."
            )
        
        self.model = joblib.load(model_path)
        self.feature_names = [
            'avg_assignment_score', 
            'course_progress', 
            'course_views',
            'resource_clicks', 
            'engagement_frequency'
        ]
        print(f"ML Service initialized with model from {model_path}")
        
    def predict(self, enrollment_data: Dict) -> Dict:
        """
        Make prediction for a student enrollment
        
        Args:
            enrollment_data: Dictionary with feature values
            
        Returns:
            Dictionary with prediction, probability, and SHAP values
        """
        # Prepare features in correct order
        features = np.array([[
            enrollment_data['avg_assignment_score'],
            enrollment_data['course_progress'],
            enrollment_data['course_views'],
            enrollment_data['resource_clicks'],
            enrollment_data['engagement_frequency']
        ]])
        
        # Make prediction
        prediction = self.model.predict(features)[0]
        probability = self.model.predict_proba(features)[0]
        
        # Convert to readable format
        outcome = "Pass" if prediction == 1 else "Fail"
        prob_score = float(probability[1])  # Probability of passing
        
        # Get SHAP values for explainability
        shap_values = self.get_shap_values(features)
        
        return {
            'predicted_outcome': outcome,
            'prediction_probability': prob_score,
            'shap_values': shap_values
        }
    
    def get_shap_values(self, features: np.ndarray) -> List[Dict]:
        """
        Calculate SHAP values for feature importance
        
        Args:
            features: Numpy array of feature values
            
        Returns:
            List of dictionaries with feature names and SHAP values
        """
        # Create SHAP explainer
        explainer = shap.TreeExplainer(self.model)
        shap_vals = explainer.shap_values(features)
        
        # Handle different SHAP output formats
        if isinstance(shap_vals, list):
            shap_vals = shap_vals[1]  # Get values for positive class
        
        # Format results
        shap_results = []
        for i, feature_name in enumerate(self.feature_names):
            shap_results.append({
                'feature_name': feature_name,
                'shap_value': float(shap_vals[0][i])
            })
        
        # Sort by absolute impact
        shap_results.sort(key=lambda x: abs(x['shap_value']), reverse=True)
        return shap_results
    
    def generate_recommendations(
        self, 
        enrollment_data: Dict, 
        shap_values: List[Dict]
    ) -> List[Dict]:
        """
        Generate personalized recommendations based on data and SHAP values
        
        Args:
            enrollment_data: Student's enrollment data
            shap_values: SHAP values from prediction
            
        Returns:
            List of recommendation dictionaries
        """
        recommendations = []
        
        # Check assignment scores
        if enrollment_data['avg_assignment_score'] < 50:
            recommendations.append({
                'recommendation_text': (
                    'Your assignment scores are below average. '
                    'Consider reviewing past materials, attending classes, '
                    'and practicing more problems to improve understanding.'
                ),
                'category': 'assignment'
            })
        elif enrollment_data['avg_assignment_score'] < 70:
            recommendations.append({
                'recommendation_text': (
                    'Your assignment performance is moderate. '
                    'Focus on understanding core concepts and seek help on '
                    'challenging topics to reach excellence.'
                ),
                'category': 'assignment'
            })
        
        # Check course progress
        if enrollment_data['course_progress'] < 40:
            recommendations.append({
                'recommendation_text': (
                    'You are significantly behind on course progress. '
                    'Create a study schedule to complete at least one module '
                    'per week. Contact your instructor if you need deadline extensions.'
                ),
                'category': 'progress'
            })
        elif enrollment_data['course_progress'] < 70:
            recommendations.append({
                'recommendation_text': (
                    'Try to accelerate your course completion. '
                    'Set aside dedicated time each day to work through modules '
                    'and stay on track with the course timeline.'
                ),
                'category': 'progress'
            })
        
        # Check engagement
        if enrollment_data['course_views'] < 30:
            recommendations.append({
                'recommendation_text': (
                    'Low course engagement detected.Attend classes. Regular course visits help '
                    'reinforce learning. Aim for daily check-ins to review materials, '
                    'participate in discussions, and stay connected with course content.'
                ),
                'category': 'engagement'
            })
        
        if enrollment_data['resource_clicks'] < 20:
            recommendations.append({
                'recommendation_text': (
                    'You haven\'t explored many course resources. '
                    'Additional materials like supplementary readings, videos, '
                    'and practice exercises can deepen your understanding.'
                ),
                'category': 'engagement'
            })
        
        if enrollment_data['engagement_frequency'] < 3:
            recommendations.append({
                'recommendation_text': (
                    'Increase your platform activity. Engage with discussion forums, '
                    'ask questions, collaborate with peers, and regularly interact '
                    'with course materials for better learning outcomes.'
                ),
                'category': 'engagement'
            })
        
        # If no issues, provide positive reinforcement
        if not recommendations:
            recommendations.append({
                'recommendation_text': (
                    'Excellent work! You are performing well across all metrics. '
                    'Keep maintaining your study habits and continue engaging '
                    'with the course materials.'
                ),
                'category': 'positive'
            })
        
        return recommendations

# Create global instance
ml_service = MLService()