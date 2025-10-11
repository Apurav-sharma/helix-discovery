'use client'
import React, { useState } from 'react';
import { Brain, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const ModelsPage = () => {
    const [selectedType, setSelectedType] = useState('classification');
    const [architecture, setArchitecture] = useState('[64, 128, 1]');
    const [activationFunction, setActivationFunction] = useState('ReLU');
    const [optimizer, setOptimizer] = useState('Adam');
    const [learningRate, setLearningRate] = useState('0.001');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [modelMetrics, setModelMetrics] = useState({
        totalParameters: 0,
        trainableParameters: 0,
        modelSize: 0
    });

    const buildModel = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/models/build', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    modelType: selectedType,
                    architecture,
                    activationFunction,
                    optimizer,
                    learningRate: parseFloat(learningRate)
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || data.detail || 'Failed to build model');
            }

            setModelMetrics({
                totalParameters: data.metrics.totalParameters,
                trainableParameters: data.metrics.trainableParameters,
                modelSize: data.metrics.modelSize
            });

            setSuccess(`Model built successfully! Model ID: ${data.modelId}`);

        } catch (err) {
            setError(err.message || 'An error occurred');
            console.error('Build error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-white">Model Builder</h1>
                    <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all">
                        + Create New Model
                    </button>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <span className="text-red-400">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-green-400">{success}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Configuration Panel */}
                    <div className="lg:col-span-1 bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold text-white mb-6">Model Configuration</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Model Type</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                                >
                                    <option value="classification">Classification</option>
                                    <option value="regression">Regression</option>
                                    <option value="transformer">Transformer</option>
                                    <option value="cnn">CNN</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Architecture
                                    <span className="text-xs text-slate-500 ml-2">(e.g., [64, 128, 1])</span>
                                </label>
                                <input
                                    type="text"
                                    value={architecture}
                                    onChange={(e) => setArchitecture(e.target.value)}
                                    disabled={loading}
                                    placeholder="e.g., [64, 128, 1]"
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Activation Function</label>
                                <select
                                    value={activationFunction}
                                    onChange={(e) => setActivationFunction(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                                >
                                    <option>ReLU</option>
                                    <option>Sigmoid</option>
                                    <option>Tanh</option>
                                    <option>LeakyReLU</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Optimizer</label>
                                <select
                                    value={optimizer}
                                    onChange={(e) => setOptimizer(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                                >
                                    <option>Adam</option>
                                    <option>SGD</option>
                                    <option>RMSprop</option>
                                    <option>AdaGrad</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Learning Rate</label>
                                <input
                                    type="number"
                                    value={learningRate}
                                    onChange={(e) => setLearningRate(e.target.value)}
                                    disabled={loading}
                                    placeholder="0.001"
                                    step="0.0001"
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                                />
                            </div>

                            <button
                                onClick={buildModel}
                                disabled={loading}
                                className="w-full px-6 py-3 bg-indigo-600 rounded-lg text-white font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Building...</span>
                                    </>
                                ) : (
                                    <span>Build Model</span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Visualization Panel */}
                    <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold text-white mb-6">Model Architecture Visualization</h3>
                        <div className="h-96 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg">
                            {modelMetrics.totalParameters > 0 ? (
                                <div className="text-center p-8">
                                    <Brain className="w-24 h-24 text-indigo-500 mx-auto mb-4" />
                                    <p className="text-white text-lg font-semibold mb-2">Model Built Successfully!</p>
                                    <p className="text-slate-400 text-sm">Architecture: {architecture}</p>
                                    <p className="text-slate-400 text-sm">Type: {selectedType}</p>
                                    <p className="text-slate-400 text-sm">Activation: {activationFunction}</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-500">Configure your model to see architecture visualization</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-4">
                            <div className="bg-slate-800/50 rounded-lg p-4">
                                <p className="text-sm text-slate-400 mb-1">Total Parameters</p>
                                <p className="text-2xl font-bold text-white">
                                    {modelMetrics.totalParameters.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-4">
                                <p className="text-sm text-slate-400 mb-1">Trainable Params</p>
                                <p className="text-2xl font-bold text-white">
                                    {modelMetrics.trainableParameters.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-slate-800/50 rounded-lg p-4">
                                <p className="text-sm text-slate-400 mb-1">Model Size</p>
                                <p className="text-2xl font-bold text-white">{modelMetrics.modelSize} MB</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModelsPage;