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
import httpx
import io

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Vercel Blob Configuration
VERCEL_BLOB_TOKEN = os.getenv("BLOB_READ_WRITE_TOKEN", "vercel_blob_rw_SXUrwYO7V6TocBtE_6BIQAIPkVpJkcHquIpNHYlIZkV5zL0")
VERCEL_BLOB_API = "https://blob.vercel-storage.com"

# Store active training jobs
active_jobs = {}
job_progress = {}

# Training Configuration Model
class TrainingConfig(BaseModel):
    dataset_id: str
    dataset_url: str  # Vercel Blob URL
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
            nn.Linear(hidden_size, output_size)
        )

    def forward(self, x):
        return self.network(x)


async def upload_to_vercel_blob(file_content: bytes, filename: str) -> dict:
    """Upload file to Vercel Blob Storage"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"{VERCEL_BLOB_API}/{filename}",
                content=file_content,
                headers={
                    "Authorization": f"Bearer {VERCEL_BLOB_TOKEN}",
                    "x-content-type": "text/csv",
                },
                params={
                    "access": "public"
                },
                timeout=60.0
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Blob upload failed: {response.text}"
                )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")


async def download_from_vercel_blob(blob_url: str) -> bytes:
    """Download file from Vercel Blob Storage"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(blob_url, timeout=60.0)
            
            if response.status_code == 200:
                return response.content
            else:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Blob download failed: {response.text}"
                )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download error: {str(e)}")


async def delete_from_vercel_blob(blob_url: str):
    """Delete file from Vercel Blob Storage"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{VERCEL_BLOB_API}/delete",
                json={"url": blob_url},
                headers={
                    "Authorization": f"Bearer {VERCEL_BLOB_TOKEN}",
                },
                timeout=30.0
            )
            
            return response.status_code == 200
    except Exception as e:
        print(f"Delete error: {str(e)}")
        return False


@app.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    try:
        # Read uploaded file
        contents = await file.read()
        
        # Generate dataset ID
        dataset_id = f"dataset_{uuid.uuid4().hex[:8]}"
        filename = f"datasets/{dataset_id}_{file.filename}"
        
        # Upload to Vercel Blob
        blob_response = await upload_to_vercel_blob(contents, filename)
        
        # Read dataset info
        df = pd.read_csv(io.BytesIO(contents))
        
        return {
            "success": True,
            "data": {
                "id": dataset_id,
                "name": file.filename,
                "size": len(contents),
                "records": len(df),
                "columns": list(df.columns),
                "blobUrl": blob_response.get("url"),
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
        # Download dataset from Vercel Blob
        dataset_content = await download_from_vercel_blob(config.dataset_url)
        
        # Load dataset
        df = pd.read_csv(io.BytesIO(dataset_content))
        print(df.head())

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
        model = SimpleNN(input_size=input_dim).to(device)

        # Regression loss and optimizer
        criterion = nn.MSELoss()
        optimizer = optim.Adam(model.parameters(), lr=float(config.learning_rate))

        # Training loop
        for epoch in range(int(config.epochs)):
            model.train()
            train_loss_sum = 0.0
            train_mae_sum = 0.0
            total_samples = 0

            for batch_X, batch_y in train_loader:
                batch_X = batch_X.to(device)
                batch_y = batch_y.to(device)

                optimizer.zero_grad()
                outputs = model(batch_X)

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

                all_targets = torch.cat(all_targets, dim=0).numpy().reshape(-1)
                preds = []
                with torch.no_grad():
                    for vX, _ in val_loader:
                        vX = vX.to(device)
                        p = model(vX)
                        if p.dim() == 1:
                            p = p.unsqueeze(1)
                        preds.append(p.cpu())
                preds = torch.cat(preds, dim=0).numpy().reshape(-1)

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

            await asyncio.sleep(0.01)

        # Mark as completed
        active_jobs[job_id]["status"] = "completed"
        active_jobs[job_id]["completed_at"] = datetime.now().isoformat()

        # Save model to memory buffer
        model_buffer = io.BytesIO()
        torch.save(model.state_dict(), model_buffer)
        model_buffer.seek(0)
        
        # Upload model to Vercel Blob
        model_filename = f"models/{job_id}_model.pth"
        model_blob = await upload_to_vercel_blob(model_buffer.getvalue(), model_filename)
        
        active_jobs[job_id]["model_url"] = model_blob.get("url")

        return {"status": "ok", "model_url": model_blob.get("url")}

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


ACTIVATION_FUNCTIONS = {
    'ReLU': nn.ReLU,
    'Sigmoid': nn.Sigmoid,
    'Tanh': nn.Tanh,
    'LeakyReLU': nn.LeakyReLU
}


def parse_architecture(arch_string):
    try:
        return json.loads(arch_string)
    except:
        raise ValueError("Invalid architecture format. Use format: [64, 128, 1]")


def create_model(config: ModelConfig):
    arch_layers = parse_architecture(config.architecture)

    if config.model_type == 'classification' or config.model_type == 'regression':
        layers = []
        for i in range(len(arch_layers) - 1):
            layers.append(nn.Linear(arch_layers[i], arch_layers[i + 1]))
            
            if i < len(arch_layers) - 2:
                activation = ACTIVATION_FUNCTIONS.get(config.activation_function, nn.ReLU)
                layers.append(activation())
        
        if config.model_type == 'classification':
            layers.append(nn.Sigmoid())
        
        model = nn.Sequential(*layers)
        
    elif config.model_type == 'cnn':
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
        model = nn.Sequential(
            nn.Linear(arch_layers[0], arch_layers[1] if len(arch_layers) > 1 else 256),
            ACTIVATION_FUNCTIONS.get(config.activation_function, nn.ReLU)(),
            nn.Linear(arch_layers[1] if len(arch_layers) > 1 else 256, arch_layers[-1])
        )
    
    return model


def calculate_model_metrics(model):
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    
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
        model = create_model(config)
        metrics = calculate_model_metrics(model)
        model_id = f"model_{uuid.uuid4().hex[:8]}"
        
        # Save model to buffer
        model_buffer = io.BytesIO()
        torch.save(model.state_dict(), model_buffer)
        model_buffer.seek(0)
        
        # Upload to Vercel Blob
        model_filename = f"models/{model_id}.pth"
        blob_response = await upload_to_vercel_blob(model_buffer.getvalue(), model_filename)
        
        return {
            "success": True,
            "modelId": model_id,
            "modelType": config.model_type,
            "metrics": metrics,
            "architecture": config.architecture,
            "activationFunction": config.activation_function,
            "optimizer": config.optimizer,
            "learningRate": config.learning_rate,
            "modelUrl": blob_response.get("url")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models/{model_id}")
async def get_model_info(model_id: str):
    try:
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
        models = []
        for job_id, job_data in active_jobs.items():
            if job_data.get("status") == "completed" and job_data.get("model_url"):
                models.append({
                    "id": job_id,
                    "status": "ready",
                    "modelUrl": job_data.get("model_url"),
                    "createdAt": job_data.get("completed_at", datetime.now().isoformat())
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