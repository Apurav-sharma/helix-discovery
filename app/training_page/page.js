'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';

const TrainingPage = () => {
    const [uploadedDataset, setUploadedDataset] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [trainingJob, setTrainingJob] = useState(null);
    const [progress, setProgress] = useState(null);
    const [config, setConfig] = useState({
        epochs: 100,
        batchSize: 32,
        validationSplit: 0.2,
        gpuEnabled: false
    });
    const fileInputRef = useRef(null);

    // Poll for training progress
    useEffect(() => {
        if (!trainingJob?.job_id) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/training/progress/${trainingJob.job_id}`);
                const data = await res.json();

                if (data.success) {
                    setProgress(data.data);

                    // console.log(data.data);

                    // Stop polling if completed or failed
                    if (data.data.status === 'completed' || data.data.status === 'failed') {
                        clearInterval(interval);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch progress:', error);
            }
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(interval);
    }, [trainingJob]);

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/training/upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            console.log(data);

            if (data.success) {
                setUploadedDataset(data.data);
                alert('Dataset uploaded successfully!');
            } else {
                alert('Upload failed: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleStartTraining = async () => {
        if (!uploadedDataset) {
            alert('Please upload a dataset first!');
            return;
        }

        try {
            const res = await fetch('/api/training/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    datasetId: uploadedDataset._id,
                    ...config
                })
            });

            const data = await res.json();

            if (data.success) {
                setTrainingJob(data.data);
                alert('Training started!');
            } else {
                alert('Failed to start training: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Training error:', error);
            alert('Failed to start training: ' + error.message);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const mb = bytes / (1024 * 1024);
        return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
    };

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-8">Training Interface</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Dataset Upload */}
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold text-white mb-6">Dataset Upload</h3>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.json,.parquet,.vcf,.fastq"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-700 rounded-lg p-12 text-center hover:border-indigo-500 transition-all cursor-pointer"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-12 h-12 text-indigo-500 mx-auto mb-4 animate-spin" />
                                    <p className="text-slate-400 mb-2">Uploading...</p>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400 mb-2">Drop your dataset here or click to browse</p>
                                    <p className="text-sm text-slate-500">Supported: CSV, JSON, Parquet, VCF, FASTQ</p>
                                </>
                            )}
                        </div>

                        {uploadedDataset && (
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="w-5 h-5 text-blue-400" />
                                        <div>
                                            <span className="text-white block">{uploadedDataset.name}</span>
                                            {uploadedDataset.records && (
                                                <span className="text-xs text-slate-500">{uploadedDataset.records.toLocaleString()} records</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-sm text-slate-400">{formatFileSize(uploadedDataset.size)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Training Configuration */}
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold text-white mb-6">Training Configuration</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Epochs</label>
                                <input
                                    type="number"
                                    value={config.epochs}
                                    onChange={(e) => setConfig({ ...config, epochs: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Batch Size</label>
                                <input
                                    type="number"
                                    value={config.batchSize}
                                    onChange={(e) => setConfig({ ...config, batchSize: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Validation Split</label>
                                <input
                                    type="number"
                                    value={config.validationSplit}
                                    onChange={(e) => setConfig({ ...config, validationSplit: parseFloat(e.target.value) })}
                                    step={0.1}
                                    min={0}
                                    max={1}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="flex items-center space-x-2 text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={config.gpuEnabled}
                                        onChange={(e) => setConfig({ ...config, gpuEnabled: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span className="text-sm">Enable GPU Acceleration</span>
                                </label>
                            </div>
                            <button
                                onClick={handleStartTraining}
                                disabled={!uploadedDataset || trainingJob?.status === 'running'}
                                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {trainingJob?.status === 'running' ? 'Training in Progress...' : 'Start Training'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Training Progress */}
                {progress && (
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-white">Training Progress</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${progress.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                                    progress.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                        'bg-red-500/20 text-red-400'
                                }`}>
                                {progress.status.toUpperCase()}
                            </span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300">
                                    Epoch {progress.current_epoch} / {progress.total_epochs}
                                </span>
                                <span className="text-indigo-400 font-semibold">{progress.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${progress.progress}%` }}
                                ></div>
                            </div>
                            <div className="grid grid-cols-4 gap-4 mt-6">
                                <div className="bg-slate-800/50 rounded-lg p-3">
                                    <p className="text-sm text-slate-400">train mae</p>
                                    <p className="text-xl font-bold text-white">{progress.metrics?.train_mae || '0.000'}</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-3">
                                    <p className="text-sm text-slate-400">train mse</p>
                                    <p className="text-xl font-bold text-white">{progress.metrics?.train_mse || '0.0'}</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-3">
                                    <p className="text-sm text-slate-400">val mae</p>
                                    <p className="text-xl font-bold text-white">{progress.metrics?.val_mae || '0.000'}</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-3">
                                    <p className="text-sm text-slate-400">val mse</p>
                                    <p className="text-xl font-bold text-white">{progress.metrics?.val_mse || '0.0'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrainingPage;