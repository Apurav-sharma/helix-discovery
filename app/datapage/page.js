'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Activity, FileText, Database, Lock, Upload } from 'lucide-react';

const DataPage = () => {
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const fileInputRef = useRef(null);

    // Fetch datasets on component mount
    useEffect(() => {
        fetchDatasets();
    }, [filterType, searchTerm]);

    const fetchDatasets = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterType !== 'all') params.append('type', filterType);
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(`/api/datasets?${params}`);
            const result = await response.json();

            if (result.success) {
                setDatasets(result.data);
                console.log(result.data);
            }
        } catch (error) {
            console.error('Error fetching datasets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/datasets', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                alert('Dataset uploaded successfully!');
                fetchDatasets(); // Refresh the list
            } else {
                alert('Upload failed: ' + result.error);
            }
        } catch (error) {
            console.error('Error uploading dataset:', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeleteDataset = async (id) => {
        if (!confirm('Are you sure you want to delete this dataset?')) return;

        try {
            const response = await fetch(`/api/datasets?id=${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                alert('Dataset deleted successfully!');
                fetchDatasets();
            } else {
                alert('Delete failed: ' + result.error);
            }
        } catch (error) {
            console.error('Error deleting dataset:', error);
            alert('Delete failed');
        }
    };

    const calculateStats = () => {
        const totalDatasets = datasets.length;
        const totalStorage = datasets.reduce((sum, d) => {
            const size = parseFloat(d.size);
            const unit = d.size.includes('GB') ? 1024 : 1;
            return sum + (size * unit);
        }, 0);
        const activeProcesses = datasets.filter(d => d.status === 'Processing').length;

        return {
            totalDatasets,
            totalStorage: (totalStorage / 1024).toFixed(1) + ' TB',
            activeProcesses,
            encrypted: '100%'
        };
    };

    const stats = calculateStats();

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-white">Data Management</h1>
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileUpload}
                            className="hidden"
                            accept=".csv,.json,.parquet,.vcf,.fastq,.dicom"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : '+ Upload Dataset'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6">
                        <FileText className="w-8 h-8 text-white mb-3" />
                        <p className="text-blue-100 text-sm mb-1">Total Datasets</p>
                        <p className="text-3xl font-bold text-white">{stats.totalDatasets}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6">
                        <Database className="w-8 h-8 text-white mb-3" />
                        <p className="text-purple-100 text-sm mb-1">Total Storage</p>
                        <p className="text-3xl font-bold text-white">{stats.totalStorage}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6">
                        <Activity className="w-8 h-8 text-white mb-3" />
                        <p className="text-green-100 text-sm mb-1">Active Processes</p>
                        <p className="text-3xl font-bold text-white">{stats.activeProcesses}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6">
                        <Lock className="w-8 h-8 text-white mb-3" />
                        <p className="text-orange-100 text-sm mb-1">Encrypted</p>
                        <p className="text-3xl font-bold text-white">{stats.encrypted}</p>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-white">Datasets</h3>
                            <div className="flex space-x-3">
                                <input
                                    type="text"
                                    placeholder="Search datasets..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                                />
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="all">All Types</option>
                                    <option value="CSV">CSV</option>
                                    <option value="JSON">JSON</option>
                                    <option value="VCF">VCF</option>
                                    <option value="DICOM">DICOM</option>
                                    <option value="Parquet">Parquet</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex items-center justify-center p-12">
                                <div className="text-slate-400">Loading datasets...</div>
                            </div>
                        ) : datasets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12">
                                <Database className="w-16 h-16 text-slate-600 mb-4" />
                                <p className="text-slate-400">No datasets found</p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-4 px-6 py-2 bg-indigo-600 rounded-lg text-white text-sm font-semibold hover:bg-indigo-700 transition-all"
                                >
                                    Upload Your First Dataset
                                </button>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Dataset Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Type</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Size</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Records</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {datasets.map((dataset) => (
                                        <tr key={dataset.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 text-white">{dataset.name}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-xs text-indigo-400">
                                                    {dataset.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">{dataset.size}</td>
                                            <td className="px-6 py-4 text-slate-300">{dataset.records}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs ${dataset.status === 'Active'
                                                        ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                                                        : 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
                                                    }`}>
                                                    {dataset.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleDeleteDataset(dataset._id)}
                                                    className="text-red-400 hover:text-red-300 text-sm font-medium mr-4"
                                                >
                                                    Delete
                                                </button>
                                                <a
                                                    href={dataset.filePath}
                                                    download
                                                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                                                >
                                                    Download
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Data Governance</h3>
                        <div className="space-y-3">
                            <GovernanceItem icon={Lock} label="AES-256 Encryption" status="Enabled" />
                            <GovernanceItem icon={FileText} label="FHIR Compliance" status="Enabled" />
                            <GovernanceItem icon={Activity} label="Audit Logging" status="Active" />
                            <GovernanceItem icon={Lock} label="HIPAA Compliance" status="Certified" />
                        </div>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            {datasets.slice(0, 3).map((dataset) => (
                                <ActivityItem
                                    key={dataset.id}
                                    action="Dataset uploaded"
                                    item={dataset.name}
                                    time={new Date(dataset.uploadedAt).toLocaleString()}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GovernanceItem = ({ icon: Icon, label, status }) => (
    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
        <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5 text-indigo-400" />
            <span className="text-white">{label}</span>
        </div>
        <span className="text-sm text-green-400 font-semibold">{status}</span>
    </div>
);

const ActivityItem = ({ action, item, time }) => (
    <div className="p-3 bg-slate-800/50 rounded-lg">
        <p className="text-white text-sm"><span className="text-slate-400">{action}:</span> {item}</p>
        <p className="text-xs text-slate-500 mt-1">{time}</p>
    </div>
);

export default DataPage;