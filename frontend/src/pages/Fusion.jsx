import { useState, useRef } from 'react';
import Graph from '../components/Graph';
import { generateFusionMap } from '../api/generateMap';
import { exportAsPNG, exportAsPDF } from '../utils/export';

const Fusion = ({ darkMode }) => {
  const [topicA, setTopicA] = useState('');
  const [topicB, setTopicB] = useState('');
  const [complexity, setComplexity] = useState('intermediate');
  const [loading, setLoading] = useState(false);
  const [mapData, setMapData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showReasoningTrail, setShowReasoningTrail] = useState(false);
  const graphContainerRef = useRef(null);

  const handleGenerate = async () => {
    if (!topicA.trim() || !topicB.trim()) {
      setError('Please enter both topics');
      return;
    }

    setLoading(true);
    setError(null);
    setMapData(null);
    setSelectedNode(null);
    setSelectedNodeId(null);
    setShowSidebar(false);
    setShowReasoningTrail(false);

    try {
      const data = await generateFusionMap(topicA.trim(), topicB.trim(), complexity);

      if (!data?.graph_nodes?.length || !Array.isArray(data.graph_links)) {
        throw new Error('Invalid data received from server');
      }

      data.graph_nodes = data.graph_nodes.map((node, index) => ({
        id: node.id || `node_${index}`,
        type: node.type || 'sub',
        label: node.label || `Node ${index + 1}`,
        description: node.description || `This ${node.type || 'sub'} represents: ${node.label || `Node ${index + 1}`}`,
      }));

      data.reasoning_trail ||= 'This cognitive map explores intersections and connections between the two topics.';

      setMapData(data);
    } catch (err) {
      setError(err.message || 'Failed to generate fusion map');
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (node, fullData) => {
    setSelectedNode({ node, fullData });
    setSelectedNodeId(node.id);
    setShowSidebar(true);
  };

  const handleExportPNG = () => {
    if (graphContainerRef.current) {
      const svg = graphContainerRef.current.querySelector('svg');
      if (svg) exportAsPNG(svg, `fusion-map-${topicA.replace(/\s+/g, '-')}-${topicB.replace(/\s+/g, '-')}.png`);
    }
  };

  const handleExportPDF = () => {
    if (mapData) exportAsPDF(mapData, mapData.reasoning_trail);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h2
          className={`text-4xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent ${
            darkMode ? 'from-cyan-400 to-purple-400' : 'from-blue-600 to-purple-600'
          }`}
        >
          Fusion Mode
        </h2>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          Explore intersections and relationships between two topics
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Input Section */}
        <div
          className={`backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-6 border transition-all duration-300 transform hover:scale-[1.01] ${
            darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-white/30 border-gray-200'
          }`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={topicA}
                onChange={(e) => setTopicA(e.target.value)}
                placeholder="Topic A (e.g., Neural Networks)"
                className={`flex-1 px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                  darkMode ? 'bg-gray-800/50 border-cyan-400 text-gray-100 placeholder-cyan-300' : 'bg-white/20 border-blue-500 text-gray-800 placeholder-blue-400'
                }`}
                disabled={loading}
              />
              <input
                type="text"
                value={topicB}
                onChange={(e) => setTopicB(e.target.value)}
                placeholder="Topic B (e.g., Quantum Computing)"
                className={`flex-1 px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                  darkMode ? 'bg-gray-800/50 border-purple-400 text-gray-100 placeholder-purple-300' : 'bg-white/20 border-purple-500 text-gray-800 placeholder-purple-400'
                }`}
                disabled={loading}
              />
            </div>
            <div className="flex gap-4">
              <select
                value={complexity}
                onChange={(e) => setComplexity(e.target.value)}
                className={`px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                  darkMode ? 'bg-gray-800/50 border-gray-600 text-gray-100' : 'bg-white/20 border-gray-300 text-gray-800'
                }`}
                disabled={loading}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
              <button
                onClick={handleGenerate}
                disabled={loading || !topicA.trim() || !topicB.trim()}
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2 animate-spin">⚙️ Generating...</span>
                ) : (
                  'Generate Fusion Map'
                )}
              </button>
            </div>
          </div>
          {error && (
            <div className={`mt-4 p-4 rounded-xl border animate-shake ${
              darkMode ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-100 border-red-400 text-red-700'
            }`}>
              {error}
            </div>
          )}
        </div>

        {/* Graph Section */}
        {mapData && !loading && (
          <div className="relative animate-fade-in">
            <div className={`backdrop-blur-xl rounded-2xl shadow-2xl p-6 border ${
              darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-white/20 border-gray-200'
            }`}>
              <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {topicA} ↔ {topicB}
                </h2>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setShowReasoningTrail(!showReasoningTrail)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                      darkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {showReasoningTrail ? 'Hide' : 'Show'} Reasoning Trail
                  </button>
                  <button
                    onClick={handleExportPNG}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                      darkMode ? 'bg-cyan-700 text-white hover:bg-cyan-600' : 'bg-cyan-600 text-white hover:bg-cyan-700'
                    }`}
                  >
                    📥 PNG
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                      darkMode ? 'bg-purple-700 text-white hover:bg-purple-600' : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    📄 PDF
                  </button>
                </div>
              </div>

              <div ref={graphContainerRef}>
                <Graph
                  data={mapData}
                  onNodeClick={handleNodeClick}
                  darkMode={darkMode}
                  selectedNodeId={selectedNodeId}
                />
              </div>
            </div>

            {showReasoningTrail && mapData.reasoning_trail && (
              <div className={`mt-4 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border animate-slide-up ${
                darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-white/20 border-gray-200'
              }`}>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  Reasoning Trail
                </h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                  {mapData.reasoning_trail}
                </p>
              </div>
            )}

            {/* Node Info Sidebar */}
            {showSidebar && selectedNode && (
              <div className={`fixed right-0 top-0 h-full w-96 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l ${
                darkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'
              }`}>
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {selectedNode.node.label}
                    </h3>
                    <button
                      onClick={() => { setShowSidebar(false); setSelectedNode(null); setSelectedNodeId(null); }}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
                    darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedNode.node.type}
                  </span>
                </div>
                <div className={`p-6 overflow-y-auto h-[calc(100%-120px)] ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p className="leading-relaxed">{selectedNode.node.description || 'No description available.'}</p>
                </div>
              </div>
            )}

            {showSidebar && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
                onClick={() => { setShowSidebar(false); setSelectedNode(null); setSelectedNodeId(null); }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Fusion;
