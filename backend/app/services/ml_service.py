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

        #  TEMP DEBUG CHECK (ADD THIS)
        print("Model expects features:", self.model.n_features_in_)
        print("Service provides features:", 4)

        self.feature_names = [
            'avg_assignment_score', 
            'course_progress', 
            'course_views',
            'resource_clicks', 
            #'engagement_frequency'
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
            enrollment_data.get('avg_assignment_score', 0),
            enrollment_data.get('course_progress', 0),      # Includes video completion
            enrollment_data.get('course_views', 0),         # Includes videos watched
            enrollment_data.get('resource_clicks', 0),
            #enrollment_data.get('engagement_frequency', 0)
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
        
        # Calculate SHAP values
        shap_values = explainer.shap_values(features)
        
        # For binary classification, shap_values might be 2D or 3D
        # We want the SHAP values for the positive class (Pass = 1)
        if len(shap_values.shape) == 3:
            shap_values = shap_values[:, :, 1]  # Select positive class
        
        # Create list of feature importances
        feature_importance = []
        for i, feature_name in enumerate(self.feature_names):
            feature_importance.append({
                'feature': feature_name,
                'value': float(features[0][i]),
                'shap_value': float(shap_values[0][i])
            })
        
        # Sort by absolute SHAP value (most important first)
        feature_importance.sort(key=lambda x: abs(x['shap_value']), reverse=True)
        
        return feature_importance
    
    def generate_recommendations(
        self, 
        enrollment_data: Dict, 
        shap_values: List[Dict]
    ) -> List[Dict]:
        """
        Generate personalized recommendations based on data and SHAP values
        Video watching now contributes to course_progress and course_views
        """
        recommendations = []
        
        # Check course progress (now includes video completion percentage)
        if enrollment_data.get('course_progress', 0) < 30:
            recommendations.append({
                'recommendation_text': (
                    f'Low course progress ({enrollment_data.get("course_progress", 0):.1f}%). '
                    f'Make sure to watch course videos and complete assignments regularly. '
                    f'Videos are an important part of your learning - try to watch them fully and complete all coursework.'
                ),
                'category': 'progress'
            })
        elif enrollment_data.get('course_progress', 0) < 60:
            recommendations.append({
                'recommendation_text': (
                    f'Moderate course progress ({enrollment_data.get("course_progress", 0):.1f}%). '
                    f'Keep watching videos and completing coursework to stay on track. '
                    f'Aim for at least 80% completion by watching all videos.'
                ),
                'category': 'progress'
            })
        
        # Check course views (now includes number of videos watched)
        if enrollment_data.get('course_views', 0) < 5:
            recommendations.append({
                'recommendation_text': (
                    f'Low course engagement with only {enrollment_data.get("course_views", 0)} views. '
                    f'Watch more course videos and review materials regularly to improve understanding. '
                    f'Consistent video watching helps reinforce concepts.'
                ),
                'category': 'engagement'
            })
        elif enrollment_data.get('course_views', 0) < 10:
            recommendations.append({
                'recommendation_text': (
                    f'Moderate course engagement ({enrollment_data.get("course_views", 0)} views). '
                    f'Increase your video watching frequency to strengthen understanding. '
                    f'Try to watch at least one video per session.'
                ),
                'category': 'engagement'
            })
        
        # Check assignments
        if enrollment_data.get('avg_assignment_score', 0) < 50:
            recommendations.append({
                'recommendation_text': (
                    f'Low assignment performance ({enrollment_data.get("avg_assignment_score", 0):.1f}%). '
                    f'Review video lectures and course materials before attempting assignments. '
                    f'Consider rewatching difficult sections of videos to clarify concepts.'
                ),
                'category': 'performance'
            })
        elif enrollment_data.get('avg_assignment_score', 0) < 70:
            recommendations.append({
                'recommendation_text': (
                    f'Moderate assignment performance ({enrollment_data.get("avg_assignment_score", 0):.1f}%). '
                    f'You can improve by watching all course videos completely and taking notes. '
                    f'Review video content before tackling assignments.'
                ),
                'category': 'performance'
            })
        
        # Check resource clicks
        if enrollment_data.get('resource_clicks', 0) < 10:
            recommendations.append({
                'recommendation_text': (
                    f'Limited resource usage ({enrollment_data.get("resource_clicks", 0)} clicks). '
                    f'Recommendations:\n'
                    f'Explore course materials, watch videos, and use available resources more frequently. '
                    f'Videos and supplementary materials work together to enhance learning.'
                ),
                'category': 'resources'
            })
        
        # Check engagement frequency
        #if enrollment_data.get('engagement_frequency', 0) < 2:
        #    recommendations.append({
         #       'recommendation_text': (
          #          f'Low engagement frequency ({enrollment_data.get("engagement_frequency", 0)} sessions). '
           #         f'Try to log in and watch videos at least 3-4 times per week '
            
        #        f'to maintain consistent learning momentum.'
         #       ),
          #      'category': 'engagement'
           # })
        
        # Add SHAP-based recommendations
        # Find the most negative SHAP value (biggest factor hurting prediction)
        if shap_values:
            most_negative = min(shap_values, key=lambda x: x['shap_value'])
            
            if most_negative['shap_value'] < -0.1:  # Significant negative impact
                feature_name = most_negative['feature']
                
                if feature_name == 'course_progress':
                    recommendations.append({
                        'recommendation_text': (
                            f'Course progress (including video completion) is your biggest challenge. '
                            f'Focus on watching all course videos completely and finishing assignments. '
                            f'Set a goal to complete at least 2-3 videos per week.'
                        ),
                        'category': 'insight'
                    })
                elif feature_name == 'course_views':
                    recommendations.append({
                        'recommendation_text': (
                            f'Course views (including video watching) needs improvement. '
                            f'Set aside dedicated time each day to watch videos and review materials. '
                            f'Regular viewing helps with retention and understanding.'
                        ),
                        'category': 'insight'
                    })
                elif feature_name == 'avg_assignment_score':
                    recommendations.append({
                        'recommendation_text': (
                            f'Assignment scores need attention. Watch related videos before assignments '
                            f'and review feedback to improve your understanding. '
                            f'Take notes while watching to help with assignments.'
                        ),
                        'category': 'insight'
                    })
                elif feature_name == 'resource_clicks':
                    recommendations.append({
                        'recommendation_text': (
                            f'Resource engagement is a key factor. Explore more course materials, '
                            f'watch all available videos, and actively engage with supplementary content.'
                        ),
                        'category': 'insight'
                    })
                #elif feature_name == 'engagement_frequency':
                 #   recommendations.append({
                  #      'recommendation_text': (
                   #         f'Engagement frequency is critical. Create a study schedule that includes '
                    #        f'watching videos multiple times per week. Consistent engagement leads to better outcomes.'
                     #   ),
                      #  'category': 'insight'
                    #})
        
        # Positive reinforcement if doing well
        if enrollment_data.get('course_progress', 0) >= 80:
            recommendations.append({
                'recommendation_text': (
                    f'Excellent course progress! Keep up the great work watching videos and completing coursework. '
                    f'You\'re on track for success.'
                ),
                'category': 'positive'
            })
        
        if enrollment_data.get('avg_assignment_score', 0) >= 80:
            recommendations.append({
                'recommendation_text': (
                    f'Outstanding assignment performance! Continue watching videos for deeper understanding '
                    f'and maintain this excellent standard.'
                ),
                'category': 'positive'
            })
        
        # Limit to top 5 most important recommendations
        return recommendations[:5]

# Singleton instance
ml_service = MLService()
