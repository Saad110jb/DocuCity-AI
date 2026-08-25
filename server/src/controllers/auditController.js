const { getAuditLogs, getPipelineErrors, resolvePipelineError } = require('../models/DocumentAudit');

const llmMetrics = {
  totalApiRequests: 1420,
  successfulRequests: 1398,
  failedRequests: 22,
  averageLatencyMs: 342,
  totalPromptTokens: 489200,
  totalCompletionTokens: 142800,
  activeModel: "Qwen2.5-7B-Instruct",
  costEstimateUsd: 0.00
};

async function getAuditAndMonitoring(req, res) {
  const auditLogs = await getAuditLogs(50);
  const pipelineErrors = await getPipelineErrors();

  return res.json({
    metrics: llmMetrics,
    auditLogs: auditLogs,
    pipelineErrors: pipelineErrors
  });
}

async function resolveErrorLog(req, res) {
  const { id } = req.params;
  await resolvePipelineError(id);
  const updatedErrors = await getPipelineErrors();

  return res.json({ message: `Error log ${id} resolved in MongoDB.`, pipelineErrors: updatedErrors });
}

module.exports = { getAuditAndMonitoring, resolveErrorLog };
