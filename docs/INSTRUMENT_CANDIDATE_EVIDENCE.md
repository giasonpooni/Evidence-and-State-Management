# Replayed instrument results as candidate evidence

`src/data-os/instrument-result.ts` adds a bounded server-side adapter for native
`ciw.telemetry-session.v1` bundles. It does not replace scalar corpus admission,
create a store, decide a CSE disposition or activate a release.

## Executable operations

| Operation | Result | Authority limit |
| --- | --- | --- |
| `inspectInstrumentResult(bytes, context, runtime, inspectedAt)` | Detached `payload.instrument-candidate-inspection.v1`, either `ELIGIBLE_FOR_CANDIDATE_REVIEW` or `REFUSED` | Read-only; `canonicalAdmission: REFUSED`, `evidenceRetained: false` |
| `captureInstrumentResult(bytes, context, runtime, request, store)` | `CANDIDATE_EVIDENCE_RETAINED` plus existing `BinaryEvidence` / `StorageReceipt`, or `REFUSED` | Optional candidate retention only, through existing `captureEvidence` and `ContentAddressedStore` |

Both operations recompute CIW's pinned scientific path and call SET's verifier
over fresh numerical outputs. They accept no supplied verification boolean,
callback, operation import, or executable binding from the bundle. A previously
passed receipt does not exempt a later capture from replay.

Source bytes, operation pins, execution occurrences, numerical-content IDs,
verification occurrence and local policy context remain separate. Runtime
checkouts, interpreter digest and helper bytes are checked before execution.
Actual tracked Git blobs are compared even when `assume-unchanged` or
`skip-worktree` hides an edit. Git replacement objects, source symlinks, ignored
importable additions and pre-existing bytecode caches cannot substitute the
verified source. These checks detect drift; they are not a sandbox or an
independent attestation of installed numerical dependencies.

PPDA alone permits its unrelated vendor gitlink outside `bridge`: CIW executes
only the separately byte-checked standalone projection, never that vendor tree.
This exception does not apply to CIW/SET imports or other instrument runtimes.

## Read-only CLI

```bash
npm run instrument:inspect -- \
  --bundle /absolute/path/session.json \
  --context /absolute/path/source-review-context.json \
  --runtime /absolute/path/operator-runtime.json \
  --at 2026-09-21T12:00:00Z
```

Exit codes: `0` candidate-review eligible, `2` refused, `1` invalid/unavailable
input. Output is an inspection receipt, not raw evidence. The CLI performs no
retention write; the TypeScript capture API is the explicit write seam.

The operator runtime file supplies an absolute `python`, its exact
`pythonSha256` (64 lowercase hex), absolute `helperPath` pointing to this
repository's `scripts/instrument-replay-verify.py`, and `repositories`:

```json
{
  "python": "/absolute/path/to/python3",
  "pythonSha256": "<SHA256_OF_INTERPRETER_BYTES>",
  "helperPath": "/absolute/path/Evidence-and-State-Management/scripts/instrument-replay-verify.py",
  "repositories": {
    "ciw": {"path": "/absolute/path/CIW", "revision": "<40_HEX_COMMIT>"},
    "ppda": {"path": "/absolute/path/PPDA", "revision": "<40_HEX_COMMIT>"},
    "stfe": {"path": "/absolute/path/STFE", "revision": "<40_HEX_COMMIT>"},
    "gsie": {"path": "/absolute/path/GSIE", "revision": "<40_HEX_COMMIT>"},
    "set": {"path": "/absolute/path/SET", "revision": "<40_HEX_COMMIT>"}
  }
}
```

Add `cbsr` when the saved path uses it. Paths are local operator configuration;
never derive them from the saved session. CIW checks its own approved telemetry
runtime manifest too. The helper hash is committed in ESM's Node module;
changing it requires a reviewed update of that commitment. Node verifies the
interpreter bytes before executing them.

## Policy and retraction context

`InstrumentReviewContext` requires `requestId`, a named `role:` or `person:`
authority, `purpose`, `sources`, and `retractions`. Each source entry contains
an existing `SourceRegistration` and exact `evidence: [{artifactRef, digest}]`
bindings. This policy/source association is an operator declaration, not source
authentication inferred from a URI. Two references to identical bytes stay
distinct; this does not establish independent sensors.

Inspection requires freshly allowed `RETRIEVE` and `DERIVE` for every included
source, for the declared purpose and `INTERNAL` audience. Capture also requires
`INGEST` for every included source and a separately registered derived bundle.
Derived-envelope retention cannot outlast any included-source retention.
Unknown, expired, approval-required or incompatible policy refuses before any
write. Exact evidence/policy mappings and known withdrawals are checked before
numerical replay.

Retractions carry `retractionId`, `targetKind`, `targetId`, `knownAt`, `authority`
and `reason`. `EVIDENCE` targets an artifact reference or byte digest; `BUNDLE`
targets the semantic bundle digest or exact transport-byte digest;
`NUMERICAL_RESULT` targets the numerical-content ID. `VERIFICATION` additionally
requires `subjectBundleDigest`: a fresh verification occurrence cannot silently
revive the withdrawn bundle's support. There is no implicit reactivation command.

Numerical withdrawals accept both CIW step numerical-content IDs and the native
GSIE/STFE/CBSR numerical IDs retained inside result artifacts. A wrapper does not
erase an instrument-issued withdrawal target.

Knowledge-time filtering preserves historical receipts without rewriting them.
Callers supply available retraction history; the adapter explicitly marks
`retractionHistoryComplete: false`. It does not establish a live correction feed.

## What capture retains

One content-addressed `payload.instrument-candidate-evidence.v1` envelope holds
original bundle bytes as base64, full policy/retraction context, fresh inspection,
capture request and recomputed INGEST decisions. This makes the policy binding
replayable without inventing another store. The existing evidence writer verifies
the exact byte digest and readback. Store adapters still own physical object-lock,
expiry enforcement and durability. A backend failure after `put` may leave an
object without a successful receipt; no false success or erasure is reported.

Candidate evidence remains `UNADMITTED`. Canonical assertion still requires an
explicit domain projection establishing subject identity, world/knowledge clocks,
predicate, evidence class and applicable admission policy. Replay does not prove
physical truth, calibration, model adequacy, unique fault isolation, release
eligibility or CSE `ACCEPT`.

CBSR `accepted`, `held` and `refused` dispositions remain explicit, together with
`outputConstraintResidualZero`. A reproducible held/refused correction may be
retained as diagnostic evidence, never relabeled as an accepted reconciled state.
Even an accepted operation does not assert exact output closure when its closure
flag is false.

## Validation

```bash
npx vitest run src/data-os/instrument-result.test.ts src/data-os/evidence-capture.test.ts src/domain/admission.test.ts src/domain/candidateProjection.test.ts
python3 -B scripts/test_instrument_replay_verify.py
npm run typecheck
```

Unit tests isolate the Python subprocess boundary and exercise policy, tampering,
missing evidence, changed occurrences, retraction history, helper/interpreter
substitution, no-write refusals, envelope retention and exact-byte readback.
Dependency-free Python tests exercise real temporary Git checkouts against hidden
edits, ignored modules, source symlinks, replacement objects, duplicate JSON and
nonzero-underflow/overflow. These tests do not establish a deployed service.

`python -B scripts/check_instrument_replay.py` is the opt-in native gate. It reads
only the reviewed CIW commit pinned in that script and provider commits from
CIW's manifest, creates a synthetic bundle in temporary storage, then runs the
real ESM replay/capture/tamper/withdrawal integration test. The separate
`Pinned instrument candidate evidence` workflow runs this path with read-only
repository permissions. No branch-following scientific dependency is installed.

For existing local pinned checkouts and a saved synthetic bundle, set
`ESM_TELEMETRY_BUNDLE_FILE` and `ESM_TELEMETRY_RUNTIME_FILE`, then run
`npx vitest run src/data-os/instrument-result.integration.test.ts`. Without those
explicit bindings this integration test reports a skip, not a simulated pass.
