---
layout: single
title: "CPSC 4880 Frontier LLMs 期中复习"
permalink: /blogs/cpsc4880-midterm/
author_profile: true
---

{% include toc title="目录" icon="list" %}

Yale CPSC 4880（Frontier LLMs，2026 秋）期中考试的问答式复习：按架构、预训练、后训练、guest lecture 和论文整理，每题配 20–80 词的英文答案。

考试：**Mon 11/02/26，课上，75 分钟，闭卷**。范围：截至 10/26 的所有 lecture + main readings；guest lecture 只考 high-level。

题型：概念题，解释机制 / 评价设计选择 / 比较方法。每篇主要论文要能说出：**问题 → 方法 → 主要结果 → 局限**。

来源标记（越靠前越可能考）：**[Quiz]** 原题 · **[Review]** paper review 题 · **[讨论]** 课堂讨论题 · **[Guide]** study guide 原文 · **[Lec]** lecture 内容 · **[推断]** 按 guide 题型整理，没有原题。

排序原则：Quiz 卷上写明 "high level answers are fine"、"no need for math"，所以大方向的概念题排在前面（主要想法、好处、取舍、方法对比）；过细的题已按 guide 评估后删除。

答案只写概念：说清机制、取舍和结论方向，不背精确数字、公式和实验设定；只保留本身就是论文主要结果的数字。

⭐ = 大方向的概念题，建议先看。

---

## Part 1 架构

### A1 Attention 的代价
*Review: Attention Is All You Need, FlashAttention*

- **1.** Self-attention 的时间复杂度是多少？推导一下。[Quiz]
  > - **Projections:** Q, K, V and the output projection each cost nd², so 4nd² in total.
  > - **Attention:** computing scores QKᵀ costs n²d, and multiplying by V costs another n²d.
  > - **Total:** O(n²d + nd²). Multi-head doesn't change it. At long context the n² term dominates.
  > - **With a KV cache:** each decode step costs O(nd + d²).
- **2.** 为什么 prefill 是 compute-bound、decode 是 memory-bandwidth-bound？这对优化方向意味着什么？[Guide]
  > - **Prefill is compute-bound:** each forward pass processes many tokens, so weights read once are reused many times, and cost follows compute.
  > - **Decode is memory-bound:** each pass produces one token, so at small batches most cost is reading weights and the KV cache.
  > - **Optimizing decode:** read fewer bytes per step (GQA/MLA, fixed-size state, sparse reads, quantization).
  > - **Optimizing prefill:** cut compute or, like FlashAttention, slow-memory traffic.
- **3.** KV cache 是什么？为什么能缓存？它省了什么、没省什么？[Lec]
  > - **What:** store each layer's K and V for past tokens, so a decode step only computes q, k, v for the new token.
  > - **Why it works:** the causal mask means new tokens never change earlier K/V.
  > - **Saves:** recomputing the prefix.
  > - **Doesn't save:** the new query still attends to all n keys, and memory grows linearly with length.
- **4.** 用一句话解释 FlashAttention。
  > - FlashAttention computes the same attention block by block in fast on-chip memory (SRAM), so the huge n×n score matrix never goes to slow GPU memory (HBM), making it faster with much less memory.
- **5.** FlashAttention 减少 FLOPs 了吗？为什么更快？解决不了什么？[Guide]
  > - **FLOPs:** not reduced. They stay O(n²d), even slightly higher.
  > - **Why faster:** memory traffic, not FLOPs, dominates runtime. Working block by block in SRAM avoids writing the n×n matrix to slow HBM.
  > - **Doesn't fix:** O(n²) compute or the decode KV cache.
- **6.** 为什么 attention logits 要除以 √d_k？[Lec]
  > - Dot products grow with head dimension (variance d_k if components are independent with unit variance).
  > - The authors suspect large values push softmax into regions with extremely small gradients.
  > - Dividing by √d_k keeps logits at unit variance.

### A2 缩小 KV cache
*Review: GQA, DeepSeek-V2 (MLA)*

- **1.** MQA / GQA 和 MHA 有什么区别？为什么要用？[Quiz]
  > - **MHA:** each query head has its own K/V head.
  > - **MQA:** all query heads share one K/V head.
  > - **GQA:** query heads are split into groups, and each group shares one K/V head. Each query head still computes its own attention.
  > - **Why:** decode is memory-bound, so fewer K/V heads mean a smaller KV cache and faster decode.
  > - **Tradeoff:** quality can drop, especially with too few K/V heads.
- **2.** MLA 怎么压缩 KV cache？和 GQA 的本质区别？[Lec]
  > - **How MLA works:** compress each token's K and V together into one small latent vector and cache only that. Learned up-projections rebuild per-head K and V.
  > - **Difference from GQA:** GQA shrinks the cache by sharing K/V heads; MLA keeps per-head K/V but stores them compressed.
  > - **Result:** a cache as small as aggressive GQA, yet better performance than MHA in its ablations.

### A3 用固定大小状态替代 KV cache
*Review: Mamba, Mamba-2, MiniMax-01, Kimi K3*

- **1.** SSM（如 Mamba）处理长文本相对 Transformer 的主要优势是什么？代价是什么？[Quiz]
  > - **Advantage:** history is compressed into a fixed-size state updated once per token, so each generated token costs constant time and memory, with no growing KV cache. Training stays linear and parallelizable.
  > - **Cost:** a finite state has limited capacity, so arbitrary lookup over long context gets worse. It recalls exactly only what fits.
  > - **Caveat:** constant is not small. At short context the state can exceed a KV cache.
- **2.** 序列变长时，KV cache 和 SSM state 的显存分别怎么增长？[Review]
  > - **KV cache:** grows linearly with length, because every token adds K and V at every attention layer. Memory and per-step reads are O(n).
  > - **SSM state:** fixed size set by model dimensions, so memory is O(1) in length.
  > - **Hybrids:** their few attention layers still keep KV caches, so memory grows, just more slowly.
- **3.** Mamba 的 selection 是什么？为什么需要？[Lec]
  > - **What:** SSM parameters depend on the current input: what to write into the state, what to read out, and how much old state to keep.
  > - **Why:** earlier SSMs updated the same way for every token, so filler wore away important information.
  > - **Effect:** Mamba can ignore irrelevant tokens and keep relevant ones regardless of distance.
- **4.** Mamba-2 的核心想法（SSD）是什么？相比 Mamba-1 牺牲了什么、换来了什么？[Review]
  > - **SSD:** with one scalar decay per head, an SSM computes the same function as masked linear attention (no softmax).
  > - **How training uses it:** attention-style matmuls inside chunks, which GPUs run fast, plus a state passed between chunks, so cost stays linear.
  > - **Gives up:** the expressiveness of Mamba-1's per-dimension decay.
  > - **Gains:** much faster training kernels and cheap larger states.
- **5.** Lightning Attention（MiniMax-01）的主要想法和取舍？[Review]
  > - **Problem:** causal linear attention (no softmax) is a token-by-token recurrence that can't use GPU matrix-multiply units, so it is slow in practice.
  > - **Main idea:** work in blocks: ordinary matrix multiplication with a causal mask inside a block, and a fixed-size recurrent KV state across blocks.
  > - **Tradeoff:** pure lightning falls short on retrieval, so MiniMax-01 keeps some softmax layers, and those still need per-token K/V.
- **6.** KDA（Kimi K3）怎么更新记忆？forget gate 和 delta rule 各做什么？[Review]
  > - **State:** KDA keeps a fixed-size recurrent state per head instead of a growing KV cache.
  > - **Forget gate:** first decays each key channel of the state, by a factor that depends on the token.
  > - **Delta rule:** then compares the token's value with what the decayed state predicts for its key, and writes the difference, scaled by a learned write strength.
  > - **Read:** the query reads the updated state.

### A4 只读一部分 KV cache
*Review: Native Sparse Attention, DeepSeek-V3.2*

- **1.** NSA 的主要想法是什么？为什么要在训练时就用稀疏，而不是只在推理时？[Review]
  > - **Main idea:** combine three branches with learned gates.
  > - **Compression:** each block is summarized, giving a global view.
  > - **Selection:** scores pick the top blocks, then attention runs on the tokens inside them.
  > - **Sliding window:** covers recent tokens.
  > - **Why train sparse:** pruning only at inference forces a dense-trained model off what it learned, so retrieval heads lose tokens they need. Sparse training also cuts long-sequence training cost.
- **2.** DSA（DeepSeek-V3.2）的主要想法是什么？[Review]
  > - **Main idea:** keep MLA but attend only to selected history.
  > - **Indexer:** a small, cheap lightning indexer scores every earlier token. It still scans everything, just far more cheaply.
  > - **Selector:** keeps the top-k for attention, so core attention scales with k, not full length.
  > - **Retrofit:** added to trained V3.1. First train the indexer to match dense attention via KL, then turn selection on and keep training.
- **3.** ⭐ "只读一部分历史"（NSA / DSA）和"压缩成固定状态"（SSM / linear attention）各放弃了什么？[Review / 讨论]
  > - **Both:** cut what a decode step reads, in opposite ways.
  > - **Sparse attention (NSA, DSA):** keeps token-level K/V, so selected old tokens come back in detail. Gives up: the cache keeps every token, reads still grow with length, and bad selection can miss information.
  > - **Fixed state (SSM, linear attention):** memory and per-step cost stay constant. Gives up: a finite state can't keep every token as context grows.

### A5 Hybrid 架构
*Review: Nemotron 3 Ultra, Mamba-2, MiniMax-01, Kimi K3*

- **1.** ⭐ 前沿模型为什么混合不同的 sequence-mixing 层？用 Kimi K3 或 Nemotron 3 Ultra 说明各层的分工。[Guide / 讨论]
  > - **Why mix:** no single layer gives both cheap long context and direct lookup.
  > - **Recurrent layers:** a fixed-size state keeps decode cheap, but history gets compressed.
  > - **Attention layers:** retrieve earlier tokens directly, but need a growing KV cache.
  > - **Kimi K3:** mostly KDA layers (efficient, position-aware mixing), with occasional Gated MLA layers (global content attention).
  > - **Nemotron 3 Ultra:** mostly Mamba-2, with a few global attention layers as anchors.

### A6 Mixture-of-Experts
*Review: Switch Transformers, Mixtral, Kimi K3, Nemotron 3 Ultra, MiniMax-01*

- **1.** ⭐ 为什么用稀疏模型？routing 怎么工作？[Guide]
  > - **Why sparse:** adding experts raises parameters while per-token FLOPs stay nearly constant, though returns diminish.
  > - **Routing:** a router scores experts for each token independently at each layer.
  > - **Top-k:** the top-k experts process the token.
  > - **Output:** their outputs are summed, weighted by gate values, which keep the router differentiable.
- **2.** ⭐ 为什么需要 load balancing？两种方法分别是什么？[Quiz]
  > - **Why:** without it, tokens pile onto a few experts. Others barely learn (collapse), and some GPUs idle while others overflow.
  > - **Method 1, auxiliary loss (Switch):** a loss on token fractions and router probabilities pushes routing toward uniform. Too large a weight hurts quality.
  > - **Method 2, bias (DeepSeek-V3, K3):** a bias added only when selecting top-k, outside the loss, adjusted from observed routing.
- **3.** ⭐ MoE 带来哪些额外成本？[Guide]
  > - **Memory:** all experts must be held, so total memory follows total parameters.
  > - **Communication:** under expert parallelism, tokens are exchanged all-to-all between GPUs holding different experts.
  > - **Weight traffic:** large-batch decode touches nearly all experts.
  > - **Load imbalance:** with static tensor shapes, buffers waste compute or overflowing tokens are dropped.
  > - **Training:** hard routing adds instability, and balancing needs extra machinery.

### A7 位置信息
*Review: RoFormer, Kimi K3, Qwen2.5-VL*

- **1.** RoPE 怎么工作？为什么能编码相对位置？[Lec]
  > - **How:** rotate each query and key by a position-dependent angle. Dimensions are split into 2D planes rotating at different frequencies. Values stay unchanged.
  > - **Why relative:** rotations compose, so the q·k dot product depends only on content and the distance m−n. Shifting both positions changes nothing.
  > - **Frequencies:** several frequencies encode distance at several scales.
- **2.** ⭐ RoPE 模型为什么在训练长度之外会失效？YaRN 怎么解决？[Quiz]
  > - **Why it fails:** RoPE leaks absolute position. Long-wavelength (low-frequency) dimensions never complete a rotation in training, so longer positions produce angles the model has never seen.
  > - **YaRN:** slows down only those long-wavelength dimensions, so longer positions map back into the angles seen in training.
  > - **Unchanged:** short-wavelength dimensions, because they encode nearby token order.
  > - **Also:** adds an attention temperature. Fine-tuning gives its best results, but it extends context without it.
- **3.** Kimi K3 为什么在 MLA 层不用位置编码（NoPE）？token 顺序信息从哪来？[Review]
  > - **Why NoPE:** K3 separates roles. MLA layers do global content interaction with no positional encoding.
  > - **Where order comes from:** the KDA layers between them, whose recurrent gating and decay are position-sensitive and favor recent tokens.
  > - **Benefit:** extending context needs no RoPE retuning or YaRN.
  > - **Limit:** it still needs progressive long-context training; NoPE only removes the positional step.
- **4.** ⭐ MRoPE 怎么工作？[Quiz]
  > - **MRoPE:** splits position into temporal, height and width IDs.
  > - **Text:** uses identical IDs, so it reduces to 1D RoPE.
  > - **Image:** one temporal ID; height and width IDs come from spatial position.
  > - **Video:** the temporal ID increases across frames.

### A8 Multi-token prediction
*Review: Nemotron 3 Ultra, Kimi K3*

- **1.** ⭐ MTP 是什么？训练和推理时各有什么用？[Guide]
  > - **What:** extra heads predict tokens beyond the next one.
  > - **Training:** predicting tokens further ahead gives a richer training signal.
  > - **Inference:** heads draft tokens for speculative decoding. The backbone verifies the drafts in one pass, and several can be accepted.
  > - **Limit:** helps mainly at small batches; at large batches verification overhead can erase the gain.

### A9 多模态
*Review: Qwen2.5-VL, Chameleon, Kimi K3*

- **1.** ⭐ 把图像接入 LLM 的 late fusion（Qwen2.5-VL）和 early fusion（Chameleon）各有什么取舍？[Guide / 讨论]
  > - **Late fusion (Qwen2.5-VL):** a separate ViT feeds an LLM initialized from a text model, then they train jointly.
  > - **Its tradeoff:** gains native resolution, fine detail and retained text strength, but covers understanding, not image generation.
  > - **Early fusion (Chameleon):** images become discrete tokens in one Transformer trained from scratch, so reasoning and generation can happen in any order.
  > - **Its tradeoff:** training is hard to stabilize, and the tokenizer limits detail.
- **2.** 多模态 LLM 是否需要每种模态各自的 encoder / decoder？[Review / 讨论]
  > - **Short answer:** not strictly required. It is a tradeoff.
  > - **Evidence:** Chameleon runs images and text through one shared Transformer, keeping only an image tokenizer and de-tokenizer.
  > - **Why separate parts help:** a dedicated encoder (Qwen2.5-VL, K3) keeps fine visual detail that a discrete tokenizer can lose.
  > - **Cost of separation:** it is harder to integrate modalities and to generate mixed image and text freely.
- **3.** Kimi K3 怎么处理视觉输入？[Guide]
  > - **One backbone:** text, images and video share one backbone and one context, with no post-hoc modality alignment.
  > - **Vision pathway:** a vision encoder (MoonViT-V2) encodes visual input, and a small MLP projector maps it into the LLM.
  > - **Training:** the encoder is trained from scratch with next-token prediction, because attaching a pre-trained encoder like SigLIP made joint training unstable.
  > - **Benefit:** the model can write code, inspect screenshots of the result and refine it, with no cross-model hand-off.

---

## Part 2 预训练

### B1 Scaling laws
*Review: Kaplan et al., Chinchilla, Llama 3, GPT-4 Technical Report*

- **1.** ⭐ Kaplan 和 Chinchilla 对"怎么分配计算"的结论有什么不同？为什么现在的模型又常被训练到超过 compute-optimal？[Guide]
  > - **Kaplan:** as compute grows, spend mostly on model size.
  > - **Chinchilla:** scale model and data about equally, so existing models were undertrained. It blames Kaplan's fixed token horizon and schedule.
  > - **Why train past compute-optimal:** that point counts only training compute. Llama 3 trains smaller models far beyond it, spending more training compute for cheaper inference.

### B2 数据
*Review: FineWeb, Llama 3, DataComp-LM, MiniMax-01*

- **1.** 过滤、去重、质量分类器各做什么？[Guide]
  > - **Heuristic filters:** cheap rules (length, symbols, repetition, language) remove low-quality pages.
  > - **Deduplication:** removes exact and near copies, which reduces memorization and adds diversity.
  > - **Quality classifiers:** learned scorers, trained on reference data or LLM labels, keep the most useful text. DCLM finds model-based filtering especially effective.
  > - **Tradeoff:** filtering too hard leaves too few tokens, so thresholds balance quality against quantity.
- **2.** ⭐ 怎么公平地评测一个数据集（DCLM）？小模型的结果能预测大模型吗？[Review]
  > - **Fair evaluation (DCLM):** fix everything except data: same raw data pool, model, training recipe, compute and evaluation tasks. Only curation changes.
  > - **Small vs. large:** small models largely predict large ones, so iterate cheaply small, then scale up.
  > - **Limit:** small runs separate large differences but don't settle close calls.
- **3.** ⭐ Mid-training / annealing 的主要目标有哪些？[Quiz]
  > - **Purpose:** mid-training (older name: annealing) prepares the base model for better post-training.
  > - **Goal 1:** raise reasoning capability by switching to higher-quality math, code and science data.
  > - **Goal 2:** extend long-context ability by raising context length with longer documents.
  > - **Learning rate:** ends near zero, which the lecture explains as avoiding disrupting what was learned.
- **4.** MiniMax-01 怎么判断重复高质量数据是有用还是会过拟合？[Review]
  > - **Problem:** earlier repetition experiments mislead, because data efficiency changes during training.
  > - **Method:** globally deduplicate, then down-sample documents so a small experiment has the same repetition frequency as the full run. Compare models with hypothesis tests on downstream metrics.
  > - **Finding:** high-quality data stays useful for more repeats than low-quality data.
- **5.** Data mix 怎么定（RegMix、Llama 3）？为什么不能全用"高质量"数据？[Guide]
  > - **Why not all "high quality":** domains interact. Code helps reasoning and web adds breadth, so the best mix is usually a blend, and it shifts with scale.
  > - **RegMix:** train tiny models on many random mixtures, fit a regressor from mixture to loss, then train the big model on the best mix.
  > - **Llama 3:** downsample over-represented web categories and compare mixes with small-model scaling-law experiments.

### B3 训练稳定性与精度
*Review: Switch, Nemotron 3 Ultra, Chameleon, MiniMax-01, Muon*

- **1.** ⭐ 大规模训练不稳定有哪些来源？normalization、precision、optimizer 三类修法分别针对什么？[Guide]
  > - **Sources:** softmax logits and activations drifting upward, low precision losing small values, hard MoE routing, and weights growing over long runs.
  > - **Normalization:** bounds values (QK-Norm, reordering); z-loss penalizes drift in the final softmax.
  > - **Precision:** selective high precision protects sensitive parts.
  > - **Optimizer:** weight decay limits growth, and update scaling evens update size.
- **2.** ⭐ Chameleon：QK-Norm、norm reordering、z-loss 各解决什么？[Review]
  > - **QK-Norm:** layer norm on queries and keys, which controls norm growth going into the attention softmax.
  > - **Norm reordering (Swin-style):** normalizes each sublayer's output, which bounds feed-forward growth that SwiGLU can amplify.
  > - **Z-loss:** a small penalty on the softmax normalizer, which restrains logit drift in the final softmax, where QK-Norm doesn't reach.
- **3.** ⭐ Switch：selective precision、小 init、expert dropout 各解决什么？[Lec]
  > - **Selective precision:** only the router runs in float32, giving float32's stability at bfloat16's speed.
  > - **Smaller initialization:** improved quality and cut variance across runs.
  > - **Expert dropout:** higher inside experts during fine-tuning, which counters overfitting from many more parameters on small tasks.
- **4.** ⭐ MiniMax-01：PostNorm 和 PreNorm 有什么区别？为什么选 PostNorm？[Review]
  > - **PreNorm:** normalize before each sublayer: x + F(Norm(x)). Stable, because gradients bypass sublayers through residuals, but this reduces effective depth.
  > - **PostNorm:** normalize after adding the residual: Norm(x + F(x)). Keeps depth, but risks vanishing and exploding gradients, so MiniMax adds DeepNorm.
  > - **Why PostNorm:** its hybrid architecture depends on effective depth, and PostNorm scored higher on most benchmarks.
- **5.** Nemotron 3 Ultra：NVFP4 预训练怎么做？切到 BF16 后为什么发散、怎么修？[Review]
  > - **NVFP4 pretraining:** the last layers, projections, MTP and embeddings stay in higher precision. Loss stayed close to BF16.
  > - **First divergence:** cutting output-layer gradient accumulation to BF16 lost small MTP gradients. Restoring FP32 fixed it.
  > - **Second divergence:** no cause was identified. It was only mitigated, and pretraining was cut short.
- **6.** ⭐ Muon：weight decay 和 update RMS 匹配为什么能稳定扩展？[Review]
  > - **Weight decay:** without it, weights and layer outputs keep growing past bf16's high-precision range, limiting long runs. So AdamW-style decay was added.
  > - **Update RMS:** Muon's update size depends on matrix shape, so large matrices update too little and small per-head ones too much, causing instability.
  > - **Fix:** scale updates by matrix shape. Updates become consistent and match AdamW's size, so hyperparameters transfer without tuning.

### B4 优化器与训练目标
*Review: Muon, RLP*

- **1.** ⭐ Muon 的核心想法是什么？解决什么问题？[Review]
  > - **Problem:** AdamW is the default. Muon beat it on small models, but its gains diminished when scaled up.
  > - **Main idea:** compute gradient momentum, then approximately orthogonalize that matrix, so weights don't learn along only a few dominant directions.
  > - **Scaling fixes:** weight decay and shape-aware update scaling make it work without tuning.
  > - **Result:** scaling laws show about 2× compute efficiency over AdamW.
- **2.** ⭐ RLP 的核心想法是什么？和普通的 post-training 有什么区别？[Review / 讨论]
  > - **Main idea:** treat chain-of-thought as an action sampled before predicting the next token.
  > - **Reward:** information gain, meaning how much the thought raises the observed token's log-likelihood over a no-think EMA baseline.
  > - **Difference from RLVR:** no verifier or curated problems, runs on ordinary pretraining text in pretraining's last phase, and rewards predictive usefulness rather than correct answers.
  > - **Afterwards:** SFT and RLVR still follow.

---

## Part 3 后训练

### C1 从 RLHF 到推理模型
*Review: InstructGPT, DPO, DeepSeek-R1*

- **1.** 后训练 pipeline 有哪些阶段，各做什么？[Guide]
  > - **SFT:** teaches instruction following, format, tool use and reasoning style by imitating demonstrations.
  > - **Preference optimization:** tunes style, safety and helpfulness from comparisons or judges.
  > - **RL with verifiers:** builds capability on checkable tasks like math and code.
  > - **On-policy distillation:** recent pipelines use it to merge specialist teachers.
  > - **Note:** order and roles vary across labs.
- **2.** ⭐ 偏好优化（InstructGPT、DPO）和 RLVR（DeepSeek-R1）在"需要什么"和"优化什么"上有什么不同？[Guide]
  > - **Preference optimization needs:** comparisons from humans or AI judges. InstructGPT also trains a reward model and samples during RL; DPO uses a static pair dataset.
  > - **It optimizes:** a learned proxy for preference under a KL constraint, so it handles non-verifiable tasks.
  > - **RLVR needs:** hard questions, a reliable verifier, RL compute and a capable base, but no human reasoning traces (R1-Zero).
  > - **It optimizes:** final-answer correctness.

### C2 Reward 信号
*Review: InstructGPT, DeepSeek-R1, Chasing the Tail, RLP*

- **1.** ⭐ Preference RM、verifier、rubric、teacher：哪个 dense、哪个 sparse？各自怎么被 policy 钻空子？[Guide]
  > - **Preference RM:** sparse, one learned score per response. Over-optimized, so scores rise while true quality falls.
  > - **Verifier:** sparse, outcome only. Hard to hack where rules are reliable, yet agents may cheat.
  > - **Rubric:** one weighted score per response. Harder to game, but still over-optimizes and can reward verbosity.
  > - **Teacher:** dense, per token. Stylistic tokens can dominate KL, and off-support prefixes give unreliable guidance.

### C3 On-policy vs off-policy
*Review: DPO, DeepSeek-V3.2, GKD, OPSD*

- **1.** ⭐ 哪些方法 on-policy、哪些 off-policy？off-policy 数据带来什么问题？[Guide]
  > - **Off-policy (fixed data):** SFT, word- and sequence-level KD, offline DPO.
  > - **On-policy (model's own samples):** PPO, GRPO, GKD at λ=1, OPSD.
  > - **Problem 1, exposure bias:** prefixes at inference differ from prefixes in training, so errors compound.
  > - **Problem 2, staleness:** samples from old policies weaken the signal, and performance falls as they get staler.

### C4 KL 散度的角色
*Review: InstructGPT, DPO, GKD, OPSD, Chasing the Tail*

- **1.** ⭐ KL 在 RLHF、DPO、蒸馏里分别控制什么？[Guide]
  > - **RLHF:** a KL penalty to the SFT model limits drift away from where the reward model is accurate, reducing over-optimization.
  > - **DPO:** solves that same KL-constrained objective implicitly, with no KL term in the loss; β sets its strength.
  > - **Distillation:** KL to the teacher is the objective itself, pulling the student's next-token distribution toward the teacher's.
  > - **Summary:** a leash in the first two, the training target in the third.
- **2.** ⭐ forward 和 reverse KL 有什么区别？[Review]
  > - **Forward KL(T‖S):** weighted by the teacher. Wherever the teacher puts mass, the student must too. It covers modes, but a weak student may spread across them and hallucinate.
  > - **Reverse KL(S‖T):** weighted by the student. It heavily penalizes tokens the teacher rejects, but the student can drop teacher modes, so it seeks one mode.
  > - **Which is better:** GKD finds it depends on the task.

### C5 蒸馏
*Review: GKD, OPSD, Nemotron 3 Ultra, Kimi K3, DeepSeek-R1*

- **1.** ⭐ 为什么用 on-policy 蒸馏？和 SFT、RL 相比各有什么优劣？[Guide]
  > - **SFT and off-policy KD:** train on fixed prefixes, so errors compound at inference (exposure bias).
  > - **RL:** uses the model's own rollouts, but spreads one score across all tokens, and gives zero gradient when a group ties.
  > - **On-policy distillation:** dense teacher feedback on the student's own rollouts (token-level DAgger).
  > - **Costs:** needs a teacher, adds generation and teacher passes to the loop, and weakens when rollouts leave the teacher's support.

### C6 RL 效率（含 Hamish Ivison guest lecture）
*Review: Async RLHF, Olmo 3, NGU, RLVE*

- **1.** ⭐ LLM RL 的计算花在哪？为什么要让它更快？[Guide]
  > - **Where compute goes:** mostly rollout generation. Inference uses several times more compute than training, the learner sits idle much of the time, and a few slow generations dominate rollout time.
  > - **Why speed matters:** RL is a large and growing share of frontier compute, and more RL steps still help, so wasted generation limits how far training can go.
- **2.** ⭐ Async RL 怎么做？代价是什么？Async RLHF 的主要发现？[Lec]
  > - **How:** generation and learning run in parallel on separate GPUs, using fast inference engines. Training uses samples from slightly older policies.
  > - **Cost:** off-policy data gives a worse signal, and performance falls as staleness grows.
  > - **Findings:** Online DPO is most robust; robustness rises with policy size, not reward-model size; one-step async matches sync while running faster.
- **3.** ⭐ Olmo 3 用了哪些效率技巧？[Lec]
  > - **Cut idle compute:** fully asynchronous actors and learner; continuous batching (a finished slot immediately takes a new prompt); inflight weight updates that keep the KV cache (the largest measured gain).
  > - **Cut wasted rollouts:** filter zero-gradient groups and easy problems; active sampling, which stabilizes batches.
  > - **Result:** training time fell substantially with similar performance.
- **4.** ⭐ 全对或全错的组（zero-std）为什么浪费？怎么处理？[Lec]
  > - **Why wasteful:** GRPO advantage is a response's reward minus the group mean. If all answers are right or all wrong, every advantage is zero, so the expensive generation yields no gradient.
  > - **Fix 1:** drop such groups from training.
  > - **Fix 2:** filter offline, mainly removing easy problems.
  > - **Fix 3:** active sampling keeps collecting nonzero groups until the batch fills, instead of oversampling in advance.
- **5.** ⭐ RL 里的 Matthew effect 是什么？NGU 怎么解决？[Lec]
  > - **Matthew effect:** RL improves problems roughly in proportion to initial ability, so easy problems gain most and hard ones barely improve.
  > - **Why:** fixed samples per prompt spend compute on easy prompts, and raising that number doesn't fix it.
  > - **NGU:** sample a few completions per prompt, skip all-correct prompts, train on mixed groups and retry all-wrong prompts. Async training shifts compute toward hard problems.
- **6.** ⭐ RLVE 怎么从数据角度提升效率？[Lec]
  > - **Problem:** RL needs just-right problems. Easy ones give no signal, and overly hard ones give consistently poor rewards.
  > - **Environments:** verifiable environments generate unlimited problems with programmatic verifiers.
  > - **Difficulty:** each keeps a sliding difficulty window, raised once the model is accurate enough.
  > - **Effect:** many environments keep problems appropriately hard, speed learning and transfer to unseen tasks.
  > - **Limits:** expert engineering, verifiable tasks only.

---

## Part 4 Guest lecture

### D1 Rex Ying：A Geometric Perspective on Foundation Models

- **1.** ⭐ 为什么要在基础模型里用双曲几何？[Guide]
  > - **Observation:** token relationships look hierarchical: low hyperbolicity means tree-like structure, and very few tokens are very frequent.
  > - **Problem:** trees grow exponentially, but Euclidean space grows only polynomially, so leaves on different branches crowd together.
  > - **Solution:** hyperbolic space has constant negative curvature and exponentially growing room, so trees fit with low distortion.
  > - **Cost:** basic operations like addition must be redesigned, so models are harder to build.

---

## Part 5 论文复述

guide 要求每篇主要论文都能说出问题、主要想法、主要结果和局限。一篇论文一道题，闭卷复述；结果和局限各说一句，不背数字。

### P 每篇论文的问题、主要想法、主要结果和局限

- **1.** Attention Is All You Need：问题、主要想法、主要结果、局限？
  > - **Problem:** RNNs process tokens one at a time, which blocks parallelism and makes distant tokens hard to connect.
  > - **Main idea:** drop recurrence and use only multi-head self-attention plus feed-forward layers, with positional encodings for order.
  > - **Result:** beat the best translation systems at a fraction of the training cost.
  > - **Limitation:** attention cost grows quadratically with length, so very long context stays expensive.

---

## Part 6 补漏

按 guide 的 Scope and format 整理：解释机制、解释或评价设计选择、比较方法。都不是考题原题；guide 只说考题会和 Quiz、paper review 题、课堂讨论相似。

### G1 guide 点名、还没讲的点

- **1.** Kimi K3 的 Attention Residuals 是什么？解决什么问题？[Guide：主要想法 / K3 review summary]
  > - **Problem:** standard residuals squeeze all earlier layers into one running state, a bottleneck like an RNN over depth.
  > - **Main idea:** apply attention across depth. Each layer uses a learned query to softmax-weight the embedding and earlier layer outputs, so it retrieves what it needs.
  > - **Cost and fix:** keeping every layer output costs memory and communication, so K3 groups layers into blocks and attends over block-level summaries.
