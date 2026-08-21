// src/components/LifecyclePipeline.jsx
// AI-assisted (Cursor) — review before merge.
import React from 'react';

// The full path a model takes, from picking silicon to serving tokens.
// Each stage carries the concrete proof point for that step.
const STAGES = [
  {
    id: 'silicon',
    short: 'Silicon',
    icon: '🔩',
    title: 'GPU & Capacity Planning',
    outcome: 'Pick the right accelerator and rack topology for the workload mix.',
    tags: ['GB200 / GB300 NVL72', 'B200 / B100', 'H200 / H100', 'GH200', 'NVLink & NVSwitch', 'Power & TCO modelling'],
    proof: 'Sized NVL72 rack-scale vs. HGX node deployments against real training and inference profiles.',
  },
  {
    id: 'baremetal',
    short: 'Bare metal',
    icon: '🧱',
    title: 'Bare Metal & Facility',
    outcome: 'Rack it, power it, cool it — then make it boot the same way every time.',
    tags: ['Rack & busway design', 'Direct liquid cooling', 'CDU & rear-door HX', 'BMC / Redfish', 'BIOS & firmware baselines', 'PXE provisioning'],
    proof: 'Commissioned direct-liquid-cooling loops and tuned flow rate and ΔT against live GPU thermal telemetry.',
  },
  {
    id: 'commissioning',
    short: 'Commissioning',
    icon: '🔌',
    title: 'Fabric & Commissioning',
    outcome: 'Prove the cluster actually performs before anyone trains on it.',
    tags: ['InfiniBand NDR / XDR', 'Spectrum-X', 'Rail-optimised topology', 'UFM', 'BER & link validation', 'NCCL all-reduce', 'Burn-in & ATP sign-off'],
    proof: 'Took NVL72-class racks from cable plant all the way to collective-performance acceptance.',
  },
  {
    id: 'platform',
    short: 'Platform',
    icon: '🧮',
    title: 'Platform & Scheduling',
    outcome: 'Turn a pile of hardware into a multi-tenant, observable product.',
    tags: ['Slurm', 'Kubernetes GPU Operator', 'Run:ai', 'Base Command', 'MIG', 'GPUDirect Storage', 'DCGM', 'Prometheus / Grafana'],
    proof: 'Multi-tenant scheduling plus automated node health checks to keep fleet utilisation high.',
  },
  {
    id: 'pretraining',
    short: 'Pretraining',
    icon: '🧬',
    title: 'Pretraining at Scale',
    outcome: 'Scale a run across thousands of GPUs without giving back throughput.',
    tags: ['Megatron-Core', 'NeMo', 'FP8 / NVFP4', 'Transformer Engine', 'TP / PP / EP / CP', 'MoE routing', 'Checkpoint & restart', 'MFU tuning'],
    proof: 'Reusable per-generation recipes that cut time-to-target-throughput on new silicon from quarters to days.',
  },
  {
    id: 'finetuning',
    short: 'Finetuning',
    icon: '🎯',
    title: 'Finetuning & Alignment',
    outcome: 'Adapt base models to the domain, cheaply and measurably.',
    tags: ['SFT', 'LoRA / QLoRA', 'PEFT', 'DPO / RLHF', 'Distillation', 'Data curation', 'Eval harnesses'],
    proof: 'Domain finetunes shipped behind evaluation gates rather than subjective judgement.',
  },
  {
    id: 'application',
    short: 'Application',
    icon: '🚀',
    title: 'Inference & Application',
    outcome: 'Serve tokens to real users at a cost that survives scrutiny.',
    tags: ['TensorRT-LLM', 'vLLM / SGLang', 'Quantisation', 'KV-cache & batching', 'RAG', 'Agents', 'Autoscaling', 'Cost per token'],
    proof: 'Shipped "Chat with PDF" (HaidongGPT) as an official cloud marketplace product.',
  },
];

export default function LifecyclePipeline() {
  return (
    <section className="lifecycle-section animate-fade-up animation-delay-2">
      <h2 className="gradient-heading">AI factory lifecycle</h2>
      <p className="lifecycle-intro">
        End to end, silicon to product. I have shipped work at every one of these
        stages — most people specialise in one or two.
      </p>

      {/* At-a-glance flow. Decorative: the same stages are listed semantically below. */}
      <ol className="lifecycle-flow" aria-hidden="true">
        {STAGES.map((stage, i) => (
          <li className="flow-node" key={stage.id}>
            <span className="flow-index">{String(i + 1).padStart(2, '0')}</span>
            <span className="flow-icon">{stage.icon}</span>
            <span className="flow-label">{stage.short}</span>
          </li>
        ))}
      </ol>

      <ol className="lifecycle-stages">
        {STAGES.map((stage, i) => (
          <li className="lifecycle-stage" key={stage.id}>
            <div className="stage-marker" aria-hidden="true">
              <span className="stage-number">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <div className="stage-card">
              <h3 className="stage-title">
                <span className="stage-icon" aria-hidden="true">{stage.icon}</span>
                {stage.title}
              </h3>
              <p className="stage-outcome">{stage.outcome}</p>
              <ul className="stage-tags">
                {stage.tags.map((tag) => (
                  <li className="stage-tag" key={tag}>{tag}</li>
                ))}
              </ul>
              <p className="stage-proof">
                <span className="proof-label">Proven</span>
                {stage.proof}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="lifecycle-loop">
        Production telemetry feeds back into capacity planning — the lifecycle is a loop, not a line.
      </p>
    </section>
  );
}
