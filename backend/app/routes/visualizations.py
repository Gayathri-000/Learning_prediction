from fastapi import APIRouter
from fastapi.responses import FileResponse
import os

router = APIRouter(prefix="/visualizations", tags=["visualizations"])

@router.get("/global-shap")
def get_global_shap():
    """Get global SHAP feature importance plot"""
    plot_path = os.path.join('..', 'ml_training', 'global_shap_importance.png')
    
    if not os.path.exists(plot_path):
        return {"error": "Global SHAP plot not found. Please train the model first."}
    
    return FileResponse(plot_path, media_type="image/png")

@router.get("/shap-summary")
def get_shap_summary():
    """Get SHAP summary plot"""
    plot_path = os.path.join('..', 'ml_training', 'shap_summary_plot.png')
    
    if not os.path.exists(plot_path):
        return {"error": "SHAP summary plot not found. Please train the model first."}
    
    return FileResponse(plot_path, media_type="image/png")

@router.get("/waterfall/{sample_id}")
def get_waterfall_plot(sample_id: int):
    """Get SHAP waterfall plot for sample"""
    if sample_id not in [1, 2, 3]:
        return {"error": "Sample ID must be 1, 2, or 3"}
    
    plot_path = os.path.join('..', 'ml_training', f'shap_waterfall_sample_{sample_id}.png')
    
    if not os.path.exists(plot_path):
        return {"error": f"Waterfall plot {sample_id} not found. Please train the model first."}
    
    return FileResponse(plot_path, media_type="image/png")