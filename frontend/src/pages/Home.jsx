import { useState, useRef } from 'react';
import Graph from '../components/Graph';
import { generateMap } from '../api/generateMap';
import { exportAsPNG, exportAsPDF } from '../utils/export';

const Home = ({ darkMode }) => {
  const [topic, setTopic] = useState('');
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
    if (!topic.trim()) {
      setError('Please enter a topic');
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
      const data = await generateMap(topic.trim(), complexity);

      if (!data?.graph_nodes?.length || !Array.isArray(data.graph_links)) {
        throw new Error('Invalid data received from server');
      }

      data.graph_nodes = data.graph_nodes.map((node, index) => ({
        id: node.id || `node_${index}`,
        type: node.type || 'sub',
        label: node.label || `Node ${index + 1}`,
        description: node.description || `This ${node.type || 'sub'} represents: ${node.label || `Node ${index + 1}`}`,
      }));

      data.reasoning_trail ||= 'This cognitive map explores the relationships and connections within the topic.';

      setMapData(data);
    } catch (err) {
      setError(err.message || 'Failed to generate cognitive map');
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
      if (svg) exportAsPNG(svg, `cognitive-map-${mapData.topic.replace(/\s+/g, '-')}.png`);
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
          MindMesh
        </h2>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          Generate structured cognitive maps for any topic
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Input Section */}
        <div
          className={`backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-6 border transition-all duration-300 transform hover:scale-[1.01] ${
            darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-white/30 border-gray-200'
          }`}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="Enter a topic (e.g., Neural Networks)"
              className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 ${
                darkMode ? 'bg-gray-800/50 border-cyan-400 text-gray-100 placeholder-cyan-300' : 'bg-white/20 border-blue-500 text-gray-800 placeholder-blue-400'
              }`}
              disabled={loading}
            />
            <select
              value={complexity}
              onChange={(e) => setComplexity(e.target.value)}
              className={`px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300 ${
                darkMode ? 'bg-gray-800/50 border-purple-400 text-gray-100' : 'bg-white/20 border-purple-500 text-gray-800'
              }`}
              disabled={loading}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="btn btn-primary flex items-center justify-center gap-2"
            >
              <span>{loading ? '⚙️ Generating...' : 'Generate Map'}</span>
            </button>
          </div>

          {error && (
            <div
              className={`mt-4 p-4 rounded-xl border ${
                darkMode ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-100 border-red-400 text-red-700'
              }`}
            >
              {error}
            </div>
          )}
        </div>

        {/* Graph Section */}
        {mapData && !loading && (
          <div className="relative animate-fade-in">
            <div
              className={`backdrop-blur-xl rounded-2xl shadow-2xl p-6 border ${
                darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-white/20 border-gray-200'
              }`}
            >
              <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {mapData.topic}
                </h2>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setShowReasoningTrail(!showReasoningTrail)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      darkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {showReasoningTrail ? 'Hide' : 'Show'} Reasoning Trail
                  </button>
                  <button
                    onClick={handleExportPNG}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      darkMode ? 'bg-cyan-700 text-white hover:bg-cyan-600' : 'bg-cyan-600 text-white hover:bg-cyan-700'
                    }`}
                  >
                    📥 PNG
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
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

            {showReasoningTrail && (
              <div
                className={`mt-4 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border ${
                  darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-white/20 border-gray-200'
                }`}
              >
                <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Reasoning Trail</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                  {mapData.reasoning_trail}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
