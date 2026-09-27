# Tarsius — LIVE FINALS Script (varian presentasi langsung)
*IBM Bob 2.0 Hackathon (lablab.ai — September 25–27, 2026)*

> ⭐ **VARIAN — bukan deliverable utama.** Deliverable utama = **VIDEO 3:00** (angka & klaim mengikuti kanon `demo/DEMO-MASTER.md`). File ini dipakai **kalau lolos finalis dan diminta presentasi live**, dengan arahan panggung.
>
> **Aturan kanon angka (Guardrail §3):** Fortra 2026 (72% RPG >50; 69% skills gap #1), Gartner press release 2026-06-18 (>70% mainframe exits fail), TSB £48.65M FCA, arXiv:2605.17535 (BER 0–19%). **Angka produk:** naive 67% (8/12), governed 100% (12/12), 38/38 tests, 6 MCP tools — semua live-provable.
>
> **DILARANG muncul di slide/ucapan:** "2 hours → 5 minutes" (belum diukur), "knowledge retention 100%", "FINRA", "Z3", "Graph Orchestrator", "Bob's Business Rules Extraction", tanggal GA Bob, "TechXchange/Dev Day".

---

## 🧭 ARC (sama dgn kanon — 8 segmen, ~3 menit live)

```
V-1 Crisis (20s) → V-2 Blindspot (20s) → V-3 Intro (15s) → V-4 Flow (15s)
→ DEMO live (60s) → V-6 Passport (15s) → V-7 Impact (15s) → V-8 Closing (10s)
```

**Pilih opening sesuai track kickoff (Guardrail §1):**
- Modernization track → VARIANT A (krisis IBM i)
- Governance/trust track → VARIANT B (trust angle)

---

## V-1 — THE CRISIS (20s)

**Stage:** angka besar di layar; lo di tengah, tanpa mungkin baca slide.

**🎤 VARIANT A (modernization):**
> *"For the first time in nine years, IBM i shops fear one thing more than cybersecurity: running out of the people who understand their own systems. 72% of RPG developers are over fifty. Gartner says over seventy percent of mainframe modernizations will fail. Why? Not the code — the knowledge that was never written down."*

**🎤 VARIANT B (governance/trust):**
> *"Every AI coding tool can write code. Almost none can be trusted with the rules nobody wrote down. Gartner: over seventy percent of mainframe exit projects fail — not because AI can't write code, but because the knowledge AI needs was never written. We fix that."*

---

## V-2 — THE BLINDSPOT (20s)

**Stage:** split screen code vs spec; badge merah CONTRADICTION.

> *"Here's what that looks like. ORDVAL — a real order-validation module. The spec says no exceptions, ever. The code says otherwise: lines 77 to 81, a legal carve-out from 2010. Eleven years out of sync — invisible, because no tool reads both. Research backs the risk: LLMs retain zero to nineteen percent behavioral equivalence on legacy edge cases."*

*(TSB £48.65M hanya sebagai footer slide — jangan dibacakan, makan waktu.)*

---

## V-3 — INTRODUCING TARSIUS (15s)

> *"This is Tarsius — named after the tarsier, whose giant eyes see what others miss. Bob reads what's written. Tarsius captures what only lives in someone's head — and makes AI obey it."*

*(Kalimat "IBM sendiri bilang generating or translating code is only one part of the challenge" — opsional di sini kalau track modernization: satu kalimat, sumber: pengumuman Bob Premium Package for Z, Jul 2026.)*

---

## V-4 — HOW IT WORKS (15s)

> *"The flow: Bob extracts rules, Tarsius triages them deterministically — zero LLM calls — the SME approves only what matters, and every decision lands in a SHA-256 ledger. Six MCP tools, persisted across context compaction via PreCompact and PostCompact hooks, enforced org-wide via Bob Shell's EnforcedHooks."*

---

## 🎬 LIVE DEMO (60s) — rencana + fallback

| Step | Aksi | Yang dilihat juri |
|---|---|---|
| 1 | Bob `legacy-analyzer` atas `ORDVAL.rpgle` + spec | 4 rules muncul |
| 2 | Zoom 🔴 BR-DISC-EXCEPTION | code ALLOW vs spec BLOCK, 11 tahun |
| 3 | Approve via dashboard | `RISK-CONTEXT.md` + decision + hash |
| 4 | Terminal `verify_equivalence runner=naive` | **BER 67% (8/12)** — deviasi V04, V06, V07, V12 |
| 5 | `verify_equivalence runner=governed` | **BER 100% (12/12)** |

> *"Watch two runs. Without the contract: sixty-seven percent — a legal carve-out dropped silently. Approve the rule, regenerate under contract: one hundred percent, twelve of twelve. Same Bob. The difference is governance."*

**Fallback berjenjang:** (1) output tersimpan → `cat` hasil JSON; (2) screenshot; (3) test suite `38/38 passing` sebagai bukti terakhir. **Jangan pernah debugging live di depan juri.**

---

## V-6 — RULE PASSPORT + ENFORCEMENT (15s)

> *"Every rule ships as a Rule Passport: who approved it, the legal basis — CS-4471, 2010 — the hash chain, verified. And it's not advisory: Bob Shell's EnforcedHooks makes the approval flow an org-wide policy that can't be bypassed."*

---

## V-7 — MEASURED IMPACT (15s)

> *"On our demo: sixty-seven to one hundred percent behavioral equivalence, verified by a differential oracle. Two implicit rules any code-only tool would miss. One contradiction, unsynced for eleven years, now permanent. Thirty-eight tests passing."*

---

## V-8 — CLOSING (10s)

> *"Bob reads what's written. Tarsius captures what's only in someone's head. Capture Knowledge. Then Let AI Code."*

*(Stop. Jangan menambah kalimat. Diam 2 detik → jadi ruang tanya.)*

**Closing alternatif (Track A / modernization):**
> *"The most dangerous legacy rule is not the one written badly — it's the one nobody wrote down. Bob can modernize the code. Tarsius makes sure the business survives the modernization."*

---

## 🛡️ Q&A DRILL-DOWN (live finals — semua jawaban match implementasi)

**Q: "Why an MCP server instead of just `.bob/rules/`?"**
> "Rules are static prompts. Tarsius needs state: immutable decisions with SHA-256 chains, deterministic triage, and a verification tool. `.bob/rules/` guides our mode prompts; the MCP server owns persistence and computation. Six tools, `alwaysAllow` in `mcp.json`."

**Q: "How does BETH verify without an IBM i environment?"**
> "The oracle isn't a re-translation of the RPGLE — that would be a self-fulfilling test. It executes the business rules the SME approved in the Business Rule Inventory, against twelve deterministic vectors. The approved set is injected, so results are reproducible — you can run `verify_equivalence` yourself right now."

**Q: "What if developers bypass the approval flow?"**
> "EnforcedHooks — Bob Shell 2.0.2. Org-wide hooks that run before user hooks and cannot be overridden or disabled. The approval flow becomes company policy, not developer goodwill. And every decision that does happen lands in a SHA-256 chain ledger."

**Q: "How is this different from Pedigree, the previous winner?"**
> "Pedigree answers 'who wrote this' — post-hoc provenance, cryptographic signing. Excellent, and complementary. Tarsius answers 'what must this code do' — pre-generation governance: capture the rule before AI writes. One signs the artifact; the other constrains the generation. Together they're the full trust stack."

**Q: "How is this different from semantic analysis tools like PRISM or CodeAtlas from last edition?"**
> "Those are excellent post-hoc tools — they analyze code that was written and score the risk. Tarsius works on a different input and a different clock: the knowledge that was never written, captured from the SME before generation, and verified afterward by differential execution. Analysis tools read the code; Tarsius interviews the person who remembers why the code exists."

**Q: "Doesn't this compete with Bob Premium Package for i/Z?"**
> "The opposite. IBM's own announcement said generating or translating code is only one part of the challenge. Premium Package solves the translation part. Tarsius is the other part — tacit knowledge capture and equivalence proof. We accelerate adoption of Premium, not compete with it."

**Q: "Is the triage just an LLM judging itself?"**
> "Zero LLM calls. Four deterministic conditions — contradiction +40, confidence deficit, module spread, single-source. Same input, same verdict, every time. That's what makes it auditable."

**Q: "What are the limitations?"** *(sebut duluan sebelum ditanya — pola pemenang)*
> "Three, honestly. Our dependency-graph demo references stub modules. The BER claim is scoped to the twelve ORDVAL vectors, not arbitrary code. And review-time savings are not yet formally measured — we report what we can prove."

**Q: "Production-ready?"**
> "Demo-grade, deliberately: git-native, JSON+Markdown, zero infrastructure, 38/38 tests. The architecture is the product; hardening is a roadmap, not a research problem."

---

## ✅ CHECKLIST H-1 (malam sebelum live)
- [ ] Demo di-run 2× berturut-turut tanpa gagal + fallback screenshot di folder lokal
- [ ] `git checkout sample-data/` — reset BRI ke 2 pending / 2 approved sebelum demo
- [ ] Semua angka di slide = tabel "Angka resmi" kanon
- [ ] Variant A/B sudah dipilih sesuai track kickoff
- [ ] Stopwatch latihan: total ≤ 3:00 dua kali berturut-turut
