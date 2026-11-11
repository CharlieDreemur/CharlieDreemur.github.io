// 全站导航和目录。知识点清单只在这里维护一份（PAGES）：
//   - index.html：每个知识点只出现一次，带三类标签（公司、掌握情况、知识分类），可以按标签筛选、搜索、换排序
//   - 其他页面：顶部加"目录 + 题号 + 上一题/下一题"和本页的标签，底部加同类知识点和翻页，键盘 ← → 翻页
// 新增一页：在 PAGES 里加一行 [编号, 文件名（不带 .html）, 标题, 是否 ★]，在页面 <head> 里引用本文件，
//           再重新生成下面的 KP（公司和分类标签，做法见 NOTES.md 的“标签和筛选”一节）。
// 掌握情况不写在这里，写在 assets/progress.js；键可以是 mock 题号（AS1、A1），也可以是文件名（kmeans）。
(function () {
  var PAGES = [
    { sec: "01 Classic ML", items: [
      ["1.1", "overfit-bias-variance", "overfit / underfit、bias-variance", true],
      ["1.2", "regularization-l1-l2", "L1 vs L2 regularization"],
      ["1.3", "bagging-boosting", "bagging vs boosting（含 XGBoost）"],
      ["1.4", "regression", "linear / logistic regression、MLE、MSE"],
      ["1.5", "kmeans", "K-means", true],
      ["1.6", "pca", "PCA derivation"],
      ["1.7", "euclidean-cosine", "Euclidean distance 和 cosine similarity 的关系"]
    ]},
    { sec: "02 Deep Learning", items: [
      ["2.1", "vanishing-gradient", "vanishing / exploding gradient", true],
      ["2.2", "activation", "activation function：sigmoid、softmax、ReLU"],
      ["2.3", "batchnorm-layernorm", "BatchNorm vs LayerNorm"],
      ["2.4", "dropout", "Dropout", true],
      ["2.5", "cnn", "CNN"],
      ["2.6", "optimizer", "optimizer：SGD、Momentum、Adam、AdamW"],
      ["2.7", "knowledge-distillation", "knowledge distillation"],
      ["2.8", "gpu-numpy", "为什么 GPU 比 CPU 快、NumPy 比 Python list 快"]
    ]},
    { sec: "03 Transformer & LLM", items: [
      ["3.1", "attention-scaling", "self-attention 为什么除以 √d_k", true],
      ["3.2", "transformer-architecture", "Transformer architecture"],
      ["3.3", "multi-head-attention", "multi-head attention：流程、parameter count、为什么 multi-head"],
      ["3.4", "transformer-complexity", "Transformer 的复杂度怎么算：time、memory、parameter、FLOPs"],
      ["3.5", "mqa-gqa-mla", "MQA、GQA、MLA：怎么减小 KV cache"],
      ["3.6", "positional-encoding", "positional encoding"],
      ["3.7", "rope", "RoPE 与 long context extrapolation"],
      ["3.8", "rnn-vs-transformer", "RNN vs Transformer", true],
      ["3.9", "bert-vs-gpt", "BERT vs GPT"],
      ["3.10", "decoding", "decoding：temperature、top-k、top-p、beam search"],
      ["3.11", "kv-cache", "KV cache"],
      ["3.12", "hallucination", "怎么避免 LLM hallucination", true],
      ["3.13", "rag", "RAG：pipeline 与三个难点"],
      ["3.14", "finetune-lora", "fine-tuning、prompt engineering、RAG 怎么选；LoRA"],
      ["3.15", "rlhf-dpo-grpo", "RLHF、DPO、GRPO"],
      ["3.16", "llm-evaluation", "LLM evaluation"],
      ["3.17", "agent-mcp", "Agent、tool calling 和 MCP"],
      ["3.18", "inference-cost", "怎么降低 LLM 的 inference cost 和 token 用量"]
    ]},
    { sec: "06 Training Infra（训练框架与分布式训练）", items: [
      ["6.1", "tp-linear", "TP：Column / Row Parallel Linear，MLP 和 attention 怎么切"],
      ["6.2", "tp-communication", "TP 的 communication：一层几次、每次多少数据"],
      ["6.3", "sequence-parallel", "Sequence Parallel（Megatron SP）"],
      ["6.4", "vocab-parallel", "Vocab parallelism：embedding 和 LM head 怎么切"],
      ["6.5", "pipeline-parallel", "Pipeline Parallel：bubble、1F1B、interleaved"],
      ["6.6", "dp-zero-fsdp", "DP、ZeRO、FSDP 与 distributed optimizer"],
      ["6.7", "context-parallel", "Context Parallel 与 Ulysses"],
      ["6.8", "moe-expert-parallel", "MoE 与 Expert Parallel"],
      ["6.9", "parallelism-config", "给定模型和 cluster，怎么选 parallelism 配置"],
      ["6.10", "training-memory", "Training memory 由什么构成，怎么估"],
      ["6.11", "flops-mfu", "Parameter count、FLOPs、6ND、MFU 和训练时长"],
      ["6.12", "allreduce", "all-reduce communication volume，ring vs tree"],
      ["6.13", "rdma-gpudirect", "RDMA 和 GPUDirect"],
      ["6.14", "activation-recompute", "Activation recomputation"],
      ["6.15", "mixed-precision", "Mixed precision：FP16、BF16、FP8"],
      ["6.16", "quantization-int8", "Quantization：FP32 转 INT8"],
      ["6.17", "overlap", "Compute 和 communication 怎么 overlap"],
      ["6.18", "debug-slow-hang", "训练慢、GPU utilization 低、训练 hang 住怎么查"],
      ["6.19", "autograd", "从零实现 autograd"],
      ["6.20", "gradient-accumulation", "Gradient accumulation；为什么 PyTorch 默认累加 gradient"],
      ["6.21", "stride-view", "stride、contiguous、view 与 reshape"],
      ["6.22", "amdahl", "Amdahl's law"],
      ["6.23", "gpu-memory-hierarchy", "GPU memory hierarchy 与 thread 上限"],
      ["6.24", "matmul-roofline", "matmul：complexity、tiling、CPU vs GPU、roofline"],
      ["6.25", "flashattention", "FlashAttention 与 online softmax"],
      ["6.26", "coalescing-bank-conflict", "Memory coalescing、bank conflict、warp divergence"],
      ["6.27", "cpp-virtual-inline", "C++：virtual function 与 inline"],
      ["6.28", "cpp-smart-pointer", "C++：smart pointer 与 reference counting"],
      ["6.29", "megatron-recent", "Megatron Core 最近三个月发布了什么"],
      ["6.30", "megatron-fsdp-v2", "Megatron-FSDP v2 和 Hybrid FSDP"],
      ["6.31", "gtp", "Generalized Tensor Parallelism（GTP）"],
      ["6.32", "moe-ep-communication", "MoE 的 EP communication：NCCL EP、ShortcutMoE、MegaMoE"],
      ["6.33", "bitwise-determinism", "Bitwise determinism"],
      ["6.34", "low-precision-cuda-graph", "MXFP8、NVFP4 和 full-iteration CUDA Graph"],
      ["6.35", "nemotron-3-ultra", "Nemotron 3 Ultra tech report：550B 的 hybrid MoE 怎么训练和 scale"]
    ]},
    { sec: "08 Agentic infra 和 kernel agent（Unity 方向）", items: [
      ["8.1", "flashvector", "FlashVector：agent 怎么优化整个 serving stack"],
      ["8.2", "kernel-agent-design", "设计一个自动优化 CUDA kernel 的 agent"],
      ["8.3", "noise-floor", "Noise floor：agent 测到的提升是不是真的"],
      ["8.4", "kernel-correctness", "怎么验证 agent 生成的 kernel 是正确的"],
      ["8.5", "kernel-benchmark", "怎么公平地 benchmark 一个 kernel"],
      ["8.6", "agent-sandbox", "Sandbox 和 verifier 隔离：怎么安全地跑 agent 生成的代码"],
      ["8.7", "local-vs-e2e", "Kernel 快了，端到端为什么不一定快"],
      ["8.8", "reward-hacking", "Reward hacking：agent 怎么钻评测的漏洞"],
      ["8.9", "offline-pipeline-optimization", "把 profile 到 verify 的循环用到 offline 的 data 和 training pipeline"],
      ["8.10", "agent-eval-regression", "Agent 改了一版，怎么知道变好了、别处没退化"],
      ["8.11", "context-compaction", "长任务的 context compaction：什么时候压，压什么"],
      ["8.12", "agent-batch-runs", "5000 个 task 一夜跑完：怎么大批量、可比较地跑 agent"],
      ["8.13", "tool-failure-retry", "Tool 调用失败：哪些重试，谁判断，怎么恢复"],
      ["8.14", "agent-observability", "Agent 的 observability：记什么，慢了或贵了怎么查"],
      ["8.15", "agent-permissions", "Agent 的权限和 guardrail：读写怎么分，什么时候要人确认"],
      ["8.16", "agent-knowledge-base", "Agent 的 knowledge base 和 memory 怎么管"],
      ["8.17", "agent-to-production", "Agent 的改动怎么进生产：PR、review、canary"],
      ["8.18", "mini-coding-agent", "手写一个 mini coding agent：要哪些 tool，edit 冲突怎么处理"],
      ["8.19", "sub-agents", "Sub-agent 和 multi-agent：什么时候拆，context 怎么传"],
      ["8.20", "ai-coding-tools", "你怎么用 AI coding 工具，怎么验收 AI 的产出"],
      ["8.21", "kernel-search-methods", "Iterative refinement、evolutionary search 和 RL 怎么选"],
      ["8.22", "kernel-rl-reward", "Kernel RL 的 reward 怎么设计"],
      ["8.23", "nsight-profiling", "Nsight Systems 和 Nsight Compute；memory bound 还是 compute bound"],
      ["8.24", "kernel-fusion", "Kernel fusion：为什么快，什么时候反而慢"],
      ["8.25", "gpu-reduction", "Reduction 怎么优化：在 GPU 上对大数组求和"],
      ["8.26", "triton-vs-cuda", "Triton 和 CUDA 的区别，什么时候用 Triton"],
      ["8.27", "torch-compile", "torch.compile 做了什么，和 eager 有什么区别"],
      ["8.28", "cuda-graph", "CUDA Graph 和 launch overhead"],
      ["8.29", "occupancy", "Occupancy：受什么限制，是不是越高越好"],
      ["8.30", "kernelbench", "KernelBench 是什么，fast_p 怎么算，有什么缺陷"],
      ["8.31", "ads-kernel-optimization", "广告公司为什么要做 kernel 优化，和 offline infra 的关系"]
    ]},
    { sec: "09 Agentic Search（Apple Siri 方向）", items: [
      ["9.1", "grounded-response", "Siri 调完 tool 后怎么生成 grounded 回答，怎么 eval"],
      ["9.2", "synthetic-data-quality", "怎么评估 LLM 合成数据的质量"],
      ["9.3", "agentic-search-eval", "Agentic search 的 offline eval；新版本是否真的更好"],
      ["9.4", "train-search-agent", "Search agent 怎么训：reward、token masking、PPO vs GRPO、reward hacking"],
      ["9.5", "search-loop", "多步 search loop：为什么单次 RAG 不够，什么时候停"],
      ["9.6", "hard-constraints", "Hard constraint 和 preference 怎么分开处理"],
      ["9.7", "llm-harness", "LLM harness：agent harness vs eval harness"],
      ["9.8", "tool-arguments", "Tool calling 最容易错在哪：为什么 argument 是瓶颈"],
      ["9.9", "annotation-judge", "标注规范、主观 bias、LLM judge 校准"],
      ["9.10", "agentic-vs-search", "怎么证明 agentic search 比普通 search 好"],
      ["9.11", "over-searching", "Search 越多越好吗：over-searching 和 abstention"],
      ["9.12", "long-document", "文件放不进 context window：找一段具体内容，总结整本书", true]
    ]}
  ];

  // Apple 第一轮 mock 的题号和顺序，和 ml-八股/09 的两张细题表一致。每行 [题号, 链接, 标题]。
  // 这里只提供题号和顺序：目录里每个知识点只列一次，题号显示成标签；状态写在 assets/progress.js。
  var MD9 = "#";
  var MOCK = { sec: "Apple 第一轮 mock", groups: [
    { name: "Agentic Search 细题（先过）", items: [
      ["AS1", "grounded-response.html", "Siri 调完 tool 后怎么生成 grounded 回答，怎么 eval"],
      ["AS2", "synthetic-data-quality.html", "合成数据的输出质量怎么评估"],
      ["AS3", "agentic-search-eval.html", "Agentic search 的 offline eval 和显著性"],
      ["AS4", "train-search-agent.html", "Search agent 怎么训：reward、token masking、PPO vs GRPO"],
      ["AS5", "search-loop.html", "多步 search loop：decomposition、什么时候停、budget"],
      ["AS6", "hard-constraints.html", "Hard constraint 和 preference 怎么分开"],
      ["AS7", "llm-harness.html", "LLM harness：agent harness vs eval harness"],
      ["AS8", "tool-arguments.html", "为什么 tool argument 是主要瓶颈，怎么改"],
      ["AS9", "annotation-judge.html", "标注规范、主观 bias、LLM judge 校准"],
      ["AS10", "agentic-vs-search.html", "怎么证明 agentic 比普通 search 好"],
      ["AS11", "over-searching.html", "Over-searching 和 abstention"]
    ]},
    { name: "Apple 细题（之后过）", items: [
      ["A1", "multi-head-attention.html", "Multi-head attention：流程、shape、complexity、parameter、mask"],
      ["A2", "finetune-lora.html", "Fine-tuning 和 LoRA；quantization 原理"],
      ["A3", "kv-cache.html", "KV cache 和生成循环；top-k、top-p"],
      ["A4", "train-search-agent.html", "Reward model 怎么设计，hacking 怎么解决"],
      ["A5", "synthetic-data-quality.html", "合成数据质量；CoT 训练数据长什么样"],
      ["A6", "annotation-judge.html", "标注规范，怎么对齐人的主观 bias"],
      ["A7", "flops-mfu.html", "前向 vs 后向计算量；训练 FLOPs"],
      ["A8", "dropout.html", "Dropout：手写前向和后向，为什么管用"],
      ["A9", "batchnorm-layernorm.html", "BatchNorm：讲清并手写"],
      ["A10", "optimizer.html", "Adam vs AdamW；L1/L2"],
      ["A11", "bert-vs-gpt.html", "BERT vs GPT"],
      ["A12", MD9, "分类模型的数据配比和真实分布"],
      ["A13", MD9, "同样数据训 70B，学习率更高还是更低"],
      ["A14", "inference-cost.html", "LLM inference 的主要瓶颈"],
      ["A15", MD9, "vLLM、PD 分离、SGLang；GRPO 的 TP、DP"]
    ]}
  ]};
  var ST = { "对": "st-ok", "过了一遍": "st-seen", "没过": "st-fail", "未做": "st-none" };
  var WEAK = ["没过", "过了一遍", "对"];   // 一个知识点有几条记录时，显示最弱的那条

  /* CPSC:BEGIN CPSC 4880 的题，由 tools/ml-速查/build_cpsc4880.py 生成，不要手改 */
  var CPSC = [
    ["A1.1", "a1-1", "Self-attention 的时间复杂度是多少？推导一下。", ["Transformer", "LLM inference"], "transformer-complexity"],
    ["A1.2", "a1-2", "为什么 prefill 是 compute-bound、decode 是 memory-bandwidth-bound？这对优化方向意味着什么？", ["Transformer", "LLM inference"], null],
    ["A1.3", "a1-3", "KV cache 是什么？为什么能缓存？它省了什么、没省什么？", ["Transformer", "LLM inference"], "kv-cache"],
    ["A1.4", "a1-4", "用一句话解释 FlashAttention。", ["Transformer", "LLM inference"], "flashattention"],
    ["A1.5", "a1-5", "FlashAttention 减少 FLOPs 了吗？为什么更快？解决不了什么？", ["Transformer", "LLM inference"], "flashattention"],
    ["A1.6", "a1-6", "为什么 attention logits 要除以 √d_k？", ["Transformer", "LLM inference"], "attention-scaling"],
    ["A2.1", "a2-1", "MQA / GQA 和 MHA 有什么区别？为什么要用？", ["LLM inference", "Transformer"], "mqa-gqa-mla"],
    ["A2.2", "a2-2", "MLA 怎么压缩 KV cache？和 GQA 的本质区别？", ["LLM inference", "Transformer"], "mqa-gqa-mla"],
    ["A3.1", "a3-1", "SSM（如 Mamba）处理长文本相对 Transformer 的主要优势是什么？代价是什么？", ["Transformer", "LLM inference"], null],
    ["A3.2", "a3-2", "序列变长时，KV cache 和 SSM state 的显存分别怎么增长？", ["Transformer", "LLM inference"], null],
    ["A3.3", "a3-3", "Mamba 的 selection 是什么？为什么需要？", ["Transformer", "LLM inference"], null],
    ["A3.4", "a3-4", "Mamba-2 的核心想法（SSD）是什么？相比 Mamba-1 牺牲了什么、换来了什么？", ["Transformer", "LLM inference"], null],
    ["A3.5", "a3-5", "Lightning Attention（MiniMax-01）的主要想法和取舍？", ["Transformer", "LLM inference"], null],
    ["A3.6", "a3-6", "KDA（Kimi K3）怎么更新记忆？forget gate 和 delta rule 各做什么？", ["Transformer", "LLM inference"], null],
    ["A4.1", "a4-1", "NSA 的主要想法是什么？为什么要在训练时就用稀疏，而不是只在推理时？", ["Transformer", "LLM inference"], null],
    ["A4.2", "a4-2", "DSA（DeepSeek-V3.2）的主要想法是什么？", ["Transformer", "LLM inference"], null],
    ["A4.3", "a4-3", "\"只读一部分历史\"（NSA / DSA）和\"压缩成固定状态\"（SSM / linear attention）各放弃了什么？", ["Transformer", "LLM inference"], null],
    ["A5.1", "a5-1", "前沿模型为什么混合不同的 sequence-mixing 层？用 Kimi K3 或 Nemotron 3 Ultra 说明各层的分工。", ["Transformer"], null],
    ["A6.1", "a6-1", "为什么用稀疏模型？routing 怎么工作？", ["Transformer", "分布式训练"], "moe-expert-parallel"],
    ["A6.2", "a6-2", "为什么需要 load balancing？两种方法分别是什么？", ["Transformer", "分布式训练"], "moe-expert-parallel"],
    ["A6.3", "a6-3", "MoE 带来哪些额外成本？", ["Transformer", "分布式训练"], "moe-expert-parallel"],
    ["A7.1", "a7-1", "RoPE 怎么工作？为什么能编码相对位置？", ["Transformer"], "rope"],
    ["A7.2", "a7-2", "RoPE 模型为什么在训练长度之外会失效？YaRN 怎么解决？", ["Transformer"], "rope"],
    ["A7.3", "a7-3", "Kimi K3 为什么在 MLA 层不用位置编码（NoPE）？token 顺序信息从哪来？", ["Transformer"], null],
    ["A7.4", "a7-4", "MRoPE 怎么工作？", ["Transformer"], null],
    ["A8.1", "a8-1", "MTP 是什么？训练和推理时各有什么用？", ["LLM inference", "LLM 训练"], null],
    ["A9.1", "a9-1", "把图像接入 LLM 的 late fusion（Qwen2.5-VL）和 early fusion（Chameleon）各有什么取舍？", ["Transformer"], null],
    ["A9.2", "a9-2", "多模态 LLM 是否需要每种模态各自的 encoder / decoder？", ["Transformer"], null],
    ["A9.3", "a9-3", "Kimi K3 怎么处理视觉输入？", ["Transformer"], null],
    ["B1.1", "b1-1", "Kaplan 和 Chinchilla 对\"怎么分配计算\"的结论有什么不同？为什么现在的模型又常被训练到超过 compute-optimal？", ["LLM 训练"], null],
    ["B2.1", "b2-1", "过滤、去重、质量分类器各做什么？", ["LLM 训练"], null],
    ["B2.2", "b2-2", "怎么公平地评测一个数据集（DCLM）？小模型的结果能预测大模型吗？", ["LLM 训练"], null],
    ["B2.3", "b2-3", "Mid-training / annealing 的主要目标有哪些？", ["LLM 训练"], null],
    ["B2.4", "b2-4", "MiniMax-01 怎么判断重复高质量数据是有用还是会过拟合？", ["LLM 训练"], null],
    ["B2.5", "b2-5", "Data mix 怎么定（RegMix、Llama 3）？为什么不能全用\"高质量\"数据？", ["LLM 训练"], null],
    ["B3.1", "b3-1", "大规模训练不稳定有哪些来源？normalization、precision、optimizer 三类修法分别针对什么？", ["训练与优化", "LLM 训练"], null],
    ["B3.2", "b3-2", "Chameleon：QK-Norm、norm reordering、z-loss 各解决什么？", ["训练与优化", "LLM 训练"], null],
    ["B3.3", "b3-3", "Switch：selective precision、小 init、expert dropout 各解决什么？", ["训练与优化", "LLM 训练"], null],
    ["B3.4", "b3-4", "MiniMax-01：PostNorm 和 PreNorm 有什么区别？为什么选 PostNorm？", ["训练与优化", "LLM 训练"], null],
    ["B3.5", "b3-5", "Nemotron 3 Ultra：NVFP4 预训练怎么做？切到 BF16 后为什么发散、怎么修？", ["训练与优化", "LLM 训练"], "nemotron-3-ultra"],
    ["B3.6", "b3-6", "Muon：weight decay 和 update RMS 匹配为什么能稳定扩展？", ["训练与优化", "LLM 训练"], null],
    ["B4.1", "b4-1", "Muon 的核心想法是什么？解决什么问题？", ["训练与优化", "LLM 训练"], null],
    ["B4.2", "b4-2", "RLP 的核心想法是什么？和普通的 post-training 有什么区别？", ["训练与优化", "LLM 训练"], null],
    ["C1.1", "c1-1", "后训练 pipeline 有哪些阶段，各做什么？", ["LLM 训练"], "rlhf-dpo-grpo"],
    ["C1.2", "c1-2", "偏好优化（InstructGPT、DPO）和 RLVR（DeepSeek-R1）在\"需要什么\"和\"优化什么\"上有什么不同？", ["LLM 训练"], "rlhf-dpo-grpo"],
    ["C2.1", "c2-1", "Preference RM、verifier、rubric、teacher：哪个 dense、哪个 sparse？各自怎么被 policy 钻空子？", ["LLM 训练"], null],
    ["C3.1", "c3-1", "哪些方法 on-policy、哪些 off-policy？off-policy 数据带来什么问题？", ["LLM 训练"], null],
    ["C4.1", "c4-1", "KL 在 RLHF、DPO、蒸馏里分别控制什么？", ["LLM 训练"], null],
    ["C4.2", "c4-2", "forward 和 reverse KL 有什么区别？", ["LLM 训练"], null],
    ["C5.1", "c5-1", "为什么用 on-policy 蒸馏？和 SFT、RL 相比各有什么优劣？", ["LLM 训练"], null],
    ["C6.1", "c6-1", "LLM RL 的计算花在哪？为什么要让它更快？", ["LLM 训练"], null],
    ["C6.2", "c6-2", "Async RL 怎么做？代价是什么？Async RLHF 的主要发现？", ["LLM 训练"], null],
    ["C6.3", "c6-3", "Olmo 3 用了哪些效率技巧？", ["LLM 训练"], null],
    ["C6.4", "c6-4", "全对或全错的组（zero-std）为什么浪费？怎么处理？", ["LLM 训练"], null],
    ["C6.5", "c6-5", "RL 里的 Matthew effect 是什么？NGU 怎么解决？", ["LLM 训练"], null],
    ["C6.6", "c6-6", "RLVE 怎么从数据角度提升效率？", ["LLM 训练"], null],
    ["D1.1", "d1-1", "为什么要在基础模型里用双曲几何？", ["Deep Learning"], null],
    ["P1", "p-1", "Attention Is All You Need：问题、主要想法、主要结果、局限？", ["Transformer"], "transformer-architecture"],
    ["G1.1", "g1-1", "Kimi K3 的 Attention Residuals 是什么？解决什么问题？", ["Transformer"], null]
  ];
  /* CPSC:END */

  /* KP:BEGIN 公司和分类标签，由脚本生成，不要手改 */
  var CATS = ["Classic ML", "Deep Learning", "训练与优化", "Transformer", "LLM inference", "LLM 训练", "RAG 与 Search", "Agent", "Evaluation", "分布式训练", "训练系统", "GPU 与性能", "C++"];
  var TARGETS = ["Microsoft", "NVIDIA", "Apple", "Unity"];
  var KP = {
    "overfit-bias-variance": {"k": ["Classic ML", "训练与优化"], "co": {"Microsoft": "asked", "NVIDIA": "asked", "Apple": "prep", "Unity": "asked"}},
    "regularization-l1-l2": {"k": ["Classic ML", "训练与优化"], "co": {"Microsoft": "asked", "NVIDIA": "asked", "Apple": "prep"}},
    "bagging-boosting": {"k": ["Classic ML"], "co": {"Microsoft": "asked", "Unity": "asked"}},
    "regression": {"k": ["Classic ML"], "co": {"Microsoft": "asked"}},
    "kmeans": {"k": ["Classic ML"], "co": {"Microsoft": "asked", "Apple": "prep"}},
    "pca": {"k": ["Classic ML"], "co": {"Microsoft": "asked"}},
    "euclidean-cosine": {"k": ["Classic ML"], "co": {"Microsoft": "asked", "Apple": "prep"}},
    "vanishing-gradient": {"k": ["Deep Learning", "训练与优化"], "co": {"Microsoft": "asked"}},
    "activation": {"k": ["Deep Learning"], "co": {"Microsoft": "asked"}},
    "batchnorm-layernorm": {"k": ["Deep Learning", "训练与优化"], "co": {"Microsoft": "asked", "Apple": "prep"}},
    "dropout": {"k": ["Deep Learning", "训练与优化"], "co": {"Microsoft": "asked", "NVIDIA": "asked", "Apple": "prep"}},
    "cnn": {"k": ["Deep Learning"], "co": {"Microsoft": "asked", "Unity": "asked"}},
    "optimizer": {"k": ["Deep Learning", "训练与优化"], "co": {"NVIDIA": "asked"}},
    "knowledge-distillation": {"k": ["Deep Learning", "LLM inference"], "co": {"Microsoft": "asked", "Apple": "prep"}},
    "gpu-numpy": {"k": ["GPU 与性能"], "co": {"Microsoft": "asked", "NVIDIA": "asked", "Unity": "prep"}},
    "attention-scaling": {"k": ["Transformer"], "co": {"Microsoft": "asked"}},
    "transformer-architecture": {"k": ["Transformer"], "co": {"Microsoft": "asked", "NVIDIA": "asked", "Apple": "prep"}},
    "multi-head-attention": {"k": ["Transformer"], "co": {"Microsoft": "asked", "NVIDIA": "asked", "Apple": "asked"}, "more": ["字节", "Meta"]},
    "transformer-complexity": {"k": ["Transformer", "LLM inference"], "co": {"NVIDIA": "asked"}},
    "mqa-gqa-mla": {"k": ["Transformer", "LLM inference"], "co": {"NVIDIA": "asked"}, "more": ["阿里", "百度"]},
    "positional-encoding": {"k": ["Transformer"], "co": {"Microsoft": "asked", "NVIDIA": "asked"}, "more": ["字节"]},
    "rope": {"k": ["Transformer"], "co": {}},
    "rnn-vs-transformer": {"k": ["Transformer"], "co": {"Microsoft": "asked"}},
    "bert-vs-gpt": {"k": ["Transformer"], "co": {"Microsoft": "asked", "NVIDIA": "asked"}},
    "decoding": {"k": ["LLM inference"], "co": {"Microsoft": "asked", "Apple": "prep"}},
    "kv-cache": {"k": ["LLM inference"], "co": {"NVIDIA": "asked", "Apple": "prep"}},
    "hallucination": {"k": ["RAG 与 Search", "Evaluation"], "co": {"Microsoft": "asked"}},
    "rag": {"k": ["RAG 与 Search"], "co": {"Microsoft": "asked", "Apple": "prep"}},
    "finetune-lora": {"k": ["LLM 训练"], "co": {"Microsoft": "asked", "NVIDIA": "asked", "Apple": "prep"}},
    "rlhf-dpo-grpo": {"k": ["LLM 训练"], "co": {"Microsoft": "asked", "Apple": "prep"}},
    "llm-evaluation": {"k": ["Evaluation"], "co": {"Microsoft": "asked", "Apple": "prep"}},
    "agent-mcp": {"k": ["Agent"], "co": {"Microsoft": "asked", "Apple": "prep"}},
    "inference-cost": {"k": ["LLM inference"], "co": {"Microsoft": "asked"}},
    "tp-linear": {"k": ["分布式训练"], "co": {"NVIDIA": "asked"}, "more": ["腾讯", "华为", "OpenAI"]},
    "tp-communication": {"k": ["分布式训练"], "co": {"NVIDIA": "prep"}, "more": ["阿里", "腾讯", "华为", "快手"]},
    "sequence-parallel": {"k": ["分布式训练"], "co": {"NVIDIA": "prep"}, "more": ["快手"]},
    "vocab-parallel": {"k": ["分布式训练"], "co": {"Microsoft": "asked", "NVIDIA": "prep"}, "more": ["快手"]},
    "pipeline-parallel": {"k": ["分布式训练"], "co": {"NVIDIA": "asked"}, "more": ["腾讯", "美团", "快手"]},
    "dp-zero-fsdp": {"k": ["分布式训练"], "co": {"NVIDIA": "asked"}, "more": ["百度", "xAI"]},
    "context-parallel": {"k": ["分布式训练"], "co": {"NVIDIA": "prep"}, "more": ["腾讯", "Kimi"]},
    "moe-expert-parallel": {"k": ["分布式训练"], "co": {"NVIDIA": "asked"}, "more": ["阿里", "美团"]},
    "parallelism-config": {"k": ["分布式训练"], "co": {"NVIDIA": "asked"}, "more": ["Meta"]},
    "training-memory": {"k": ["训练系统"], "co": {"NVIDIA": "asked"}, "more": ["字节", "Anthropic"]},
    "flops-mfu": {"k": ["训练系统"], "co": {"NVIDIA": "asked"}, "more": ["Anthropic"]},
    "allreduce": {"k": ["分布式训练"], "co": {"NVIDIA": "prep"}, "more": ["阿里", "Anthropic"]},
    "rdma-gpudirect": {"k": ["分布式训练", "训练系统"], "co": {"NVIDIA": "asked"}},
    "activation-recompute": {"k": ["训练系统"], "co": {"NVIDIA": "prep"}, "more": ["字节"]},
    "mixed-precision": {"k": ["训练系统", "GPU 与性能"], "co": {"NVIDIA": "prep", "Unity": "prep"}, "more": ["讯飞"]},
    "quantization-int8": {"k": ["LLM inference", "GPU 与性能"], "co": {"NVIDIA": "asked", "Apple": "prep", "Unity": "prep"}},
    "overlap": {"k": ["分布式训练"], "co": {"NVIDIA": "prep"}, "more": ["快手"]},
    "debug-slow-hang": {"k": ["训练系统"], "co": {"NVIDIA": "asked", "Unity": "prep"}, "more": ["快手"]},
    "autograd": {"k": ["训练系统"], "co": {"NVIDIA": "asked"}, "more": ["OpenAI"]},
    "gradient-accumulation": {"k": ["训练系统", "训练与优化"], "co": {"NVIDIA": "asked"}},
    "stride-view": {"k": ["训练系统"], "co": {"NVIDIA": "asked"}},
    "amdahl": {"k": ["GPU 与性能"], "co": {"NVIDIA": "asked", "Unity": "prep"}},
    "gpu-memory-hierarchy": {"k": ["GPU 与性能"], "co": {"NVIDIA": "asked", "Unity": "prep"}},
    "matmul-roofline": {"k": ["GPU 与性能"], "co": {"NVIDIA": "asked", "Unity": "prep"}},
    "flashattention": {"k": ["GPU 与性能", "Transformer"], "co": {"NVIDIA": "prep", "Unity": "prep"}, "more": ["字节", "Kimi"]},
    "coalescing-bank-conflict": {"k": ["GPU 与性能"], "co": {"NVIDIA": "asked", "Unity": "prep"}},
    "cpp-virtual-inline": {"k": ["C++"], "co": {"NVIDIA": "asked"}},
    "cpp-smart-pointer": {"k": ["C++"], "co": {"NVIDIA": "asked"}},
    "megatron-recent": {"k": ["分布式训练", "训练系统"], "co": {"NVIDIA": "prep"}},
    "megatron-fsdp-v2": {"k": ["分布式训练"], "co": {"NVIDIA": "prep"}},
    "gtp": {"k": ["分布式训练"], "co": {"NVIDIA": "prep"}},
    "moe-ep-communication": {"k": ["分布式训练"], "co": {"NVIDIA": "prep"}},
    "bitwise-determinism": {"k": ["训练系统", "分布式训练"], "co": {"NVIDIA": "prep"}},
    "low-precision-cuda-graph": {"k": ["训练系统", "GPU 与性能"], "co": {"NVIDIA": "prep"}},
    "nemotron-3-ultra": {"k": ["训练系统", "分布式训练", "LLM 训练"], "co": {"NVIDIA": "prep"}},
    "flashvector": {"k": ["Agent", "GPU 与性能"], "co": {"Unity": "prep"}},
    "kernel-agent-design": {"k": ["Agent", "GPU 与性能"], "co": {"Unity": "prep"}, "more": ["字节", "阿里"]},
    "noise-floor": {"k": ["Evaluation", "GPU 与性能"], "co": {"Unity": "prep"}},
    "kernel-correctness": {"k": ["Evaluation", "GPU 与性能"], "co": {"Unity": "prep"}},
    "kernel-benchmark": {"k": ["GPU 与性能", "Evaluation"], "co": {"Unity": "prep"}, "more": ["字节"]},
    "agent-sandbox": {"k": ["Agent"], "co": {"NVIDIA": "asked", "Unity": "prep"}, "more": ["字节", "讯飞"]},
    "local-vs-e2e": {"k": ["GPU 与性能", "Evaluation"], "co": {"Unity": "prep"}},
    "reward-hacking": {"k": ["Evaluation", "LLM 训练"], "co": {"Unity": "prep"}},
    "offline-pipeline-optimization": {"k": ["训练系统", "Agent"], "co": {"Unity": "prep"}},
    "agent-eval-regression": {"k": ["Evaluation", "Agent"], "co": {"Unity": "prep"}, "more": ["字节", "阿里"]},
    "context-compaction": {"k": ["Agent", "LLM inference"], "co": {"Unity": "prep"}, "more": ["字节", "阿里", "讯飞"]},
    "agent-batch-runs": {"k": ["Agent", "Evaluation"], "co": {"Unity": "prep"}, "more": ["字节", "阿里", "小红书"]},
    "tool-failure-retry": {"k": ["Agent"], "co": {"Unity": "prep"}, "more": ["字节"]},
    "agent-observability": {"k": ["Agent", "Evaluation"], "co": {"Unity": "prep"}, "more": ["字节", "阿里"]},
    "agent-permissions": {"k": ["Agent"], "co": {"Unity": "prep"}, "more": ["阿里", "Walmart"]},
    "agent-knowledge-base": {"k": ["Agent"], "co": {"Unity": "prep"}, "more": ["阿里"]},
    "agent-to-production": {"k": ["Agent"], "co": {"Unity": "prep"}, "more": ["阿里", "快手"]},
    "mini-coding-agent": {"k": ["Agent"], "co": {"Unity": "prep"}, "more": ["阿里", "Anthropic"]},
    "sub-agents": {"k": ["Agent"], "co": {"Unity": "prep"}, "more": ["阿里"]},
    "ai-coding-tools": {"k": ["Agent"], "co": {"Unity": "prep"}, "more": ["阿里", "讯飞"]},
    "kernel-search-methods": {"k": ["Agent", "LLM 训练"], "co": {"Unity": "prep"}, "more": ["Meta"]},
    "kernel-rl-reward": {"k": ["LLM 训练", "Agent"], "co": {"Unity": "prep"}},
    "nsight-profiling": {"k": ["GPU 与性能"], "co": {"Unity": "prep"}, "more": ["华为", "快手", "讯飞"]},
    "kernel-fusion": {"k": ["GPU 与性能"], "co": {"Unity": "prep"}, "more": ["字节", "阿里", "华为", "百度"]},
    "gpu-reduction": {"k": ["GPU 与性能"], "co": {"Unity": "prep"}, "more": ["百度"]},
    "triton-vs-cuda": {"k": ["GPU 与性能"], "co": {"Unity": "prep"}, "more": ["快手"]},
    "torch-compile": {"k": ["GPU 与性能", "训练系统"], "co": {"Unity": "prep"}, "more": ["百度"]},
    "cuda-graph": {"k": ["GPU 与性能", "LLM inference"], "co": {"NVIDIA": "prep", "Unity": "prep"}, "more": ["华为"]},
    "occupancy": {"k": ["GPU 与性能"], "co": {"NVIDIA": "asked", "Unity": "prep"}},
    "kernelbench": {"k": ["Evaluation", "Agent"], "co": {"Unity": "prep"}, "more": ["Meta"]},
    "ads-kernel-optimization": {"k": ["GPU 与性能", "Agent"], "co": {"Unity": "prep"}, "more": ["Meta"]},
    "grounded-response": {"k": ["Evaluation", "RAG 与 Search"], "co": {"Apple": "asked"}},
    "synthetic-data-quality": {"k": ["Evaluation", "LLM 训练"], "co": {"Apple": "asked"}},
    "agentic-search-eval": {"k": ["Evaluation", "Agent"], "co": {"Apple": "prep"}, "more": ["字节"]},
    "train-search-agent": {"k": ["LLM 训练", "Agent"], "co": {"Apple": "asked"}},
    "search-loop": {"k": ["RAG 与 Search", "Agent"], "co": {"Apple": "prep"}, "more": ["Walmart"]},
    "hard-constraints": {"k": ["RAG 与 Search"], "co": {"Apple": "asked"}, "more": ["Walmart"]},
    "llm-harness": {"k": ["Agent", "Evaluation"], "co": {"Apple": "prep", "Unity": "prep"}},
    "tool-arguments": {"k": ["Agent"], "co": {"Apple": "asked"}},
    "annotation-judge": {"k": ["Evaluation"], "co": {"Apple": "asked"}},
    "agentic-vs-search": {"k": ["Evaluation", "RAG 与 Search"], "co": {"Apple": "prep"}, "more": ["Walmart"]},
    "over-searching": {"k": ["RAG 与 Search", "Evaluation"], "co": {"Apple": "asked"}},
    "long-document": {"k": ["RAG 与 Search", "Agent"], "co": {"Apple": "asked"}},
    "A12": {"k": ["Classic ML", "训练与优化"], "co": {"Apple": "prep"}},
    "A13": {"k": ["训练与优化", "LLM 训练"], "co": {"Apple": "prep"}},
    "A15": {"k": ["LLM inference", "分布式训练"], "co": {"Apple": "prep"}}
  };
  /* KP:END */

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function link(p, text) { return el("a", { href: p.href }, text); }

  // ---------- 知识点清单：PAGES 里的每一页，加上 mock 清单里还没有速查页的题 ----------
  var flat = [], byFile = {};
  PAGES.forEach(function (g) {
    g.items.forEach(function (it) {
      var t = KP[it[1]] || {}, co = {};
      for (var c in (t.co || {})) co[c] = t.co[c];
      var p = { num: it[0], file: it[1], href: it[1] + ".html", title: it[2], star: !!it[3], sec: g.sec,
                k: t.k || ["未分类"], co: co, more: t.more || [], mock: [], order: 1e6, src: [], refs: [] };
      flat.push(p);
      byFile[p.file] = p;
    });
  });
  var pages = flat.slice();   // 有速查页的知识点，上一题和下一题按这个顺序
  var mockIndex = 0;
  MOCK.groups.forEach(function (g) {
    g.items.forEach(function (it) {
      mockIndex++;
      var m = /^([a-z0-9-]+)\.html$/.exec(it[1]);
      var p = m && byFile[m[1]];
      if (!p) {
        var t = KP[it[0]] || {};
        p = { num: it[0], file: null, href: it[1], title: it[2] + "（还没有速查页）", star: false, sec: MOCK.sec,
              k: t.k || ["未分类"], co: {}, more: [], mock: [], order: 1e6, src: [], refs: [] };
        flat.push(p);
      }
      p.mock.push(it[0]);
      if (!p.co.Apple) p.co.Apple = "prep";
      p.order = Math.min(p.order, mockIndex);
    });
  });

  // ---------- 专题：速成课的每一课、CPSC 4880 的每一题，和知识点列在同一张表里 ----------
  // 和某个速查页讲同一个知识点的题不另列一行，只给那一页加一个指向题目的标签
  var SRC = ["速成课", "CPSC 4880"];
  (window.COURSE_LESSONS || []).forEach(function (l, i) {   // course.js 的 LESSONS：[文件, 标题, 简介, 分类]
    flat.push({ num: "L" + i, file: null, href: l[0] + ".html", title: l[1], star: false, sec: "Training Infra 速成课",
                k: l[3] || ["未分类"], co: { NVIDIA: "prep" }, more: [], mock: [], order: 1e6, src: ["速成课"], refs: [] });
  });
  CPSC.forEach(function (q) {   // [题号, 锚点, 标题, 分类, 对应的速查页或 null]
    var p = q[4] && byFile[q[4]];
    if (p) {
      p.refs.push({ label: "CPSC " + q[0], href: "index.html#" + q[1] });
      if (p.src.indexOf("CPSC 4880") < 0) p.src.push("CPSC 4880");
      return;
    }
    flat.push({ num: q[0], file: null, href: "index.html#" + q[1], title: q[2], star: false, sec: "CPSC 4880",
                k: q[3], co: {}, more: [], mock: [], order: 1e6, src: ["CPSC 4880"], refs: [] });
  });

  function progressOf(p) {
    var prog = window.MOCK_PROGRESS || {}, out = [];
    p.mock.concat(p.file ? [p.file] : []).forEach(function (key) {
      var e = prog[key];
      if (e && ST[e[0]] && e[0] !== "未做") out.push({ key: key, st: e[0], date: e[1] || "", note: e[2] || "" });
    });
    return out;
  }
  function statusOf(p) {
    var st = "未做";
    progressOf(p).forEach(function (e) {
      if (st === "未做" || WEAK.indexOf(e.st) < WEAK.indexOf(st)) st = e.st;
    });
    return st;
  }
  function withProgress(cb) {
    if (window.MOCK_PROGRESS) { cb(); return; }
    var s = el("script", { src: "assets/progress.js" });
    s.onload = cb;
    s.onerror = cb;
    document.head.appendChild(s);
  }

  var here = decodeURIComponent(location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "");

  // ---------- 目录页 ----------
  function readHash() {
    var f = { co: "", st: "", k: "", sort: "k", q: "" };
    (location.hash || "").replace(/^#/, "").split("&").forEach(function (kv) {
      var i = kv.indexOf("=");
      if (i > 0) {
        var key = kv.slice(0, i);
        if (key in f) { try { f[key] = decodeURIComponent(kv.slice(i + 1)); } catch (e) { /* 坏的 hash 就忽略 */ } }
      }
    });
    return f;
  }
  function writeHash(f) {
    var parts = [];
    ["co", "st", "k", "q"].forEach(function (key) { if (f[key]) parts.push(key + "=" + encodeURIComponent(f[key])); });
    if (f.sort !== "k") parts.push("sort=" + f.sort);
    try { history.replaceState(null, "", parts.length ? "#" + parts.join("&") : location.pathname + location.search); } catch (e) { /* file:// 下个别浏览器不允许，筛选照常工作 */ }
  }
  function match(p, f) {
    if (f.co === "★") { if (!p.star) return false; }
    else if (f.co === "其他公司") { if (!p.more.length) return false; }
    else if (SRC.indexOf(f.co) >= 0) { if (p.src.indexOf(f.co) < 0) return false; }
    else if (f.co && !p.co[f.co]) return false;
    if (f.st && statusOf(p) !== f.st) return false;
    if (f.k && p.k.indexOf(f.k) < 0) return false;
    if (f.q) {
      var hay = [p.num, p.title, p.k.join(" "), Object.keys(p.co).join(" "), p.more.join(" "), p.mock.join(" "), p.src.join(" ")].join(" ").toLowerCase();
      if (hay.indexOf(f.q.toLowerCase()) < 0) return false;
    }
    return true;
  }
  function row(p) {
    var li = el("li");
    li.appendChild(el("span", { class: "num" }, p.num));
    li.appendChild(el("a", { class: "t", href: p.href }, p.title));
    if (p.star) li.appendChild(el("span", { class: "star", title: "作者本人面试被问过" }, "★"));
    if (p.mock.length) li.appendChild(el("span", { class: "tg", title: "Apple 第一轮 mock 的题号" }, p.mock.join(" / ")));
    TARGETS.forEach(function (c) {
      if (!p.co[c]) return;
      var asked = p.co[c] === "asked";
      li.appendChild(el("span", { class: "tg " + (asked ? "tg-asked" : "tg-prep"), title: asked ? "面经里这家考过" : "在这家的备考清单里" }, c));
    });
    if (p.more.length) li.appendChild(el("span", { class: "tg", title: "面经里还有这些公司考过：" + p.more.join("、") }, "+" + p.more.length));
    if (p.refs.length) p.refs.forEach(function (r) { li.appendChild(el("a", { class: "tg tg-src", href: r.href, title: "课程复习里的同一题" }, r.label)); });
    else p.src.forEach(function (x) { li.appendChild(el("span", { class: "tg tg-src", title: "来自这个专题" }, x)); });
    p.k.forEach(function (k) { li.appendChild(el("span", { class: "tg tg-k", title: "知识分类" }, k)); });
    var st = statusOf(p);
    li.appendChild(el("span", { class: "st " + ST[st] }, st));
    progressOf(p).forEach(function (e) {
      li.appendChild(el("span", { class: "toc-sub" }, [e.key, e.st, e.date, e.note].filter(Boolean).join(" · ")));
    });
    return li;
  }

  function buildIndex() {
    var box = document.getElementById("toc");
    if (!box) return;
    var f = readHash();
    var count = function (test) { return flat.filter(test).length; };
    var groups = [
      { key: "co", label: "来源", opts: TARGETS.map(function (c) { return [c, c, count(function (p) { return p.co[c]; })]; })
          .concat(SRC.map(function (x) { return [x, x, count(function (p) { return p.src.indexOf(x) >= 0; })]; }))
          .concat([["其他公司", "其他公司", count(function (p) { return p.more.length; })], ["★", "★ 被问过", count(function (p) { return p.star; })]]) },
      { hidden: true, key: "st", label: "掌握", opts: ["未做", "过了一遍", "没过", "对"].map(function (s) { return [s, s, count(function (p) { return statusOf(p) === s; })]; }) },
      { key: "k", label: "分类", opts: CATS.map(function (k) { return [k, k, count(function (p) { return p.k.indexOf(k) >= 0; })]; }) }
    ];
    var bar = el("div", { class: "filters" }), chips = [];
    groups.forEach(function (g) {
      if (g.hidden) return;
      var r = el("div", { class: "row" });
      r.appendChild(el("span", { class: "lab" }, g.label));
      [["", "全部", null]].concat(g.opts).forEach(function (o) {
        var b = el("button", { type: "button", class: "chip" }, o[1]);
        if (o[2] != null) b.appendChild(el("span", { class: "n" }, String(o[2])));
        b.addEventListener("click", function () { f[g.key] = f[g.key] === o[0] ? "" : o[0]; update(); });
        chips.push({ b: b, key: g.key, v: o[0] });
        r.appendChild(b);
      });
      bar.appendChild(r);
    });
    var last = el("div", { class: "row" });
    var search = el("input", { type: "search", class: "toc-search", placeholder: "搜索标题、分类、公司或题号，例如 attention、Agent、AS5", "aria-label": "搜索知识点" });
    search.value = f.q;
    search.addEventListener("input", function () { f.q = search.value.trim(); update(); });
    var sort = el("select", { "aria-label": "排序" });
    [["k", "按分类排"], ["num", "按编号排"], ["mock", "按 Apple mock 顺序排"]].forEach(function (o) {
      var op = el("option", { value: o[0] }, o[1]);
      if (f.sort === o[0]) op.setAttribute("selected", "selected");
      sort.appendChild(op);
    });
    sort.addEventListener("change", function () { f.sort = sort.value; update(); });
    last.appendChild(search);
    last.appendChild(sort);
    bar.appendChild(last);
    var sum = el("p", { class: "mock-sum" });
    var legend = el("p", { class: "links" }, "公司标签：实底 = 面经里这家考过，虚线 = 在这家的备考清单里。");
    var listBox = el("div");
    box.appendChild(bar);
    box.appendChild(sum);
    box.appendChild(legend);
    box.appendChild(listBox);

    function update() {
      chips.forEach(function (c) { c.b.setAttribute("aria-pressed", f[c.key] === c.v ? "true" : "false"); });
      writeHash(f);
      var shown = flat.filter(function (p) { return match(p, f); });
      var n = { "对": 0, "过了一遍": 0, "没过": 0, "未做": 0 };
      shown.forEach(function (p) { n[statusOf(p)]++; });
      sum.textContent = "";
      sum.appendChild(el("span", { class: "toc-count" }, "显示 " + shown.length + " / " + flat.length + " 个知识点　"));
      ["对", "过了一遍", "没过", "未做"].forEach(function (s) { sum.appendChild(el("span", { class: "st " + ST[s] }, s + " " + n[s])); });
      listBox.textContent = "";
      listBox.setAttribute("data-sort", f.sort);
      var sections = [];
      if (f.sort === "k") {
        CATS.concat(["未分类"]).forEach(function (k) {
          var items = shown.filter(function (p) { return p.k[0] === k; });
          if (items.length) sections.push([k, items]);
        });
      } else if (f.sort === "mock") {
        var withMock = shown.filter(function (p) { return p.mock.length; }).sort(function (a, b) { return a.order - b.order; });
        var rest = shown.filter(function (p) { return !p.mock.length; });
        if (withMock.length) sections.push(["Apple 第一轮 mock（按题号）", withMock]);
        if (rest.length) sections.push(["不在 mock 清单里的", rest]);
      } else {
        sections.push([null, shown]);
      }
      sections.forEach(function (s) {
        if (s[0]) {
          var h = el("h2", { class: "sec" }, s[0]);
          h.appendChild(el("span", { class: "n" }, String(s[1].length)));
          listBox.appendChild(h);
        }
        var ol = el("ol", { class: "toc kp-list" });
        s[1].forEach(function (p) { ol.appendChild(row(p)); });
        listBox.appendChild(ol);
      });
      if (!shown.length) listBox.appendChild(el("p", { class: "links" }, "没有符合条件的知识点，放宽一个筛选条件试试。"));
    }
    update();
  }

  // ---------- 知识点页面 ----------
  function buildPageNav(i) {
    var main = document.querySelector("main");
    if (!main) return;
    var p = pages[i], prev = pages[i - 1], next = pages[i + 1];

    var bar = el("nav", { class: "sitebar", "aria-label": "导航" });
    bar.appendChild(el("a", { href: "index.html", class: "home" }, "← 目录"));
    bar.appendChild(el("span", { class: "where" }, p.num + " · " + p.sec));
    var side = el("span", { class: "step" });
    if (prev) side.appendChild(link(prev, "上一题"));
    if (next) side.appendChild(link(next, "下一题"));
    bar.appendChild(side);
    main.insertBefore(bar, main.firstChild);

    // 本页的三类标签：点分类或公司会回到目录并按它筛选
    var tags = el("p", { class: "kp-tags" });
    p.k.forEach(function (k) { tags.appendChild(el("a", { class: "tg tg-k", href: "index.html#k=" + encodeURIComponent(k), title: "知识分类" }, k)); });
    TARGETS.forEach(function (c) {
      if (!p.co[c]) return;
      var asked = p.co[c] === "asked";
      tags.appendChild(el("a", { class: "tg " + (asked ? "tg-asked" : "tg-prep"), href: "index.html#co=" + encodeURIComponent(c), title: asked ? "面经里这家考过" : "在这家的备考清单里" }, c));
    });
    if (p.mock.length) tags.appendChild(el("span", { class: "tg", title: "Apple 第一轮 mock 的题号" }, p.mock.join(" / ")));
    p.refs.forEach(function (r) { tags.appendChild(el("a", { class: "tg tg-src", href: r.href, title: "课程复习里的同一题" }, r.label)); });
    main.insertBefore(tags, bar.nextSibling);
    withProgress(function () {
      var st = statusOf(p);
      tags.appendChild(el("span", { class: "st " + ST[st], title: "掌握情况，记在 assets/progress.js" }, st));
    });

    var rel = pages.filter(function (q) { return q !== p && q.k[0] === p.k[0]; });
    if (rel.length) {
      var r = el("nav", { class: "related", "aria-label": "同类知识点" });
      r.appendChild(el("b", {}, "同类知识点（" + p.k[0] + "）"));
      rel.forEach(function (q) { r.appendChild(link(q, q.num + " " + q.title)); });
      main.appendChild(r);
    }

    var pager = el("nav", { class: "pager", "aria-label": "上一题和下一题" });
    pager.appendChild(prev ? link(prev, "← " + prev.num + " " + prev.title) : el("span"));
    pager.appendChild(next ? link(next, next.num + " " + next.title + " →") : el("a", { href: "index.html" }, "回到目录 →"));
    main.appendChild(pager);

    document.addEventListener("keydown", function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      var t = e.target && e.target.tagName;
      if (t === "INPUT" || t === "TEXTAREA") return;
      if (e.key === "ArrowLeft" && prev) location.href = prev.href;
      if (e.key === "ArrowRight" && next) location.href = next.href;
    });
  }

  function start() {
    if (here === "index" || here === "") { buildIndex(); return; }
    for (var i = 0; i < pages.length; i++) {
      if (pages[i].file === here) { buildPageNav(i); return; }
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
