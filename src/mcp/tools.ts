/**
 * MCP tools: one of the firm's distribution mechanisms. Each tool is a thin
 * wrapper over the same feed payloads the HTTP endpoints serve (one logic
 * path, nothing to drift). A refusal is a successful return carrying a
 * refusal object with a remedy, never a tool error; tool errors are for
 * malformed arguments only.
 */
import { z } from 'zod';
import { asOfPayload, recordsPayload, releaseManifestPayload, releasePayload, releasesPayload, retractionsPayload, rulingManifestPayload, rulingPayload, viewerFromParam } from '@/adapter/feed';
import { getCorpusSource } from '@/adapter/corpusSource';
import { getCaseSource } from '@/adapter/caseSource';
import { FIXTURE_FACTORING_RECEIPTS } from '@/fixtures/caravan/factoring';
import { verifyFactoringReceiptIntegrity } from '@/domain/factoring';
import { FIXTURE_DISPATCH_STREAM, DEFENSE_RECONSTRUCTION_CASE_0803 } from '@/fixtures/caravan/dispatchLiability';

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?Z$/;
const iso = (what: string) => z.string().regex(ISO, `${what} must be an ISO 8601 UTC instant, e.g. 2026-08-28T14:00:00Z`);
const projection = z.enum(['COUNTERPARTY_SHARED', 'PUBLIC_RULING']).optional().describe('Projection to serve. Internal classes are never served.');

export interface McpToolDef<S extends z.ZodRawShape = z.ZodRawShape> {
  name: string;
  description: string;
  shape: S;
  /**
   * `scope` is the corpora the calling session named, passed by the governed
   * door and undefined on the unauthenticated feed. Only a corpus-spanning
   * read needs it: a tool that names a release or a corpus in its arguments is
   * already checked against the scope before it is dispatched, and a tool that
   * ignores the parameter is unchanged.
   */
  run: (args: z.infer<z.ZodObject<S>>, scope?: readonly string[]) => Promise<unknown>;
}

const notFound = (what: string, id: string, remedy: string) => {
  const isLive = getCorpusSource().origin.kind === 'LIVE';
  return { ...(isLive ? {} : { fixture_only: true }), error: `${what}_not_found`, detail: `No ${what} ${id} in the current source.`, remedy };
};

function def<S extends z.ZodRawShape>(d: McpToolDef<S>): McpToolDef<S> {
  return d;
}

export const MCP_TOOLS = [
  def({
    name: 'list_releases',
    description: 'Release history of every corpus: id, status, knowledge cutoff, build, methodology, certification, digest, supersession.',
    shape: { corpus: z.string().optional().describe('Corpus id to filter by, e.g. caravan.specialty-cargo') },
    run: async ({ corpus }, scope) => releasesPayload(corpus, scope),
  }),
  def({
    name: 'get_release',
    description: 'One release: build record with stages and input digests, coverage, sources with their intelligence-rights schedule, certification, governance, links.',
    shape: { releaseId: z.string().describe('Release id, e.g. REL-CAR-2026.09.01') },
    run: async ({ releaseId }) => (await releasePayload(releaseId)) ?? notFound('release', releaseId, 'Call list_releases.'),
  }),
  def({
    name: 'get_release_manifest',
    description: 'The certified release manifest and its sha256 commitment.',
    shape: { releaseId: z.string() },
    run: async ({ releaseId }) => (await releaseManifestPayload(releaseId)) ?? notFound('release', releaseId, 'Call list_releases.'),
  }),
  def({
    name: 'list_records',
    description: 'Deliverable records of a release after the rights guard and the projection, each with value, unit, basis, uncertainty bounds, validity bounds, both clocks, provenance, evidence class, rights and attribution. Withheld counts are counts only.',
    shape: { releaseId: z.string(), subject: z.string().optional().describe('Subject id, e.g. LOT-5B-221'), predicate: z.string().optional().describe('Predicate, e.g. quantity.gross'), projection },
    run: async ({ releaseId, subject, predicate, projection: p }) => (await recordsPayload(releaseId, viewerFromParam(p), { subjectId: subject, predicate })) ?? notFound('release', releaseId, 'Call list_releases.'),
  }),
  def({
    name: 'query_as_of',
    description: 'What the release could answer about a subject and predicate at a world time, given what was knowable at a knowledge time. Returns the answering record with its status, the identity link used if any, or a typed refusal with a remedy and the candidates set aside.',
    shape: { releaseId: z.string(), subject: z.string(), predicate: z.string(), validAt: iso('validAt').describe('World time the answer must describe'), knownAt: iso('knownAt').describe('Knowledge cutoff; clamped to the release cutoff'), question: z.enum(['WHAT_WE_HELD', 'WHAT_THE_SOURCE_KNEW']).describe('Which as-of question. WHAT_WE_HELD is bounded by this corpus\u2019s knowledge time. WHAT_THE_SOURCE_KNEW is bounded by the source\u2019s own clock, which no record here carries, so it is refused rather than answered on the wrong clock. There is no default.') },
    run: async ({ releaseId, subject, predicate, validAt, knownAt, question }) => (await asOfPayload(releaseId, { subjectId: subject, predicate, validAt, knownAt, question })) ?? notFound('release', releaseId, 'Call list_releases.'),
  }),
  def({
    name: 'list_retractions',
    description: 'Push retractions (corrections and recalls) issued after a cursor, oldest first, with affected and replacement records and the rulings they touched.',
    shape: { since: iso('since').optional().describe('Return retractions issued after this instant; typically the knownAt of the release you hold'), projection },
    run: async ({ since, projection: p }, scope) => retractionsPayload(since, viewerFromParam(p), scope),
  }),
  def({
    name: 'get_ruling',
    description: 'Application layer: a ruling as the Caravan workbench returns it, at the requested projection.',
    shape: { rulingId: z.string(), projection },
    run: async ({ rulingId, projection: p }) => (await rulingPayload(rulingId, viewerFromParam(p))) ?? notFound('ruling', rulingId, 'Rulings are listed at /rulings.'),
  }),
  def({
    name: 'get_ruling_manifest',
    description: 'Application layer: the notations.result-manifest.v1 sidecar of a ruling and its commitment.',
    shape: { rulingId: z.string(), projection },
    run: async ({ rulingId, projection: p }) => (await rulingManifestPayload(rulingId, viewerFromParam(p))) ?? notFound('ruling', rulingId, 'Rulings are listed at /rulings.'),
  }),
  def({
    name: 'get_factoring_receipt',
    description: 'Evidence product: underwriting-grade shipment receipt (fact + condition + provenance + bitemporal cutoff Tk) for invoice factoring and financing.',
    shape: { receiptId: z.string().describe('Receipt id, e.g. RCP-FACT-2026-0901') },
    run: async ({ receiptId }) => {
      const found = FIXTURE_FACTORING_RECEIPTS.find((r) => r.receiptId === receiptId || r.shipmentId === receiptId);
      return found ?? notFound('factoring_receipt', receiptId, 'Factoring receipts are available at /factoring.');
    },
  }),
  def({
    name: 'verify_factoring_receipt',
    description: 'Cryptographic attestation and invariant integrity audit for an underwriting factoring receipt.',
    shape: { receiptId: z.string().describe('Receipt id to verify') },
    run: async ({ receiptId }) => {
      const found = FIXTURE_FACTORING_RECEIPTS.find((r) => r.receiptId === receiptId || r.shipmentId === receiptId);
      if (!found) return notFound('factoring_receipt', receiptId, 'Factoring receipts are available at /factoring.');
      const valid = verifyFactoringReceiptIntegrity(found);
      return {
        receiptId: found.receiptId,
        intact: valid,
        verdict: found.verdict.status,
        maxAdvanceBasisPoints: found.verdict.maxAdvanceBasisPoints,
        recommendedAdvanceCents: found.verdict.recommendedAdvanceCents,
        invariantsChecked: found.invariants.length,
        failedInvariants: found.invariants.filter((i) => i.status === 'FAILED').map((i) => i.invariantId),
        notaryDigest: found.notary.receiptDigest,
      };
    },
  }),
  def({
    name: 'get_dispatch_event',
    description: 'Evidence product: streamed algorithmic-dispatch decision with carrier safety state at decision cutoff Tk and SHA-256 hash link.',
    shape: { decisionId: z.string().describe('Decision id, e.g. DISP-EVT-2026-0803') },
    run: async ({ decisionId }) => {
      const found = FIXTURE_DISPATCH_STREAM.find((e) => e.decisionId === decisionId || e.load.loadId === decisionId);
      return found ?? notFound('dispatch_event', decisionId, 'Dispatch events are available at /dispatch-liability.');
    },
  }),
  def({
    name: 'replay_dispatch_liability',
    description: 'Bitemporal defense reconstruction under broker liability (Miller v. C.H. Robinson): proves what the automated dispatch knew at Tk vs subsequent post-accident claims.',
    shape: { decisionId: z.string().describe('Decision id, e.g. DISP-EVT-2026-0803') },
    run: async ({ decisionId }) => {
      if (decisionId === 'DISP-EVT-2026-0803' || decisionId === 'LOD-99203') {
        return DEFENSE_RECONSTRUCTION_CASE_0803;
      }
      const found = FIXTURE_DISPATCH_STREAM.find((e) => e.decisionId === decisionId);
      if (!found) return notFound('dispatch_event', decisionId, 'Dispatch events are available at /dispatch-liability.');
      return {
        decisionId: found.decisionId,
        carrierUsdot: found.carrierSafetySnapshot.usdot,
        carrierName: found.carrierSafetySnapshot.legalName,
        decisionTimestamp: found.decisionTimestamp,
        knowledgeTimeTk: found.knowledgeCutoff,
        stateAtTk: {
          authority: found.carrierSafetySnapshot.operatingAuthorityStatus,
          safetyRating: found.carrierSafetySnapshot.safetyRating,
          vehicleOosRate: found.carrierSafetySnapshot.vehicleOosRate,
          defensible: found.qualificationVerdict.doctrineCompliance === 'DEFENSIBLE_SELECTION',
        },
        evidentiaryFinding: `At knowledge cutoff Tk (${found.knowledgeCutoff}), selection complied with ${found.broker.algorithmPolicyId}.`,
      };
    },
  }),
] as const;

export type McpToolName = (typeof MCP_TOOLS)[number]['name'];

/**
 * The corpus release the object a call names belongs to, where it names one.
 *
 * Every identifier a tool takes was said to be corpus-less except a release,
 * and only one of them is. A ruling carries `Ruling.corpus.releaseId`, the
 * release it was evaluated against. A factoring receipt carries
 * `notary.corpusReleaseId`. A dispatch event carries
 * `rollingAttestation.corpusReleaseId`. Each is a fact on the object rather
 * than a reading of its prefix, so resolving it is a lookup the boundary makes
 * about its own inventory, not a policy guessed from a string.
 *
 * This lives here rather than in the door because the objects live here. The
 * door asks and does not learn where the fixtures are.
 *
 * An object that resolves to nothing names no release rather than a wrong one,
 * and the tool's own not-found answer stands.
 */
export async function releaseOfNamedObject(args: unknown): Promise<string | undefined> {
  if (args === null || typeof args !== 'object') return undefined;
  const named = args as { rulingId?: unknown; receiptId?: unknown; decisionId?: unknown };
  if (typeof named.rulingId === 'string') {
    return (await getCaseSource().getRuling(named.rulingId))?.ruling.corpus.releaseId;
  }
  if (typeof named.receiptId === 'string') {
    const id = named.receiptId;
    return FIXTURE_FACTORING_RECEIPTS.find((r) => r.receiptId === id || r.shipmentId === id)?.notary.corpusReleaseId;
  }
  if (typeof named.decisionId === 'string') {
    const id = named.decisionId;
    return FIXTURE_DISPATCH_STREAM.find((e) => e.decisionId === id || e.load.loadId === id)?.rollingAttestation.corpusReleaseId;
  }
  return undefined;
}

/** Validate arguments against the tool's schema and run it. Throws on malformed arguments only. */
export async function runMcpTool(name: string, args: unknown, scope?: readonly string[]): Promise<unknown> {
  const tool = MCP_TOOLS.find((t) => t.name === name);
  if (!tool) throw new Error(`Unknown tool ${name}. Tools: ${MCP_TOOLS.map((t) => t.name).join(', ')}`);
  const parsed = z.object(tool.shape).parse(args ?? {});
  return (tool.run as (a: unknown, s?: readonly string[]) => Promise<unknown>)(parsed, scope);
}
