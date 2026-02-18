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
import warnings
warnings.filterwarnings('ignore')


def plot_roc_curve(y_test, y_pred_proba, save_path='roc_curve.png'):
    """Plot and save ROC curve"""
    fpr, tpr, thresholds = roc_curve(y_test, y_pred_proba)
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    
    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, color='darkorange', lw=2, 
             label=f'ROC curve (AUC = {roc_auc:.3f})')
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--', 
             label='Random Classifier')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate', fontsize=12)
    plt.ylabel('True Positive Rate', fontsize=12)
    plt.title('Receiver Operating Characteristic (ROC) Curve', fontsize=14, fontweight='bold')
    plt.legend(loc="lower right", fontsize=10)
    plt.grid(True, alpha=0.3)
    
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"   ✓ ROC curve saved: {save_path}")
    plt.close()


def plot_confusion_matrix(y_test, y_pred, save_path='confusion_matrix.png'):
    """Plot and save confusion matrix"""
    cm = confusion_matrix(y_test, y_pred)
    
    plt.figure(figsize=(8, 6))
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title('Confusion Matrix', fontsize=14, fontweight='bold')
    plt.colorbar()
    
    classes = ['Fail', 'Pass']
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes, fontsize=12)
    plt.yticks(tick_marks, classes, fontsize=12)
    
    # Add text annotations
    thresh = cm.max() / 2.
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            plt.text(j, i, format(cm[i, j], 'd'),
                    ha="center", va="center",
                    color="white" if cm[i, j] > thresh else "black",
                    fontsize=20)
    
    plt.ylabel('True Label', fontsize=12)
    plt.xlabel('Predicted Label', fontsize=12)
    plt.tight_layout()
    
    plt.savefig(save_path, dpi=300, bbox_inches='tight')
    print(f"   ✓ Confusion matrix saved: {save_path}")
    plt.close()


def plot_global_shap_importance(model, X_test, feature_columns):
    """Plot global SHAP feature importance"""
    try:
        import shap
        
        print("\n   Generating SHAP explanations...")
        
        # Create explainer
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_test)
        
        # Handle different SHAP output formats
        if isinstance(shap_values, list):
            shap_values = shap_values[1]  # Get values for positive class
        
        # Bar plot
        plt.figure(figsize=(10, 6))
        shap.summary_plot(shap_values, X_test, feature_names=feature_columns, 
                         show=False, plot_type="bar")
        plt.title('Global SHAP Feature Importance', fontsize=14, fontweight='bold')
        plt.tight_layout()
        plt.savefig('global_shap_importance.png', dpi=300, bbox_inches='tight')
        print("   ✓ Global SHAP importance saved: global_shap_importance.png")
        plt.close()
        
        # Beeswarm plot
        plt.figure(figsize=(10, 6))
        shap.summary_plot(shap_values, X_test, feature_names=feature_columns, show=False)
        plt.title('SHAP Summary Plot (Feature Impact Distribution)', fontsize=14, fontweight='bold')
        plt.tight_layout()
        plt.savefig('shap_summary_plot.png', dpi=300, bbox_inches='tight')
        print("   ✓ SHAP summary plot saved: shap_summary_plot.png")
        plt.close()
        
        return explainer, shap_values
        
    except ImportError:
        print("\n   ⚠ SHAP not installed. Skipping SHAP visualizations.")
        print("   Install with: pip install shap")
        return None, None


def create_sample_waterfall_plots(model, X_test, feature_columns):
    """Create SHAP waterfall plots for sample predictions"""
    try:
        import shap
        
        print("\n   Generating sample SHAP waterfall plots...")
        
        # Create explainer
        explainer = shap.TreeExplainer(model)
        
        # Get SHAP values for first 3 test samples
        sample_indices = [0, 1, 2]
        
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
            filename = f'shap_waterfall_sample_{idx+1}.png'
            plt.savefig(filename, dpi=300, bbox_inches='tight')
            plt.close()
        
        print(f"   ✓ Waterfall plots saved: shap_waterfall_sample_1/2/3.png")
        
    except ImportError:
        print("\n   ⚠ SHAP not installed. Skipping waterfall plots.")


def train_model(data_path=r"C:\Users\gayat\Documents\v 14 training\explainable-lms\ml_training\prepared_oulad_dataset.csv"):
    """
    Train XGBoost model for Pass/Fail prediction using OULAD data
    """
    
    print("="*80)
    print(" "*20 + "EXPLAINABLE LMS - ML TRAINING PIPELINE")
    print("="*80)
    print("\nDataset: Open University Learning Analytics Dataset (OULAD)")
    print("Task: Binary Classification (Pass vs Fail)")
    print("Model: XGBoost Classifier with SHAP Explainability")
    
    # Load prepared data
    print("\n" + "="*80)
    print("STEP 1: LOADING DATA")
    print("="*80)
    print(f"\nLoading dataset from: {data_path}")
    
    df = pd.read_csv(data_path)
    
    print(f"✓ Dataset loaded successfully!")
    print(f"  - Total samples: {len(df):,}")
    print(f"  - Total features: {len(df.columns) - 1}")  # Excluding target
    
    # Define features
    feature_columns = [
        'avg_assignment_score', 
        'course_progress', 
        'course_views',
        'resource_clicks'
    ]
    
    X = df[feature_columns]
    y = df['pass']
    
    # Remove any rows with NaN
    mask = ~(X.isna().any(axis=1) | y.isna())
    X = X[mask]
    y = y[mask]
    
    print(f"\n  Target distribution:")
    print(f"  - Pass (1): {y.sum():,} students ({y.mean()*100:.1f}%)")
    print(f"  - Fail (0): {(1-y).sum():,} students ({(1-y).mean()*100:.1f}%)")
    
    # Split data
    print("\n" + "="*80)
    print("STEP 2: SPLITTING DATA")
    print("="*80)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\n  Training set: {len(X_train):,} samples ({len(X_train)/len(X)*100:.1f}%)")
    print(f"  Test set:     {len(X_test):,} samples ({len(X_test)/len(X)*100:.1f}%)")
    print(f"\n  Training pass rate: {y_train.mean()*100:.1f}%")
    print(f"  Test pass rate:     {y_test.mean()*100:.1f}%")
    
    # Train XGBoost model
    print("\n" + "="*80)
    print("STEP 3: TRAINING XGBOOST MODEL")
    print("="*80)
    
    print("\n  Model Configuration:")
    print("  - n_estimators: 100")
    print("  - max_depth: 5")
    print("  - learning_rate: 0.1")
    print("  - random_state: 42")
    
    model = XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42,
        eval_metric='logloss',
        use_label_encoder=False
    )
    
    print("\n  Training model...")
    model.fit(X_train, y_train)
    print("  ✓ Training complete!")
    
    # Make predictions
    print("\n  Generating predictions...")
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    print("  ✓ Predictions generated!")
    
    # Calculate metrics
    print("\n" + "="*80)
    print("STEP 4: MODEL EVALUATION")
    print("="*80)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    
    print("\n┌─────────────────────────────────────────────┐")
    print("│         PERFORMANCE METRICS                 │")
    print("├─────────────────────────────────────────────┤")
    print(f"│  Accuracy:  {accuracy:.4f} ({accuracy*100:>5.2f}%)         │")
    print(f"│  Precision: {precision:.4f} ({precision*100:>5.2f}%)         │")
    print(f"│  Recall:    {recall:.4f} ({recall*100:>5.2f}%)         │")
    print(f"│  F1-Score:  {f1:.4f} ({f1*100:>5.2f}%)         │")
    print(f"│  ROC-AUC:   {roc_auc:.4f} ({roc_auc*100:>5.2f}%)         │")
    print("└─────────────────────────────────────────────┘")
    
    # Performance interpretation
    print("\n  Model Performance Assessment:")
    if roc_auc > 0.9:
        print("  ✓✓✓ OUTSTANDING! Model has excellent discrimination ability!")
    elif roc_auc > 0.8:
        print("  ✓✓ EXCELLENT! Model performs very well!")
    elif roc_auc > 0.7:
        print("  ✓ ACCEPTABLE! Model shows good performance!")
    else:
        print("  ⚠ Model needs improvement. Consider feature engineering or hyperparameter tuning.")
    
    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    print("\n" + "="*80)
    print("CONFUSION MATRIX")
    print("="*80)
    print("\n                  Predicted")
    print("                Fail      Pass")
    print(f"  Actual Fail    {tn:>4d}      {fp:>4d}   (TN: {tn}, FP: {fp})")
    print(f"  Actual Pass    {fn:>4d}      {tp:>4d}   (FN: {fn}, TP: {tp})")
    
    print(f"\n  True Negatives (TN):  {tn:>4d} - Correctly predicted Fail")
    print(f"  False Positives (FP): {fp:>4d} - Incorrectly predicted Pass (Type I Error)")
    print(f"  False Negatives (FN): {fn:>4d} - Incorrectly predicted Fail (Type II Error)")
    print(f"  True Positives (TP):  {tp:>4d} - Correctly predicted Pass")
    
    # Classification Report
    print("\n" + "="*80)
    print("DETAILED CLASSIFICATION REPORT")
    print("="*80)
    print("\n" + classification_report(y_test, y_pred, target_names=['Fail', 'Pass'], digits=4))
    
    # Feature importance
    print("="*80)
    print("FEATURE IMPORTANCE")
    print("="*80)
    print()
    
    feature_importance = sorted(zip(feature_columns, model.feature_importances_), 
                                 key=lambda x: x[1], reverse=True)
    
    for i, (feature, importance) in enumerate(feature_importance, 1):
        bar = '█' * int(importance * 50)
        print(f"  {i}. {feature:30s}: {importance:.4f} {bar}")
    
    # Create visualizations
    print("\n" + "="*80)
    print("STEP 5: GENERATING VISUALIZATIONS")
    print("="*80)
    
    print("\n  Creating plots...")
    plot_roc_curve(y_test, y_pred_proba)
    plot_confusion_matrix(y_test, y_pred)
    
    # SHAP visualizations
    explainer, shap_values = plot_global_shap_importance(model, X_test, feature_columns)
    if explainer is not None:
        create_sample_waterfall_plots(model, X_test, feature_columns)
    
    # Save model
    print("\n" + "="*80)
    print("STEP 6: SAVING MODEL AND METRICS")
    print("="*80)
    
    model_path = 'xgboost_model.pkl'
    joblib.dump(model, model_path)
    print(f"\n  ✓ Model saved: {model_path}")
    
    # Save metrics to file
    metrics_dict = {
        'accuracy': float(accuracy),
        'precision': float(precision),
        'recall': float(recall),
        'f1_score': float(f1),
        'roc_auc': float(roc_auc),
        'confusion_matrix': cm.tolist(),
        'feature_importance': {feat: float(imp) for feat, imp in zip(feature_columns, model.feature_importances_)},
        'dataset_info': {
            'total_samples': int(len(df)),
            'train_samples': int(len(X_train)),
            'test_samples': int(len(X_test)),
            'pass_rate': float(y.mean()),
            'features': feature_columns
        }
    }
    
    import json
    with open('model_metrics.json', 'w') as f:
        json.dump(metrics_dict, f, indent=2)
    
    print(f"  ✓ Metrics saved: model_metrics.json")
    
    # Final summary
    print("\n" + "="*80)
    print("TRAINING COMPLETE! ")
    print("="*80)
    
    print("\n Files Generated:")
    print("  ✓ xgboost_model.pkl - Trained model")
    print("  ✓ model_metrics.json - Performance metrics")
    print("  ✓ roc_curve.png - ROC curve visualization")
    print("  ✓ confusion_matrix.png - Confusion matrix heatmap")
    if explainer is not None:
        print("  ✓ global_shap_importance.png - Feature importance")
        print("  ✓ shap_summary_plot.png - SHAP summary")
        print("  ✓ shap_waterfall_sample_1/2/3.png - Individual explanations")
    
    print("\n Model Performance Summary:")
    print(f"  • Accuracy:  {accuracy*100:.2f}%")
    print(f"  • Precision: {precision*100:.2f}%")
    print(f"  • Recall:    {recall*100:.2f}%")
    print(f"  • F1-Score:  {f1*100:.2f}%")
    print(f"  • ROC-AUC:   {roc_auc*100:.2f}%")
    

    
    print("\n" + "="*80)
    
    return model, metrics_dict


if __name__ == "__main__":
    # Run the training pipeline
    model, metrics = train_model()
    
    print("\n✓ All done! Your model is ready for deployment! ")
