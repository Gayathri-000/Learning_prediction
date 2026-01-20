import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, 
    precision_score, 
    recall_score, 
    f1_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
    roc_curve
)
import joblib
import os
import matplotlib.pyplot as plt

def create_sample_data():
    """
    Create synthetic training data that mimics OULAD structure
    In production, replace this with actual OULAD dataset
    """
    print("Generating sample training data...")
    np.random.seed(42)
    n_samples = 1000
    
    data = {
        'avg_assignment_score': np.random.uniform(0, 100, n_samples),
        'course_progress': np.random.uniform(0, 100, n_samples),
        'course_views': np.random.randint(0, 200, n_samples),
        'resource_clicks': np.random.randint(0, 150, n_samples),
        'engagement_frequency': np.random.uniform(0, 10, n_samples)
    }
    
    df = pd.DataFrame(data)
    
    # Create target variable based on features
    # Students pass if they meet certain criteria
    df['pass'] = (
        (df['avg_assignment_score'] > 50) & 
        (df['course_progress'] > 40) & 
        (df['course_views'] > 30)
    ).astype(int)
    
    print(f"Generated {n_samples} samples")
    print(f"Pass rate: {df['pass'].mean()*100:.2f}%")
    print(f"Pass count: {df['pass'].sum()}")
    print(f"Fail count: {(1-df['pass']).sum()}")
    
    return df

def plot_roc_curve(y_test, y_pred_proba):
    """Plot ROC curve"""
    fpr, tpr, thresholds = roc_curve(y_test, y_pred_proba)
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    
    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, color='darkorange', lw=2, 
             label=f'ROC curve (AUC = {roc_auc:.3f})')
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--', 
             label='Random Classifier')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Receiver Operating Characteristic (ROC) Curve')
    plt.legend(loc="lower right")
    plt.grid(True, alpha=0.3)
    
    # Save plot
    plt.savefig('roc_curve.png', dpi=300, bbox_inches='tight')
    print("\nROC curve saved as 'roc_curve.png'")
    plt.close()

def plot_confusion_matrix(y_test, y_pred):
    """Plot confusion matrix"""
    cm = confusion_matrix(y_test, y_pred)
    
    plt.figure(figsize=(8, 6))
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title('Confusion Matrix')
    plt.colorbar()
    
    classes = ['Fail', 'Pass']
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes)
    plt.yticks(tick_marks, classes)
    
    # Add text annotations
    thresh = cm.max() / 2.
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            plt.text(j, i, format(cm[i, j], 'd'),
                    ha="center", va="center",
                    color="white" if cm[i, j] > thresh else "black",
                    fontsize=20)
    
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    
    # Save plot
    plt.savefig('confusion_matrix.png', dpi=300, bbox_inches='tight')
    print("Confusion matrix saved as 'confusion_matrix.png'")
    plt.close()

def plot_global_shap_importance(model, X_test, feature_columns):
    """Plot global SHAP feature importance"""
    import shap
    
    print("Generating global SHAP feature importance plot...")
    
    # Create explainer
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_test)
    
    # Handle different SHAP output formats
    if isinstance(shap_values, list):
        shap_values = shap_values[1]  # Get values for positive class
    
    # Summary plot (beeswarm)
    plt.figure(figsize=(10, 6))
    shap.summary_plot(shap_values, X_test, feature_names=feature_columns, 
                     show=False, plot_type="bar")
    plt.title('Global SHAP Feature Importance', fontsize=14, fontweight='bold')
    plt.tight_layout()
    plt.savefig('global_shap_importance.png', dpi=300, bbox_inches='tight')
    print("Global SHAP importance plot saved as 'global_shap_importance.png'")
    plt.close()
    
    # Summary plot (dot)
    plt.figure(figsize=(10, 6))
    shap.summary_plot(shap_values, X_test, feature_names=feature_columns, show=False)
    plt.title('SHAP Summary Plot (Feature Impact Distribution)', fontsize=14, fontweight='bold')
    plt.tight_layout()
    plt.savefig('shap_summary_plot.png', dpi=300, bbox_inches='tight')
    print("SHAP summary plot saved as 'shap_summary_plot.png'")
    plt.close()

def create_sample_waterfall_plot(model, X_test, feature_columns):
    """Create SHAP waterfall plot for sample predictions"""
    import shap
    
    print("Generating sample SHAP waterfall plots...")
    
    # Create explainer
    explainer = shap.TreeExplainer(model)
    
    # Get SHAP values for first 3 test samples
    sample_indices = [0, 1, 2]  # High performer, at-risk, borderline
    
    for idx in sample_indices:
        shap_values = explainer.shap_values(X_test.iloc[idx:idx+1])
        
        # Handle different SHAP output formats
        if isinstance(shap_values, list):
            shap_values = shap_values[1]  # Get values for positive class
        
        # Create explanation object
        explanation = shap.Explanation(
            values=shap_values[0],
            base_values=explainer.expected_value if not isinstance(explainer.expected_value, list) else explainer.expected_value[1],
            data=X_test.iloc[idx].values,
            feature_names=feature_columns
        )
        
        # Plot waterfall
        plt.figure(figsize=(10, 6))
        shap.waterfall_plot(explanation, show=False)
        plt.title(f'SHAP Waterfall Plot - Student Sample {idx+1}', 
                 fontsize=14, fontweight='bold')
        plt.tight_layout()
        plt.savefig(f'shap_waterfall_sample_{idx+1}.png', dpi=300, bbox_inches='tight')
        plt.close()
    
    print(f"Waterfall plots saved as 'shap_waterfall_sample_1/2/3.png'")
def train_model():
    """Train XGBoost model for Pass/Fail prediction"""
    
    # Create or load data
    df = create_sample_data()
    
    # Separate features and target
    feature_columns = [
        'avg_assignment_score', 
        'course_progress', 
        'course_views',
        'resource_clicks', 
        'engagement_frequency'
    ]
    
    X = df[feature_columns]
    y = df['pass']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\nTraining set size: {len(X_train)}")
    print(f"Test set size: {len(X_test)}")
    print(f"Training set pass rate: {y_train.mean()*100:.2f}%")
    print(f"Test set pass rate: {y_test.mean()*100:.2f}%")
    
    # Train XGBoost model
    print("\nTraining XGBoost model...")
    model = XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42,
        eval_metric='logloss'
    )
    
    model.fit(X_train, y_train)
    print("Training complete!")
    
    # Make predictions
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]  # Probability of passing
    
    # Calculate metrics
    print("\n" + "="*60)
    print("MODEL EVALUATION METRICS")
    print("="*60)
    
    # 1. Accuracy
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n1. ACCURACY: {accuracy:.4f} ({accuracy*100:.2f}%)")
    print("   Definition: Overall correctness of predictions")
    print(f"   Formula: (TP + TN) / (TP + TN + FP + FN)")
    
    # 2. Precision
    precision = precision_score(y_test, y_pred)
    print(f"\n2. PRECISION: {precision:.4f} ({precision*100:.2f}%)")
    print("   Definition: Of all predicted PASS, how many are actually PASS?")
    print(f"   Formula: TP / (TP + FP)")
    print(f"   Interpretation: {precision*100:.1f}% of students predicted to pass actually pass")
    
    # 3. Recall (Sensitivity/True Positive Rate)
    recall = recall_score(y_test, y_pred)
    print(f"\n3. RECALL: {recall:.4f} ({recall*100:.2f}%)")
    print("   Definition: Of all actual PASS students, how many did we predict correctly?")
    print(f"   Formula: TP / (TP + FN)")
    print(f"   Interpretation: Model catches {recall*100:.1f}% of students who will pass")
    
    # 4. F1-Score
    f1 = f1_score(y_test, y_pred)
    print(f"\n4. F1-SCORE: {f1:.4f}")
    print("   Definition: Harmonic mean of Precision and Recall")
    print(f"   Formula: 2 * (Precision * Recall) / (Precision + Recall)")
    
    # 5. ROC-AUC
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    print(f"\n5. ROC-AUC: {roc_auc:.4f} ({roc_auc*100:.2f}%)")
    print("   Definition: Area Under the ROC Curve")
    print("   Interpretation:")
    print("   - 0.5: Random classifier (no better than coin flip)")
    print("   - 0.7-0.8: Acceptable")
    print("   - 0.8-0.9: Excellent")
    print("   - 0.9-1.0: Outstanding")
    if roc_auc > 0.9:
        print("   ✓ Your model has OUTSTANDING discrimination ability!")
    elif roc_auc > 0.8:
        print("   ✓ Your model has EXCELLENT discrimination ability!")
    elif roc_auc > 0.7:
        print("   ✓ Your model has ACCEPTABLE discrimination ability!")
    else:
        print("   ⚠ Your model needs improvement")
    
    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    print("\n" + "="*60)
    print("CONFUSION MATRIX")
    print("="*60)
    print("\n                Predicted")
    print("              Fail    Pass")
    print(f"Actual Fail    {cm[0,0]:4d}    {cm[0,1]:4d}  (True Negatives, False Positives)")
    print(f"Actual Pass    {cm[1,0]:4d}    {cm[1,1]:4d}  (False Negatives, True Positives)")
    
    tn, fp, fn, tp = cm.ravel()
    print(f"\nTrue Negatives (TN):  {tn} - Correctly predicted Fail")
    print(f"False Positives (FP): {fp} - Incorrectly predicted Pass")
    print(f"False Negatives (FN): {fn} - Incorrectly predicted Fail")
    print(f"True Positives (TP):  {tp} - Correctly predicted Pass")
    
    # Classification Report
    print("\n" + "="*60)
    print("DETAILED CLASSIFICATION REPORT")
    print("="*60)
    print(classification_report(y_test, y_pred, target_names=['Fail', 'Pass']))
    
    # Feature importance
    print("="*60)
    print("FEATURE IMPORTANCE")
    print("="*60)
    for feature, importance in zip(feature_columns, model.feature_importances_):
        print(f"{feature:30s}: {importance:.4f} {'█' * int(importance * 50)}")
    
    # Create visualizations
    print("\n" + "="*60)
    print("GENERATING VISUALIZATIONS")
    print("="*60)
    plot_roc_curve(y_test, y_pred_proba)
    plot_confusion_matrix(y_test, y_pred)
    plot_global_shap_importance(model, X_test, feature_columns)
    create_sample_waterfall_plot(model, X_test, feature_columns)
    # Save model
    model_path = '../backend/app/ml/xgboost_model.pkl'
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump(model, model_path)
    
    # Save metrics to file
    metrics_dict = {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1,
        'roc_auc': roc_auc,
        'confusion_matrix': cm.tolist()
    }
    
    import json
    with open('model_metrics.json', 'w') as f:
        json.dump(metrics_dict, f, indent=2)
    
    print(f"\n✓ Model saved to: {model_path}")
    print("✓ Metrics saved to: model_metrics.json")
    print("✓ ROC curve saved to: roc_curve.png")
    print("✓ Confusion matrix saved to: confusion_matrix.png")
    print("✓ Global SHAP importance saved to: global_shap_importance.png")
    print("✓ SHAP summary plot saved to: shap_summary_plot.png")
    print("✓ SHAP waterfall samples saved to: shap_waterfall_sample_1/2/3.png")
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    print(f"ROC-AUC:   {roc_auc:.4f}")
    print("="*60)

if __name__ == "__main__":
    print("="*60)
    print("EXPLAINABLE LMS - MODEL TRAINING & EVALUATION")
    print("="*60)
    train_model()
    print("\n✓ Training pipeline complete!")