'use client'
import { useState } from "react";
import { Database, Upload, X } from "lucide-react";

const LibraryPage = () => {
    const [models, setModels] = useState([
    ]);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        name: '',
        domain: '',
        file: null,
        inputExample: '',
        outputExample: ''
    });
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadForm.file || !uploadForm.name || !uploadForm.domain) {
            alert('Please fill all required fields');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', uploadForm.file);

            const response = await fetch(`/api/upload?filename=new_models/${uploadForm.file.name}`, {
                method: 'POST',
                body: uploadForm.file,
            });

            const data = await response.json();

            const fileExt = uploadForm.file.name.split('.').pop().toUpperCase();

            const newModel = {
                name: uploadForm.name,
                domain: uploadForm.domain,
                accuracy: "N/A",
                format: fileExt,
                url: data.url,
                inputExample: uploadForm.inputExample,
                outputExample: uploadForm.outputExample
            };

            setModels([...models, newModel]);
            setShowUploadModal(false);
            setUploadForm({ name: '', domain: '', file: null, inputExample: '', outputExample: '' });
            alert('Model uploaded successfully!');
        } catch (error) {
            alert('Upload failed: ' + error.message);
        }
        setUploading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-white">Pre-Trained Model Library</h1>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="px-4 py-2 bg-indigo-600 rounded-lg text-white font-semibold hover:bg-indigo-700 transition-all flex items-center space-x-2"
                        >
                            <Upload className="w-4 h-4" />
                            <span>Upload Model</span>
                        </button>
                        <select className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500">
                            <option>All Domains</option>
                            <option>Structural Biology</option>
                            <option>Pharmacology</option>
                            <option>Genomics</option>
                            <option>Safety</option>
                            <option>Chemistry</option>
                            <option>Clinical</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {models.map((model, idx) => (
                        <div key={idx} className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6 hover:border-indigo-500 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <Database className="w-10 h-10 text-indigo-400" />
                                <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-xs text-green-400">
                                    {model.format}
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">{model.name}</h3>
                            <p className="text-slate-400 text-sm mb-4">{model.domain}</p>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-slate-400">Accuracy</span>
                                <span className="text-lg font-bold text-indigo-400">{model.accuracy}</span>
                            </div>
                            {model.url && (
                                <div className="mb-4 p-2 bg-slate-800/50 rounded text-xs text-slate-400 truncate">
                                    {model.url}
                                </div>
                            )}
                            <div className="flex space-x-2">
                                <button className="flex-1 px-4 py-2 bg-indigo-600 rounded-lg text-white text-sm font-semibold hover:bg-indigo-700 transition-all">
                                    Apply Model
                                </button>
                                <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm hover:bg-slate-700 transition-all">
                                    Fine-tune
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {showUploadModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Upload New Model</h2>
                                <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Model Name *</label>
                                    <input
                                        type="text"
                                        value={uploadForm.name}
                                        onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                        placeholder="e.g., Protein Structure Predictor"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Domain *</label>
                                    <input
                                        type="text"
                                        value={uploadForm.domain}
                                        onChange={(e) => setUploadForm({ ...uploadForm, domain: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                        placeholder="e.g., Structural Biology"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Model File * (.pkl, .pth, .onnx, etc.)</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                                        accept=".pkl,.pth,.onnx,.h5,.pb,.pt"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Input Example</label>
                                    <textarea
                                        value={uploadForm.inputExample}
                                        onChange={(e) => setUploadForm({ ...uploadForm, inputExample: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 h-24"
                                        placeholder='e.g., {"sequence": "ACDEFGHIKLMNPQRSTVWY", "temperature": 25}'
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Output Example</label>
                                    <textarea
                                        value={uploadForm.outputExample}
                                        onChange={(e) => setUploadForm({ ...uploadForm, outputExample: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 h-24"
                                        placeholder='e.g., {"structure": "alpha-helix", "confidence": 0.95}'
                                    />
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="flex-1 px-4 py-3 bg-indigo-600 rounded-lg text-white font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploading ? 'Uploading...' : 'Upload Model'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowUploadModal(false)}
                                        className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibraryPage;