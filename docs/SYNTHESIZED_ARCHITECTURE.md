# Synthesized architecture

This architecture retains one maintained information substrate, five fabrics and
explicitly non-authoritative projection instruments. It describes responsibility
boundaries and distinguishes them from the bounded local implementation.
[Company mandate](COMPANY_MANDATE.md) and
[Economic architecture](ECONOMIC_ARCHITECTURE.md) record the current engineering
identity and information-product boundaries.

## Firm and component structure

Notation Systems develops computational instrumentation and evidence infrastructure
for industrial and cyber-physical systems. The existing trade, industrial,
infrastructure and risk corpora continue on that shared substrate.

Evidence and State Management is this repository's stable responsibility:
provenance-aware evidence, versioned state, admission and release management.
It includes local preparation, review and operational interfaces while preserving
the broader physical-economy, business, rights and scientific-evidence scope.

Scientific Computation Runtime specifies, dispatches and records declared
scientific computations. Computational Instrumentation Workbench provides
instrument sessions, adapters, inspection and replay. The
[stack responsibility table](../README.md#stack-responsibilities) links the
acquisition, visualization, evaluation and reconciliation components as well.
A role table does not establish a working adapter or production integration.

Caravan, Tradewind and Landshark retain domain ownership; Dossier Services retains
the information-delivery role. HTTP feeds and MCP tools are existing distribution
interfaces. Internal research instruments do not establish managed customer
workloads, completed customer delivery or authority to control physical systems.

Historical PayloadOS and NotationsOS labels, internal STE/SCL/SIL names, package
names, schema identifiers, evidence digests and runtime pins retain their meaning.
The repository rename does not rewrite the records below. A new representation
or engine extends the shared substrate and crosses the same admission boundary.

## Five fabrics over one substrate

The architectural cycle is:

```text
Acquire → Preserve Evidence → Compile Corpus → Establish State
→ Project → Compute → Investigate → Act → Observe
```

These are responsibility boundaries, not a claim that every stage is implemented or deployed. The fabrics share provenance-bearing references; they are not five separate customer databases.

| Fabric | Responsibility | Boundary |
|---|---|---|
| Acquisition Fabric | World → evidence: authorized files, documents, APIs, observations, telemetry, operations and other source material | Preserve source, bytes, time and use rights; observation does not directly mutate canonical state |
| Corpus Fabric | Evidence → computational corpora: normalization, identity, ontology, units, temporal reconciliation, uncertainty, indexes and explicit relationships | The Computational Commons is the organized corpus substrate, not a particular database product; preserve evidence alongside derived information |
| State Fabric | Corpus → candidate → validation → canonical version: schema, `CanonicalState`, `VersionStore` and `StateDelta` | Admit changes through explicit validation; canonical state is not the whole corpus |
| Compute/Decision Fabric | State/context → model → derived result → decision: `InquiryState`, Morpho, STE/SCL/SIL and decision machinery | Inquiry may contain hypotheses, temporary graphs, scenarios and errors; derived output is not automatically canonical truth |
| Projection Fabric | Selected corpus/state/inquiry → human- or machine-operable representation: APIs, reports, graphs and spatial/structural views | A projection changes representation, not source identity or authority; engines do not own separate authoritative state |

Feedback returns to the Acquisition Fabric as an observation or evidence-bearing input. It does not bypass the validation boundary into canonical state. A visual discovery may become a derived observation in inquiry, then a candidate for validation; drawing or selecting an object does not promote it.

## Seven doctrine invariants

1. Evidence is not state.
2. Canonical state is not the entire corpus.
3. Inquiry is allowed to be wrong.
4. Computation produces derived objects, not truth automatically.
5. Projection never mutates its source.
6. Identity survives representation changes.
7. Every promoted result crosses an explicit validation boundary.

The accompanying operational rule is: **Build shared information before multiplying reasoning processes.**

These rules apply across all three domain products. Visual adjacency is not a semantic edge; geographic proximity is not a causal relationship; embedding similarity is not a canonical relation. Cross-domain connections require explicit evidence-bearing mappings rather than matching labels or shared screen positions.

## Projection instruments, not information systems

The assigned roles below are architectural choices from the supplied synthesis. Of the three engines, CesiumJS is installed and rendering as the [Earth Twin](EARTH_TWIN.md), keyless and offline, drawing declared fixture positions; kepler.gl and Three.js remain routed to, not installed.

| Instrument | Assigned question and coordinate meaning | Target role |
|---|---|---|
| kepler.gl | Where are the patterns across geospatial observations? | Analytical cartography: distributions, density, flows and geographic exploration |
| CesiumJS | Where is the physical system in geographic space? | Geodetic/world realization of assets, infrastructure and movement |
| Three.js | How is the system structured in physical or computational space? | Intrinsic geometry, arbitrary model space, scientific structures and graph/field representations |

The same referent keeps its identity across a map point, geographic object, structural view, graph node and API record. The corpus determines which projections are useful; a product need not instantiate every engine. No graph layout or scientific geometry should be represented as a geographic position without an explicit transform and evidence for that interpretation.

Notation Workbench is the target interaction environment above these instruments. MAP, GLOBE, STRUCTURE, GRAPH, STATE, TIME, EVIDENCE and COMPLEXITY describe possible user modes; they are not eight implemented screens. The user chooses an interpretation, while a shared `ProjectionSpec` declares the selected source/version, records, temporal bounds, coordinate semantics, representation and transformation lineage. See [Projection fabric](PROJECTION_FABRIC.md) for the narrower implemented contract.

Meaning → state → projection → GPU remains the direction of authority. WebGPU is an optional rendering/compute target, not the data model or source of knowledge.

## Runtime allocation

These are target responsibilities, not claims that all language services exist today:

| Runtime | Responsibility | Must not imply |
|---|---|---|
| Node.js / TypeScript | Application/API facade, request routing, session/workspace state, projection requests, synchronization and stream mediation | Canonical scientific truth, ontology authority or heavy scientific computation; planned authentication/transport services are not implemented merely because Node is present |
| Rust | Deterministic core systems, graph operations, compilation and kernels | A production canonical state kernel already exists in this repository |
| Python | Acquisition adapters, scientific workflows and models | A model output is admitted truth or an automatically authorized source |
| C++ and C/CUDA where appropriate | Performance-critical scientific/numerical kernels and bounded simulation/computation | A GPU or native runtime defines source identity, policy or corpus meaning |
| SQL / PostgreSQL / PostGIS | Durable structured operations and spatial persistence | The database itself is the information product, or production storage is already deployed |
| Browser | Visualization, selection and interaction | Renderer state is canonical domain state |

`WorkbenchSession` would hold extrinsic interaction state such as selected entities, active view, visible layers, filters, camera and UI preferences. `InquiryState` would hold selected evidence, hypotheses, temporary graphs, calculations, annotations and scenarios. Neither becomes `CanonicalState` through ordinary UI updates. A proposed `CandidateDelta` still crosses validation before admission.

Current local TypeScript implementations perform bounded byte/policy checks, deterministic Carrier parsing, candidate-manifest assembly and historical inspection. A small Rust [notation state kernel](LOCAL_NOTATION_STATE_KERNEL.md) now supplies stable authored-object IDs, explicit relations, validated commands and reversible history, consumed through the web frontend and versioned local storage. This does not make either application runtime an authoritative scientific engine or establish production canonical state. The local notation kernel and proposed canonical State Fabric admission machinery are distinct from the sibling Notations Kernel's portable `Artifact`/`Claim`/`Operator`/`VerificationEnvelope` grammar.

## Historical concept mapping

These mappings preserve the supplied synthesis without silently promoting old concepts into running services:

| Historical concept | Home or interpretation |
|---|---|
| Annotated Systems Archive | Evidence and Corpus Fabric |
| Computational Commons | Corpus Fabric and its organized information inventory |
| Oracle | Query/compute service role |
| Odyssey | Exploration/inquiry workflow |
| Librarian | Operator/interface role |
| PayloadOS | Historical ancestor wording in the synthesis; current Evidence and State Management retains and governs information and includes the local terminal behind the Caravan, Tradewind and Landshark interfaces |
| DAF | Acquisition Fabric |
| EvidencePool | Evidence substrate |
| Immutable graph | Structural representation of the corpus, not the whole corpus or a universal canonical database |
| InquiryState | Compute/Decision Fabric; not implemented here |
| CanonicalState | State Fabric; admission rules and PostgreSQL integration exist, while retained real customer inventory is not established |
| Morpho | Representation/compute intermediate representation; not implemented here |
| STE | Deterministic execution responsibility |
| SCL | High-performance scientific computation responsibility |
| SIL | Models, ML and optimization responsibility |
| FEP | Resource/control policy role |
| Model Complexity | Cross-cutting representation audit |
| Graph-State Decision Fabric | Decision subsystem |
| Kepler / Cesium / Three.js | kepler.gl analytical geography / CesiumJS geodetic world / Three.js structural-scientific projection |
| Node.js | Workbench/application runtime |
| Postgres/PostGIS | Persistence implementation |
| Rust / Python | Deterministic core / acquisition and scientific implementation |
| SP1/ZK | Optional verification backend, not required or claimed by this increment |
| Mistral | Deferred; no architectural role assigned |

## Implemented boundary

Compute update (2026-09-06): the [local scalar scientific baseline](SCIENTIFIC_BASELINE.md) is a bounded conventional estimator with exact evidence/model references and held-out-reference metrics. Its demo is synthetic; it establishes neither real sensor fusion, a learned model, independent physical validation nor managed execution. [Recorded-observation replay](RECORDED_OBSERVATION_REPLAY.md) remains a separate fixed-transform inspection contract. [Scientific model roles](SCIENTIFIC_MODEL_ROLES.md) names specialist methods without admission authority or changes to the data-product mandate.

Spatial Compute increment: [weighted rigid registration and access geometry](REGISTRATION_ACCESS.md) fit supplied 3D controls and distinguish local Euclidean from permitted-network distance. A separate evidence-bound CLI retains immutable derivations; `/compute/registration` inspects only an in-memory synthetic example. Check-point discrepancies remain distinct from fitting error; declared closures do not become source events. No inferred calibration enters replay, GAT, Earth, corpus state or admission automatically.

The [local production API](LOCAL_PRODUCTION_WORKFLOW.md) connects Acquisition and candidate organization through explicit registered inputs, stage receipts and historical inspection. The [GAT IFC inspector](GAT_INSPECTOR.md) is a pinned Compute/Decision instrument over preserved evidence, with a separate safe Projection response. Its analysis model does not become State Fabric canonical authority; the Rust notation kernel remains authored state only. Neither local path activates a release or public customer execution.

The local acquisition, normalization and candidate-build rails and the manually launched coordination reviewers remain as documented. Their unadmitted local files do not become a released corpus or a source for the fixture projection endpoint. The public corpus/workbench surfaces remain demonstration fixtures.

The Acquisition Fabric now includes one [local operator-only FMCSA Company Census connector](LOCAL_SOURCE_CONNECTORS.md) for internal qualification. A guarded CLI request preserves the original provider bytes, immutable intent, request-budget and outcome history, then returns source-scoped observations or retains a quarantine. One live qualification captured a 371-byte response for USDOT 80806 on 2026-09-05; offline inspection and disabled-collection replay preserved that history. The source is `fmcsa-company-census`, not the credential-dependent QCMobile API, and its observations are not compatible with the synthetic Carrier normalization contract. The qualification declaration permits no customer redistribution; it supplies no identity resolution, canonical admission, corpus release or customer feed.

The Projection Fabric supplies a bounded, read-only specification and preview over exact fixture releases. CesiumJS renders declared positions; kepler.gl and Three.js remain routing targets. `/notations` supports create → update → undo → save → page reload through the Rust command kernel. Its stable IDs and authored relationships do not confer source truth or admission authority. Bevy ECS remains deferred.

Current boundary (2026-09-08): admission rules, issued-identifier resolution,
world-time establishment and PostgreSQL/Drizzle storage are implemented. The
supplied-byte statutory harvester can evaluate admission and answer as-of
questions in memory; that result alone does not persist an operational release.
Bounded scientific instruments and CesiumJS are implemented separately from the
still-proposed general `InquiryState`, Morpho and simulation runtime.

All three product lines carry demonstration data. The historical FMCSA
qualification and offline-tested Samsara adapter do not establish recurring
source operation. A retained real customer inventory, deployed licensed
delivery, independent verification and completed pilot are not established by
the repository. Customer-hosted execution, custody and settlement are outside
the active boutique-data offering. Existing internal experiments remain
available for a package whose fields or quality checks need them.
