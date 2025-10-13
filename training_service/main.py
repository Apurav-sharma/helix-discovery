# training_service/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import pandas as pd
import numpy as np
from typing import Optional
import uuid
from datetime import datetime
import asyncio
import os
import json

app = FastAPI()

# CORS middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# Store active training jobs
active_jobs = {}
job_progress = {}

# Training Configuration Model
class TrainingConfig(BaseModel):
    dataset_id: str
    epochs: int = 100
    batch_size: int = 32
    validation_split: float = 0.2
    gpu_enabled: bool = False
    learning_rate: float = 0.001

# Simple PyTorch Model

class SimpleNN(nn.Module):
    def __init__(self, input_size, hidden_size=64, output_size=1):
        super(SimpleNN, self).__init__()
        
        self.network = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),
            nn.Linear(hidden_size, hidden_size),
            nn.ReLU(),
            nn.Linear(hidden_size, output_size)  # No sigmoid for regression
        )

    def forward(self, x):
        return self.network(x)
    

@app.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    try:
        # Read uploaded file
        contents = await file.read()
        
        # Generate dataset ID
        dataset_id = f"dataset_{uuid.uuid4().hex[:8]}"
        
        # Save file temporarily (in production, save to disk/S3)
        os.makedirs("tmp", exist_ok=True)
        
        # Save file locally
        file_path = os.path.join("tmp", f"{dataset_id}.csv")
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Read and show dataset
        df = pd.read_csv(file_path)
        # print(df.head())
        
        return {
            "success": True,
            "data": {
                "id": dataset_id,
                "name": file.filename,
                "size": len(contents),
                "records": len(df),
                "columns": list(df.columns),
                "uploadedAt": datetime.now().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
async def start_training(config: TrainingConfig):
    try:
        job_id = f"job_{uuid.uuid4().hex[:8]}"
        
        # Initialize job
        active_jobs[job_id] = {
            "status": "running",
            "config": config.dict(),
            "started_at": datetime.now().isoformat()
        }
        
        job_progress[job_id] = {
            "current_epoch": 0,
            "total_epochs": config.epochs,
            "progress": 0,
            "metrics": {
                "loss": 0.0,
                "accuracy": 0.0,
                "val_loss": 0.0,
                "val_accuracy": 0.0
            }
        }
        
        # Start training in background
        asyncio.create_task(train_model(job_id, config))
        
        return {
            "success": True,
            "data": {
                "job_id": job_id,
                "status": "running",
                "message": "Training started"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def train_model(job_id: str, config: TrainingConfig):
    try:
        # Resolve dataset path safely (relative "tmp" directory)
        file_path = os.path.join("tmp", f"{config.dataset_id}.csv")
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Dataset file not found: {file_path}")

        # Load dataset
        df = pd.read_csv(file_path)

        # Basic sanity checks
        if df.shape[0] == 0:
            raise ValueError("Dataset is empty")
        if df.shape[1] < 2:
            raise ValueError("Dataset must have at least one feature column and one target column")

        # Prepare data (assume last column is target)
        X = df.iloc[:, :-1].values.astype(float)
        y = df.iloc[:, -1].values.astype(float).reshape(-1, 1)

        # Convert to tensors
        X_tensor = torch.tensor(X, dtype=torch.float32)
        y_tensor = torch.tensor(y, dtype=torch.float32)

        # Split data
        val_split = float(config.validation_split)
        if not (0.0 <= val_split < 1.0):
            raise ValueError("validation_split must be in [0.0, 1.0)")

        split_idx = int(len(X_tensor) * (1 - val_split))
        if split_idx <= 0:
            raise ValueError("validation_split is too large; no training samples remain")

        X_train, X_val = X_tensor[:split_idx], X_tensor[split_idx:]
        y_train, y_val = y_tensor[:split_idx], y_tensor[split_idx:]

        # Create dataloaders
        train_dataset = TensorDataset(X_train, y_train)
        train_loader = DataLoader(train_dataset, batch_size=int(config.batch_size), shuffle=True)

        val_loader = None
        if len(X_val) > 0:
            val_dataset = TensorDataset(X_val, y_val)
            val_loader = DataLoader(val_dataset, batch_size=int(config.batch_size), shuffle=False)

        # Initialize model and device
        input_dim = X.shape[1]
        device = torch.device("cuda" if (config.gpu_enabled and torch.cuda.is_available()) else "cpu")
        model = SimpleNN(input_size=input_dim).to(device)  # ensure SimpleNN returns raw regression outputs (no final activation)

        # Regression loss and optimizer
        criterion = nn.MSELoss()
        optimizer = optim.Adam(model.parameters(), lr=float(config.learning_rate))

        # Training loop
        for epoch in range(int(config.epochs)):
            model.train()
            train_loss_sum = 0.0  # sum of mse * batch_size
            train_mae_sum = 0.0
            total_samples = 0

            for batch_X, batch_y in train_loader:
                batch_X = batch_X.to(device)
                batch_y = batch_y.to(device)

                optimizer.zero_grad()
                outputs = model(batch_X)

                # Normalize shapes to (N,1)
                if outputs.dim() == 1:
                    outputs = outputs.unsqueeze(1)
                if batch_y.dim() == 1:
                    batch_y = batch_y.unsqueeze(1)

                loss = criterion(outputs, batch_y)
                loss.backward()
                optimizer.step()

                bsize = batch_X.size(0)
                train_loss_sum += loss.item() * bsize
                train_mae_sum += torch.abs(outputs - batch_y).sum().item()
                total_samples += bsize

            # Compute average training metrics
            avg_train_mse = train_loss_sum / total_samples if total_samples > 0 else 0.0
            avg_train_mae = train_mae_sum / total_samples if total_samples > 0 else 0.0

            # Validation
            val_mse = None
            val_mae = None
            val_r2 = None
            if val_loader is not None and len(val_loader.dataset) > 0:
                model.eval()
                val_loss_sum = 0.0
                val_mae_sum = 0.0
                val_total = 0
                all_targets = []
                with torch.no_grad():
                    for vX, vy in val_loader:
                        vX = vX.to(device)
                        vy = vy.to(device)

                        voutputs = model(vX)
                        if voutputs.dim() == 1:
                            voutputs = voutputs.unsqueeze(1)
                        if vy.dim() == 1:
                            vy = vy.unsqueeze(1)

                        vloss = criterion(voutputs, vy)
                        bsize = vX.size(0)
                        val_loss_sum += vloss.item() * bsize
                        val_mae_sum += torch.abs(voutputs - vy).sum().item()
                        val_total += bsize
                        all_targets.append(vy.cpu())

                val_mse = val_loss_sum / val_total if val_total > 0 else 0.0
                val_mae = val_mae_sum / val_total if val_total > 0 else 0.0

                # Compute R^2 on validation set: 1 - SSE/SST
                all_targets = torch.cat(all_targets, dim=0).numpy().reshape(-1)
                # Re-run predictions on full val set on CPU to compute SST/SSE robustly
                preds = []
                with torch.no_grad():
                    for vX, _ in val_loader:
                        vX = vX.to(device)
                        p = model(vX)
                        if p.dim() == 1:
                            p = p.unsqueeze(1)
                        preds.append(p.cpu())
                preds = torch.cat(preds, dim=0).numpy().reshape(-1)

                # handle constant target case
                sse = float(((all_targets - preds) ** 2).sum())
                sst = float(((all_targets - all_targets.mean()) ** 2).sum())
                val_r2 = 1.0 - (sse / sst) if sst != 0 else float("nan")

            # Update progress
            job_progress[job_id] = {
                "current_epoch": epoch + 1,
                "total_epochs": int(config.epochs),
                "progress": int((epoch + 1) / int(config.epochs) * 100),
                "metrics": {
                    "train_mse": round(avg_train_mse, 6),
                    "train_mae": round(avg_train_mae, 6),
                    "val_mse": round(val_mse, 6) if val_mse is not None else None,
                    "val_mae": round(val_mae, 6) if val_mae is not None else None,
                    "val_r2": round(val_r2, 6) if val_r2 is not None and not (isinstance(val_r2, float) and str(val_r2) == "nan") else None
                }
            }

            # allow other tasks to run
            await asyncio.sleep(0.01)

        # Mark as completed
        active_jobs[job_id]["status"] = "completed"
        active_jobs[job_id]["completed_at"] = datetime.now().isoformat()

        # Save model
        save_dir = "models"
        os.makedirs(save_dir, exist_ok=True)
        model_path = os.path.join(save_dir, f"{job_id}_model.pth")
        torch.save(model.state_dict(), model_path)
        active_jobs[job_id]["model_path"] = model_path

        return {"status": "ok", "model_path": model_path}

    except Exception as e:
        active_jobs.setdefault(job_id, {})
        active_jobs[job_id]["status"] = "failed"
        active_jobs[job_id]["error"] = str(e)
        return {"status": "error", "error": str(e)}


@app.get("/progress/{job_id}")
async def get_progress(job_id: str):
    if job_id not in job_progress:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {
        "success": True,
        "data": {
            "job_id": job_id,
            "status": active_jobs[job_id]["status"],
            **job_progress[job_id]
        }
    }

@app.get("/jobs")
async def get_all_jobs():
    jobs = []
    for job_id, job_data in active_jobs.items():
        progress_data = job_progress.get(job_id, {})
        jobs.append({
            "id": job_id,
            "status": job_data["status"],
            "started_at": job_data["started_at"],
            **progress_data
        })
    
    return {
        "success": True,
        "data": jobs
    }


# Model Configuration
class ModelConfig(BaseModel):
    model_type: str
    architecture: str
    activation_function: str
    optimizer: str
    learning_rate: float

# Activation functions mapping
ACTIVATION_FUNCTIONS = {
    'ReLU': nn.ReLU,
    'Sigmoid': nn.Sigmoid,
    'Tanh': nn.Tanh,
    'LeakyReLU': nn.LeakyReLU
}

def parse_architecture(arch_string):
    """Parse architecture string like '[64, 128, 1]' into list"""
    try:
        return json.loads(arch_string)
    except:
        raise ValueError("Invalid architecture format. Use format: [64, 128, 1]")

def create_model(config: ModelConfig):
    """Create PyTorch model based on configuration"""
    arch_layers = parse_architecture(config.architecture)
    
    if config.model_type == 'classification' or config.model_type == 'regression':
        # Create Sequential model
        layers = []
        for i in range(len(arch_layers) - 1):
            layers.append(nn.Linear(arch_layers[i], arch_layers[i + 1]))
            
            # Add activation function (except for last layer)
            if i < len(arch_layers) - 2:
                activation = ACTIVATION_FUNCTIONS.get(config.activation_function, nn.ReLU)
                layers.append(activation())
        
        # Add output activation based on model type
        if config.model_type == 'classification':
            layers.append(nn.Sigmoid())
        
        model = nn.Sequential(*layers)
        
    elif config.model_type == 'cnn':
        # Simple CNN architecture
        model = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            ACTIVATION_FUNCTIONS.get(config.activation_function, nn.ReLU)(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            ACTIVATION_FUNCTIONS.get(config.activation_function, nn.ReLU)(),
            nn.MaxPool2d(2),
            nn.Flatten(),
            nn.Linear(64 * 8 * 8, arch_layers[0] if arch_layers else 128),
            ACTIVATION_FUNCTIONS.get(config.activation_function, nn.ReLU)(),
            nn.Linear(arch_layers[0] if arch_layers else 128, arch_layers[-1])
        )
        
    elif config.model_type == 'transformer':
        # Simple transformer-like model
        model = nn.Sequential(
            nn.Linear(arch_layers[0], arch_layers[1] if len(arch_layers) > 1 else 256),
            ACTIVATION_FUNCTIONS.get(config.activation_function, nn.ReLU)(),
            nn.Linear(arch_layers[1] if len(arch_layers) > 1 else 256, arch_layers[-1])
        )
    
    return model

def calculate_model_metrics(model):
    """Calculate model parameters and size"""
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    
    # Calculate model size in MB
    param_size = sum(p.nelement() * p.element_size() for p in model.parameters())
    buffer_size = sum(b.nelement() * b.element_size() for b in model.buffers())
    size_mb = (param_size + buffer_size) / (1024 ** 2)
    
    return {
        'totalParameters': total_params,
        'trainableParameters': trainable_params,
        'modelSize': round(size_mb, 2)
    }

@app.post("/models/build")
async def build_model(config: ModelConfig):
    try:
        # Create model
        model = create_model(config)
        
        # Calculate metrics
        metrics = calculate_model_metrics(model)
        
        # Generate model ID
        model_id = f"model_{uuid.uuid4().hex[:8]}"
        
        # Save model
        model_path = f"models/{model_id}.pth"
        torch.save(model.state_dict(), model_path)
        
        return {
            "success": True,
            "modelId": model_id,
            "modelType": config.model_type,
            "metrics": metrics,
            "architecture": config.architecture,
            "activationFunction": config.activation_function,
            "optimizer": config.optimizer,
            "learningRate": config.learning_rate
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models/{model_id}")
async def get_model_info(model_id: str):
    try:
        model_path = f"/tmp/{model_id}.pth"
        
        if not os.path.exists(model_path):
            raise HTTPException(status_code=404, detail="Model not found")
        
        # Load model and get info
        # This is simplified - in production you'd store metadata separately
        return {
            "success": True,
            "modelId": model_id,
            "status": "ready"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models")
async def list_models():
    try:
        # List all saved models
        import os
        model_files = [f for f in os.listdir("/tmp") if f.startswith("model_") and f.endswith(".pth")]
        
        models = []
        for model_file in model_files:
            model_id = model_file.replace(".pth", "")
            models.append({
                "id": model_id,
                "status": "ready",
                "createdAt": datetime.now().isoformat()
            })
        
        return {
            "success": True,
            "data": models
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)