const { spawn } = require("child_process");
const path = require("path");

const pythonScript = path.resolve(__dirname, "..", "ml", "predict.py");
const pythonCommand = process.platform === "win32" ? "py" : "python";

function runModelTask(task, payload = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(pythonCommand, [pythonScript, "--task", task], {
      cwd: path.resolve(__dirname, "..", ".."),
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
        PYTHONUTF8: "1",
      },
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("error", reject);

    child.on("close", (code) => {
      const output = stdout.trim();
      if (!output) {
        reject(new Error(stderr || `ML task ${task} exited with code ${code}`));
        return;
      }

      try {
        const parsed = JSON.parse(output);
        if (parsed.error) {
          reject(new Error(parsed.error));
          return;
        }
        resolve(parsed);
      } catch (error) {
        reject(new Error(`Failed to parse ML output for ${task}: ${error.message}`));
      }
    });

    child.stdin.end(JSON.stringify(payload));
  });
}

module.exports = {
  classifyResume: (payload) => runModelTask("classify-resume", payload),
  getModelStatus: () => runModelTask("model-status"),
  predictSelection: (payload) => runModelTask("predict-selection", payload),
  rankCandidates: (payload) => runModelTask("rank-candidates", payload),
  recommendJobs: (payload) => runModelTask("recommend-jobs", payload),
  scoreResume: (payload) => runModelTask("score-resume", payload),
  skillGap: (payload) => runModelTask("skill-gap", payload),
};
