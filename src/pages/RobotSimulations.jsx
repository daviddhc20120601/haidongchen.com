// src/pages/RobotSimulations.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMarkdownFiles } from '../utils/MarkdownService.jsx';

/**
 * 机器人仿真列表页面组件
 * 
 * 功能：
 * - 从JSON数据或API加载机器人仿真博客列表
 * - 显示每篇仿真博客的标题、日期、类型、模拟器等信息
 * - 提供链接跳转到详细页面
 */
export default function RobotSimulations() {
  const [simulations, setSimulations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSimulations() {
      setIsLoading(true);
      setError(null);
      try {
        const files = await getMarkdownFiles('robot-simulations');
        setSimulations(files);
      } catch (err) {
        console.error('Error loading robot simulations:', err);
        setError(`Failed to load robot simulations data. ${err.message}`);
        setSimulations([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadSimulations();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading robot simulations...</p>
    </div>
  );

  return (
    <div className="robot-simulations-container">
      <div className="page-header">
        <h1 className="page-title">Robot Simulation</h1>
        <p className="page-description">
          Tutorials, guides, and experiments in robot simulation using ROS, Gazebo, and other tools.
        </p>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="simulations-list">
        {simulations.length > 0 ? (
          simulations.map(sim => (
            <div key={sim.id} className="simulation-item publication">
              <h3 className="simulation-title publication-title">
                <Link to={`/robot-simulation/${sim.id}`}>{sim.title}</Link>
              </h3>
              {sim.date && <p className="simulation-date publication-date">Date: {formatDate(sim.date)}</p>}
              {sim.type && <p className="simulation-type publication-venue">Type: {sim.type}</p>}
              {sim.simulator && <p className="simulation-simulator publication-venue">Simulator: {sim.simulator}</p>}
              {sim.excerpt && <p className="simulation-excerpt">{sim.excerpt}</p>}
              {sim.tags && sim.tags.length > 0 && (
                <div className="simulation-tags">
                  {sim.tags.map((tag, idx) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                </div>
              )}
              <div className="simulation-links publication-links">
                <Link to={`/robot-simulation/${sim.id}`} className="btn btn-sm">View Details</Link>
              </div>
            </div>
          ))
        ) : (
          <p>No robot simulation articles available at this time.</p>
        )}
      </div>
    </div>
  );
}
