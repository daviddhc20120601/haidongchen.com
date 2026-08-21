// src/pages/Home.jsx
// AI-assisted (Cursor) — review before merge.
import React from 'react';
import { Link } from 'react-router-dom';
import LifecyclePipeline from '../components/LifecyclePipeline.jsx';

const PLATFORMS = [
  'GB200 NVL72', 'GB300 NVL72', 'B200 / B100', 'H200 / H100', 'GH200 Grace-Hopper',
  'DGX / HGX', 'L40S', 'Quantum-2 InfiniBand', 'Spectrum-X Ethernet', 'BlueField-3 DPU',
];

const SKILL_DOMAINS = [
  {
    key: 'ai-factory',
    icon: '🏭',
    title: 'AI Factory Engineering',
    blurb:
      'Rack-to-cluster design and bring-up of GPU AI factories: capacity modelling, power and thermal budgeting, NVLink domain planning, and multi-tenant scheduling that keeps thousands of accelerators busy.',
    tags: [
      'Rack-scale architecture', 'NVL72 domain design', 'NVLink / NVSwitch topology',
      'Capacity & power budgeting', 'GPU cluster bring-up', 'Acceptance testing (ATP)',
      'Multi-tenancy & MIG', 'Base Command', 'Run:ai', 'Slurm', 'Kubernetes GPU Operator',
      'DCGM telemetry', 'Fleet reliability / MTBF', 'NCP reference architecture',
    ],
  },
  {
    key: 'hpc',
    icon: '🕸️',
    title: 'HPC Networking & Commissioning',
    blurb:
      'Fabric design and physical commissioning for rail-optimised GPU clusters — from cable plant validation through collective-level performance sign-off.',
    tags: [
      'InfiniBand NDR / XDR', 'Quantum-2 / Quantum-X800', 'Spectrum-X', 'RoCEv2',
      'Rail-optimised fabric', 'SHARP in-network reduction', 'Adaptive routing',
      'UFM fabric management', 'Link & cable validation', 'Bit-error / BER sweeps',
      'NCCL / RCCL benchmarking', 'MPI & collective tuning', 'Storage fabric (GPUDirect)',
      'Burn-in & soak testing',
    ],
  },
  {
    key: 'cooling',
    icon: '❄️',
    title: 'Liquid Cooling & Facility Commissioning',
    blurb:
      'Direct-to-chip and immersion cooling loops commissioned end to end, tuned against real GPU thermal telemetry rather than nameplate numbers.',
    tags: [
      'Direct liquid cooling (DLC)', 'CDU commissioning', 'Rear-door heat exchangers',
      'Immersion cooling', 'Coolant loop balancing', 'Flow rate & ΔT tuning',
      'Leak detection & interlocks', 'Facility water integration', 'Power distribution / busway',
      'PUE / WUE optimisation', 'BMS & DCIM integration', 'Thermal telemetry pipelines',
    ],
  },
  {
    key: 'tuning',
    icon: '🎛️',
    title: 'Model Tuning & Training Recipes',
    blurb:
      'Squeezing tokens-per-second out of new silicon: precision strategy, parallelism layout, and kernel-level tuning to build repeatable recipes for Blackwell and Hopper generations.',
    tags: [
      'FP8 / NVFP4 precision', 'Transformer Engine', 'Megatron-Core', 'NeMo Framework',
      'TensorRT-LLM', 'vLLM / SGLang', 'TP / PP / EP / CP parallelism', 'MoE routing & balance',
      'Blackwell (GB/B-series) recipes', 'Hopper (H-series) recipes', 'CUDA Graphs',
      'Kernel autotuning', 'Checkpoint & restart at scale', 'MLPerf-style benchmarking',
    ],
  },
  {
    key: 'gen-ai',
    icon: '🧠',
    title: 'Generative AI & Agents',
    blurb:
      'Production LLM systems: retrieval, tool-using agents, evaluation harnesses, and the ops discipline to keep them stable once real traffic arrives.',
    tags: [
      'Agentic AI', 'RAG', 'ReAct', 'LLM-ops', 'Context & memory design',
      'Inference serving & autoscaling', 'Vector databases', 'Evaluation harnesses',
      'GitOps for ML', 'MLOps pipelines',
    ],
  },
  {
    key: 'infra',
    icon: '⚙️',
    title: 'Cloud-Native Infrastructure & Data',
    blurb:
      'The platform layer underneath the accelerators — automation, observability, streaming data, and the security posture regulated customers ask for.',
    tags: [
      'Kubernetes', 'Terraform', 'Ansible', 'CI/CD & GitOps', 'Prometheus / Grafana',
      'SRE & incident response', 'Apache Flink', 'Spark', 'Kafka', 'Iceberg / Hudi',
      'SOC / SIEM', 'ISO 27001 & GDPR',
    ],
  },
];

const OUTCOMES = [
  {
    label: 'Cluster bring-up',
    text:
      'Commission NVL72-class Blackwell racks end to end — fabric, liquid cooling loop, and scheduler — through to collective-performance acceptance.',
  },
  {
    label: 'Recipe tuning',
    text:
      'Build reusable training and inference recipes per GPU generation, so new silicon reaches target throughput in days instead of quarters.',
  },
  {
    label: 'Scale delivery',
    text:
      'Led a 40+ engineer delivery team for a live ICC T20 cricket streaming event, cutting hosting cost by 30% (Alibaba Group).',
  },
  {
    label: 'Product',
    text:
      'Shipped "Chat with PDF" (HaidongGPT) as an official cloud marketplace product, and speak regularly at Cloud Expo Asia and developer summits.',
  },
];

export default function Home() {
  return (
    <div className="home-container animate-fade-in">
      <section className="hero-panel">
        <span className="hero-eyebrow">GPU AI Factory · Principal Engineer</span>
        <h1 className="nv-gradient-text">Haidong Chen</h1>
        <p className="hero-tagline">
          I design, commission, and tune large-scale NVIDIA GPU AI factories — the fabric,
          the cooling loop, the scheduler, and the training recipes that run on top of them.
        </p>
        <p className="hero-body">
          Currently a principal engineer on AI factory build-out at Firmus, an NVIDIA Cloud
          Partner, working across Blackwell and Hopper fleets. Before that, a decade across
          generative AI, cloud infrastructure, data platforms, and security.
        </p>

        <div className="hero-stats">
          <div className="stat">
            <span className="stat-value">NVL72</span>
            <span className="stat-label">rack-scale systems</span>
          </div>
          <div className="stat">
            <span className="stat-value">FP8 / NVFP4</span>
            <span className="stat-label">precision recipes</span>
          </div>
          <div className="stat">
            <span className="stat-value">XDR / NDR</span>
            <span className="stat-label">InfiniBand fabrics</span>
          </div>
          <div className="stat">
            <span className="stat-value">10+ yrs</span>
            <span className="stat-label">building at scale</span>
          </div>
        </div>

        <div className="action-links">
          <Link to="/about" className="btn">Full Profile</Link>
          <Link to="/talks" className="btn btn-ghost">Talks &amp; Writing</Link>
        </div>
      </section>

      <section className="platform-strip animate-fade-up animation-delay-1">
        <h2 className="strip-heading">Platforms &amp; silicon</h2>
        <div className="chip-row">
          {PLATFORMS.map((p) => (
            <span className="chip" key={p}>{p}</span>
          ))}
        </div>
      </section>

      <LifecyclePipeline />

      <section className="skills-section animate-fade-up animation-delay-2">
        <h2 className="gradient-heading">Skills</h2>
        <div className="skill-grid">
          {SKILL_DOMAINS.map((domain) => (
            <article className={`skill-domain ${domain.key}`} key={domain.key}>
              <div className="skill-domain-head">
                <span className="skill-icon" aria-hidden="true">{domain.icon}</span>
                <h3>{domain.title}</h3>
              </div>
              <p className="skill-blurb">{domain.blurb}</p>
              <ul className="skill-tags">
                {domain.tags.map((tag) => (
                  <li className="skill-tag" key={tag}>{tag}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="outcomes-section animate-fade-up animation-delay-3">
        <h2 className="gradient-heading">Selected outcomes</h2>
        <ul className="news-list">
          {OUTCOMES.map((item) => (
            <li key={item.label}>
              <span className="news-date">{item.label}</span>
              <span className="news-content">{item.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
