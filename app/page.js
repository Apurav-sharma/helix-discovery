'use client'
import React, { useState } from 'react';
import { Activity, Beaker, Brain, Database, FileText, GitBranch, Home, Layout, Lock, Search, Settings, Upload, Zap } from 'lucide-react';
import DataPage from './datapage/page';
import ModelsPage from "./model_builder/page";

// Main App Component with Router
const HelixDiscovery = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const pages = {
    home: <HomePage />,
    dashboard: <DashboardPage />,
    models: <ModelsPage />,
    training: <TrainingPage />,
    library: <LibraryPage />,
    pipelines: <PipelinesPage />,
    data: <DataPage />,
    settings: <SettingsPage />
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">
          {pages[currentPage]}
        </main>
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ currentPage, setCurrentPage, isOpen, toggleSidebar }) => {
  const menuItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'dashboard', icon: Layout, label: 'Dashboard' },
    { id: 'models', icon: Brain, label: 'Model Builder' },
    { id: 'training', icon: Activity, label: 'Training' },
    { id: 'library', icon: Database, label: 'Model Library' },
    { id: 'pipelines', icon: GitBranch, label: 'Pipelines' },
    { id: 'data', icon: FileText, label: 'Data Management' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} bg-slate-900/80 backdrop-blur-xl border-r border-indigo-500/20 transition-all duration-300`}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Beaker className="w-6 h-6 text-white" />
          </div>
          {isOpen && <span className="text-xl font-bold text-white">Helix Discovery™</span>}
        </div>

        <nav className="space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentPage === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* {isOpen && (
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Lock className="w-4 h-4 text-white" />
              <span className="text-xs font-semibold text-white">HIPAA Compliant</span>
            </div>
            <p className="text-xs text-indigo-100">All data encrypted with AES-256</p>
          </div>
        </div>
      )} */}
    </div>
  );
};

// Header Component
const Header = ({ toggleSidebar }) => {
  return (
    <header className="bg-slate-900/50 backdrop-blur-xl border-b border-indigo-500/20 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={toggleSidebar} className="text-slate-400 hover:text-white">
            <Layout className="w-6 h-6" />
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search models, pipelines, datasets..."
              className="pl-10 pr-4 py-2 w-96 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-medium">System Healthy</span>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
            JD
          </div>
        </div>
      </div>
    </header>
  );
};

// Home Page
const HomePage = () => {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 pt-12">
          <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Accelerate Drug Discovery with AI
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Helix Discovery™ provides researchers with advanced machine learning tools,
            pre-trained biomedical models, and automated pipelines to revolutionize pharmaceutical development.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all">
              Get Started
            </button>
            <button className="px-8 py-4 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold hover:bg-slate-700 transition-all">
              View Documentation
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <FeatureCard
            icon={Brain}
            title="AI-Powered Models"
            description="Build and train custom ML models with state-of-the-art architectures"
            color="from-blue-500 to-cyan-500"
          />
          <FeatureCard
            icon={Zap}
            title="Automated Pipelines"
            description="Create end-to-end workflows with our drag-and-drop pipeline builder"
            color="from-purple-500 to-pink-500"
          />
          <FeatureCard
            icon={Lock}
            title="HIPAA Compliant"
            description="Enterprise-grade security with HIPAA, GDPR, and NDPR compliance"
            color="from-green-500 to-emerald-500"
          />
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-4 gap-6 mb-16">
          <StatCard value="150+" label="Pre-trained Models" />
          <StatCard value="99.9%" label="Uptime SLA" />
          <StatCard value="50M+" label="Data Points Processed" />
          <StatCard value="24/7" label="Support Available" />
        </div>

        {/* Use Cases */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-white mb-8">Common Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <UseCaseCard
              title="Drug Repurposing"
              description="Identify new therapeutic applications for existing compounds using AI-powered analysis"
            />
            <UseCaseCard
              title="Genomic Analysis"
              description="Predict genetic markers and variants with fine-tuned machine learning models"
            />
            <UseCaseCard
              title="Precision Medicine"
              description="Generate personalized treatment recommendations based on patient biomarkers"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Page
const DashboardPage = () => {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Active Models" value="23" change="+12%" trend="up" />
          <MetricCard title="Training Jobs" value="8" change="+4" trend="up" />
          <MetricCard title="Pipelines Running" value="15" change="-2" trend="down" />
          <MetricCard title="Data Sources" value="42" change="+5%" trend="up" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Training Jobs</h3>
            <div className="space-y-3">
              <JobItem name="Protein Folding Model v2.3" status="Running" progress={67} />
              <JobItem name="Drug-Target Interaction" status="Completed" progress={100} />
              <JobItem name="Genomic Variant Classifier" status="Running" progress={34} />
              <JobItem name="Compound Toxicity Predictor" status="Queued" progress={0} />
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">System Resources</h3>
            <div className="space-y-4">
              <ResourceBar label="GPU Utilization" value={78} color="bg-blue-500" />
              <ResourceBar label="CPU Usage" value={45} color="bg-green-500" />
              <ResourceBar label="Memory" value={62} color="bg-purple-500" />
              <ResourceBar label="Storage" value={34} color="bg-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Model Performance Overview</h3>
          <div className="h-64 flex items-center justify-center text-slate-500">
            <Activity className="w-8 h-8 mr-2" />
            <span>Performance metrics chart placeholder</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// // Models Page
// const ModelsPage = () => {
//   const [selectedType, setSelectedType] = useState('classification');

//   return (
//     <div className="p-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-4xl font-bold text-white">Model Builder</h1>
//           <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all">
//             + Create New Model
//           </button>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Configuration Panel */}
//           <div className="lg:col-span-1 bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
//             <h3 className="text-xl font-semibold text-white mb-6">Model Configuration</h3>

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">Model Type</label>
//                 <select
//                   value={selectedType}
//                   onChange={(e) => setSelectedType(e.target.value)}
//                   className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
//                 >
//                   <option value="classification">Classification</option>
//                   <option value="regression">Regression</option>
//                   <option value="transformer">Transformer</option>
//                   <option value="cnn">CNN</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">Architecture</label>
//                 <input
//                   type="text"
//                   placeholder="e.g., [64, 128, 1]"
//                   className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">Activation Function</label>
//                 <select className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500">
//                   <option>ReLU</option>
//                   <option>Sigmoid</option>
//                   <option>Tanh</option>
//                   <option>LeakyReLU</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">Optimizer</label>
//                 <select className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500">
//                   <option>Adam</option>
//                   <option>SGD</option>
//                   <option>RMSprop</option>
//                   <option>AdaGrad</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">Learning Rate</label>
//                 <input
//                   type="number"
//                   placeholder="0.001"
//                   step="0.0001"
//                   className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
//                 />
//               </div>

//               <button className="w-full px-6 py-3 bg-indigo-600 rounded-lg text-white font-semibold hover:bg-indigo-700 transition-all">
//                 Build Model
//               </button>
//             </div>
//           </div>

//           {/* Visualization Panel */}
//           <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
//             <h3 className="text-xl font-semibold text-white mb-6">Model Architecture Visualization</h3>
//             <div className="h-96 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg">
//               <div className="text-center">
//                 <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
//                 <p className="text-slate-500">Configure your model to see architecture visualization</p>
//               </div>
//             </div>

//             <div className="mt-6 grid grid-cols-3 gap-4">
//               <div className="bg-slate-800/50 rounded-lg p-4">
//                 <p className="text-sm text-slate-400 mb-1">Total Parameters</p>
//                 <p className="text-2xl font-bold text-white">0</p>
//               </div>
//               <div className="bg-slate-800/50 rounded-lg p-4">
//                 <p className="text-sm text-slate-400 mb-1">Trainable Params</p>
//                 <p className="text-2xl font-bold text-white">0</p>
//               </div>
//               <div className="bg-slate-800/50 rounded-lg p-4">
//                 <p className="text-sm text-slate-400 mb-1">Model Size</p>
//                 <p className="text-2xl font-bold text-white">0 MB</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// Training Page
const TrainingPage = () => {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Training Interface</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Dataset Upload</h3>
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-12 text-center hover:border-indigo-500 transition-all cursor-pointer">
              <Upload className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">Drop your dataset here or click to browse</p>
              <p className="text-sm text-slate-500">Supported: CSV, JSON, Parquet, VCF, FASTQ</p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-white">clinical_data.csv</span>
                </div>
                <span className="text-sm text-slate-400">2.4 MB</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Training Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Epochs</label>
                <input type="number" defaultValue={100} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Batch Size</label>
                <input type="number" defaultValue={32} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Validation Split</label>
                <input type="number" defaultValue={0.2} step={0.1} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="flex items-center space-x-2 text-slate-300">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Enable GPU Acceleration</span>
                </label>
              </div>
              <button className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all">
                Start Training
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Training Progress</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Epoch 47 / 100</span>
              <span className="text-indigo-400 font-semibold">47%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full" style={{ width: '47%' }}></div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-sm text-slate-400">Loss</p>
                <p className="text-xl font-bold text-white">0.234</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-sm text-slate-400">Accuracy</p>
                <p className="text-xl font-bold text-white">94.2%</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-sm text-slate-400">Val Loss</p>
                <p className="text-xl font-bold text-white">0.298</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-sm text-slate-400">Val Accuracy</p>
                <p className="text-xl font-bold text-white">91.8%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Library Page
const LibraryPage = () => {
  const models = [
    { name: "Protein Folding Predictor", domain: "Structural Biology", accuracy: "96.4%", format: "ONNX" },
    { name: "Drug-Target Interaction", domain: "Pharmacology", accuracy: "93.2%", format: "ONNX" },
    { name: "Compound Toxicity Classifier", domain: "Safety", accuracy: "89.7%", format: "ONNX" },
    { name: "Genomic Variant Predictor", domain: "Genomics", accuracy: "95.1%", format: "ONNX" },
    { name: "Molecular Property Estimator", domain: "Chemistry", accuracy: "91.3%", format: "ONNX" },
    { name: "Clinical Trial Outcome Predictor", domain: "Clinical", accuracy: "87.9%", format: "ONNX" }
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Pre-Trained Model Library</h1>
          <div className="flex space-x-3">
            <select className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500">
              <option>All Domains</option>
              <option>Structural Biology</option>
              <option>Pharmacology</option>
              <option>Genomics</option>
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
      </div>
    </div>
  );
};

// Pipelines Page
const PipelinesPage = () => {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">ML Pipelines</h1>
          <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all">
            + Create Pipeline
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Active Pipelines</h3>
            <div className="space-y-3">
              <PipelineItem name="Drug Discovery Pipeline v3" status="Running" progress={78} />
              <PipelineItem name="Genomic Analysis Workflow" status="Running" progress={45} />
              <PipelineItem name="Clinical Trial Data Processing" status="Completed" progress={100} />
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Pipeline Builder</h3>
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-12 text-center">
              <GitBranch className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Drag and drop to build your workflow</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Pipeline Monitoring</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Total Runs</p>
              <p className="text-2xl font-bold text-white">1,247</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-green-400">98.3%</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Avg Duration</p>
              <p className="text-2xl font-bold text-white">2.4h</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Active Now</p>
              <p className="text-2xl font-bold text-indigo-400">15</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// // Data Page
// const DataPage = () => {
//   const datasets = [
//     { name: "Clinical Trial Dataset 2024", type: "CSV", size: "2.4 GB", records: "1.2M", status: "Active" },
//     { name: "Genomic Sequences (VCF)", type: "VCF", size: "5.7 GB", records: "450K", status: "Active" },
//     { name: "Drug Compound Library", type: "JSON", size: "890 MB", records: "87K", status: "Active" },
//     { name: "Medical Imaging (DICOM)", type: "DICOM", size: "12.3 GB", records: "34K", status: "Processing" },
//     { name: "Protein Structure Data", type: "Parquet", size: "3.2 GB", records: "560K", status: "Active" }
//   ];

//   return (
//     <div className="p-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-4xl font-bold text-white">Data Management</h1>
//           <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all">
//             + Upload Dataset
//           </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6">
//             <FileText className="w-8 h-8 text-white mb-3" />
//             <p className="text-blue-100 text-sm mb-1">Total Datasets</p>
//             <p className="text-3xl font-bold text-white">87</p>
//           </div>
//           <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6">
//             <Database className="w-8 h-8 text-white mb-3" />
//             <p className="text-purple-100 text-sm mb-1">Total Storage</p>
//             <p className="text-3xl font-bold text-white">24.6 TB</p>
//           </div>
//           <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6">
//             <Activity className="w-8 h-8 text-white mb-3" />
//             <p className="text-green-100 text-sm mb-1">Active Processes</p>
//             <p className="text-3xl font-bold text-white">12</p>
//           </div>
//           <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6">
//             <Lock className="w-8 h-8 text-white mb-3" />
//             <p className="text-orange-100 text-sm mb-1">Encrypted</p>
//             <p className="text-3xl font-bold text-white">100%</p>
//           </div>
//         </div>

//         <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl overflow-hidden">
//           <div className="p-6 border-b border-slate-800">
//             <div className="flex items-center justify-between">
//               <h3 className="text-xl font-semibold text-white">Datasets</h3>
//               <div className="flex space-x-3">
//                 <input
//                   type="text"
//                   placeholder="Search datasets..."
//                   className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
//                 />
//                 <select className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500">
//                   <option>All Types</option>
//                   <option>CSV</option>
//                   <option>JSON</option>
//                   <option>VCF</option>
//                   <option>DICOM</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-slate-800/50">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Dataset Name</th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Type</th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Size</th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Records</th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-800">
//                 {datasets.map((dataset, idx) => (
//                   <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
//                     <td className="px-6 py-4 text-white">{dataset.name}</td>
//                     <td className="px-6 py-4">
//                       <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-xs text-indigo-400">
//                         {dataset.type}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-slate-300">{dataset.size}</td>
//                     <td className="px-6 py-4 text-slate-300">{dataset.records}</td>
//                     <td className="px-6 py-4">
//                       <span className={`px-3 py-1 rounded-full text-xs ${dataset.status === 'Active'
//                           ? 'bg-green-500/20 border border-green-500/50 text-green-400'
//                           : 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
//                         }`}>
//                         {dataset.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
//                         View Details
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
//             <h3 className="text-xl font-semibold text-white mb-4">Data Governance</h3>
//             <div className="space-y-3">
//               <GovernanceItem icon={Lock} label="AES-256 Encryption" status="Enabled" />
//               <GovernanceItem icon={FileText} label="FHIR Compliance" status="Enabled" />
//               <GovernanceItem icon={Activity} label="Audit Logging" status="Active" />
//               <GovernanceItem icon={Lock} label="HIPAA Compliance" status="Certified" />
//             </div>
//           </div>

//           <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
//             <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
//             <div className="space-y-3">
//               <ActivityItem
//                 action="Dataset uploaded"
//                 item="Clinical Trial Dataset 2024"
//                 time="2 hours ago"
//               />
//               <ActivityItem
//                 action="Pipeline completed"
//                 item="Genomic Analysis Workflow"
//                 time="5 hours ago"
//               />
//               <ActivityItem
//                 action="Model trained"
//                 item="Drug-Target Interaction v2"
//                 time="1 day ago"
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// Settings Page
const SettingsPage = () => {
  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Account Settings</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue="Dr. Jane Smith"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="jane.smith@phoenixlabs.global"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Organization</label>
                <input
                  type="text"
                  defaultValue="Phoenix Labs Global"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-slate-400">Add an extra layer of security</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">API Key Access</p>
                  <p className="text-sm text-slate-400">Manage API keys for external integrations</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 rounded-lg text-white text-sm font-semibold hover:bg-indigo-700 transition-all">
                  Manage Keys
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">Session Timeout</p>
                  <p className="text-sm text-slate-400">Automatically log out after inactivity</p>
                </div>
                <select className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-indigo-500">
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>4 hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Compliance Settings */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Compliance & Privacy</h3>
            <div className="space-y-3">
              <ComplianceItem label="HIPAA Compliance Mode" status="Active" />
              <ComplianceItem label="GDPR Data Protection" status="Active" />
              <ComplianceItem label="NDPR Nigerian Compliance" status="Active" />
              <ComplianceItem label="Audit Trail Logging" status="Enabled" />
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Notifications</h3>
            <div className="space-y-3">
              <NotificationItem label="Training job completed" enabled={true} />
              <NotificationItem label="Pipeline failures" enabled={true} />
              <NotificationItem label="System maintenance" enabled={true} />
              <NotificationItem label="New model releases" enabled={false} />
              <NotificationItem label="Weekly reports" enabled={true} />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold hover:bg-slate-700 transition-all">
              Cancel
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6 hover:border-indigo-500 transition-all">
    <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-slate-400">{description}</p>
  </div>
);

const StatCard = ({ value, label }) => (
  <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6 text-center">
    <p className="text-4xl font-bold text-white mb-2">{value}</p>
    <p className="text-slate-400">{label}</p>
  </div>
);

const UseCaseCard = ({ title, description }) => (
  <div className="p-6">
    <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
    <p className="text-slate-400 text-sm">{description}</p>
  </div>
);

const MetricCard = ({ title, value, change, trend }) => (
  <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-6">
    <p className="text-sm text-slate-400 mb-2">{title}</p>
    <p className="text-3xl font-bold text-white mb-2">{value}</p>
    <div className="flex items-center space-x-1">
      <span className={`text-sm font-semibold ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
        {change}
      </span>
      <span className="text-xs text-slate-500">vs last month</span>
    </div>
  </div>
);

const JobItem = ({ name, status, progress }) => (
  <div className="p-4 bg-slate-800/50 rounded-lg">
    <div className="flex justify-between items-center mb-2">
      <span className="text-white font-medium">{name}</span>
      <span className={`text-xs px-2 py-1 rounded-full ${status === 'Running' ? 'bg-blue-500/20 text-blue-400' :
          status === 'Completed' ? 'bg-green-500/20 text-green-400' :
            'bg-slate-500/20 text-slate-400'
        }`}>
        {status}
      </span>
    </div>
    {progress > 0 && (
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    )}
  </div>
);

const ResourceBar = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="text-sm font-semibold text-white">{value}%</span>
    </div>
    <div className="w-full bg-slate-700 rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

const PipelineItem = ({ name, status, progress }) => (
  <div className="p-4 bg-slate-800/50 rounded-lg">
    <div className="flex justify-between items-center mb-2">
      <span className="text-white font-medium">{name}</span>
      <span className={`text-xs px-2 py-1 rounded-full ${status === 'Running' ? 'bg-blue-500/20 text-blue-400' :
          'bg-green-500/20 text-green-400'
        }`}>
        {status}
      </span>
    </div>
    <div className="w-full bg-slate-700 rounded-full h-2">
      <div
        className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  </div>
);

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

const ComplianceItem = ({ label, status }) => (
  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
    <span className="text-white">{label}</span>
    <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-xs text-green-400">
      {status}
    </span>
  </div>
);

const NotificationItem = ({ label, enabled }) => (
  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
    <span className="text-white">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" defaultChecked={enabled} />
      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
    </label>
  </div>
);

export default HelixDiscovery;