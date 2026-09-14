/**
 * The governed surface, against the committed demonstration corpus.
 *
 * `./tools.test.ts` proves the tools answer. This proves the door: the same
 * tool answers one session and refuses another, the corpus a call is about is
 * resolved from what the call names, and both outcomes carry a receipt.
 */
import { describe, expect, it } from 'vitest';
import { corporaOfCall, corpusOfCall, serveCapabilityCall, serveToolCall } from './serve';
import { admitCapability, type TerminalSession } from '@/domain/terminalPlane';

const AT = '2026-09-12T10:00:00.000Z';

const session = (over: Partial<TerminalSession> = {}): TerminalSession => ({
  sessionId: 'TS-1',
  terminalId: 'terminal:acme-risk',
  terminalClass: 'CUSTOMER',
  purpose: 'customer_delivery',
  corpusScope: ['caravan.specialty-cargo'],
  openedAt: '2026-09-12T09:00:00.000Z',
  expiresAt: '2026-09-12T17:00:00.000Z',
  ...over,
});

describe('a call is about the corpus it names', () => {
  it('takes the corpus argument where the tool has one', async () => {
    expect(await corpusOfCall({ corpus: 'tradewind.freight' })).toBe('tradewind.freight');
  });

  /* A release identifier does carry a corpus, through the source's own inventory. */
  it('resolves the corpus of a named release from the source', async () => {
    expect(await corpusOfCall({ releaseId: 'REL-CAR-2026.09.01' })).toBe('caravan.specialty-cargo');
    expect(await corpusOfCall({ releaseId: 'nope' })).toBeUndefined();
  });

  /* A ruling names the corpus release it was evaluated against, so it does. */
  it('resolves the corpus of a named ruling through the release it was evaluated against', async () => {
    expect(await corpusOfCall({ rulingId: 'RUL-7C104-r2' })).toBe('caravan.specialty-cargo');
    expect(await corpusOfCall({ rulingId: 'nope' })).toBeUndefined();
  });

  /*
   * So does a factoring receipt, through `notary.corpusReleaseId`, and a
   * dispatch event, through `rollingAttestation.corpusReleaseId`. Every
   * identifier these tools take carries a corpus; none of them is read out of
   * a prefix.
   */
  it('resolves the corpus of a receipt and of a dispatch event from the object', async () => {
    expect(await corpusOfCall({ receiptId: 'RCP-FACT-2026-0901' })).toBe('caravan.specialty-cargo');
    expect(await corpusOfCall({ decisionId: 'DISP-EVT-2026-0803' })).toBe('caravan.specialty-cargo');
    /* A dispatch event is reachable by its load id as well as its decision id. */
    expect(await corpusOfCall({ decisionId: 'LOD-99203' })).toBe('caravan.specialty-cargo');
  });

  /* Naming no object is not the same as naming any corpus. */
  it('is undefined when the call names no object at all', async () => {
    expect(await corpusOfCall({ receiptId: 'nope' })).toBeUndefined();
    expect(await corpusOfCall({ decisionId: 'nope' })).toBeUndefined();
    expect(await corpusOfCall({})).toBeUndefined();
    expect(await corpusOfCall(undefined)).toBeUndefined();
  });
});

describe('the same tool answers one session and refuses another', () => {
  it('answers a customer asking for records of the corpus its session named', async () => {
    const served = await serveToolCall(session(), 'list_records', { releaseId: 'REL-CAR-2026.09.01' }, AT);
    expect(served.admission.admitted).toBe(true);
    expect(served.refusal).toBeUndefined();
    expect(served.result).toBeDefined();
    expect(served.receipt).toMatchObject({
      terminalId: 'terminal:acme-risk', purpose: 'customer_delivery', tool: 'list_records',
      corpus: 'caravan.specialty-cargo', servedAt: AT, decision: 'ADMITTED',
    });
  });

  it('refuses the same call from a session scoped to another corpus, and serves nothing', async () => {
    const served = await serveToolCall(session({ corpusScope: ['tradewind.freight'] }), 'list_records', { releaseId: 'REL-CAR-2026.09.01' }, AT);
    expect(served.admission.admitted).toBe(false);
    expect(served.result).toBeUndefined();
    expect(served.refusal).toMatchObject({ code: 'CORPUS_OUTSIDE_SCOPE' });
    expect(served.refusal?.remedy).toContain('not widened');
    expect(served.receipt.decision).toBe('REFUSED');
  });

  /* Aggregation gets the release metadata and not the rows behind it. */
  it('refuses the rows to an aggregation session and answers its metadata call', async () => {
    const aggregating = session({ terminalClass: 'FIRM_INTERNAL', purpose: 'aggregation', corpusScope: ['caravan.specialty-cargo'] });
    const rows = await serveToolCall(aggregating, 'list_records', { releaseId: 'REL-CAR-2026.09.01' }, AT);
    expect(rows.refusal?.code).toBe('PURPOSE_DOES_NOT_ADMIT_THIS');
    expect(rows.result).toBeUndefined();
    const metadata = await serveToolCall(aggregating, 'list_releases', { corpus: 'caravan.specialty-cargo' }, AT);
    expect(metadata.admission.admitted).toBe(true);
  });

  it('refuses a session that could not be opened, whatever it asks', async () => {
    const served = await serveToolCall(session({ terminalClass: 'FIRM_INTERNAL', purpose: 'model_training', corpusScope: ['caravan.specialty-cargo'] }), 'list_releases', {}, AT);
    expect(served.refusal?.code).toBe('PURPOSE_NOT_DECLARABLE_AT_ALL');
    expect(served.result).toBeUndefined();
  });

  it('refuses an unknown tool as an answer rather than a throw', async () => {
    const served = await serveToolCall(session(), 'drop_corpus', {}, AT);
    expect(served.refusal?.code).toBe('TOOL_UNKNOWN');
    expect(served.refusal?.remedy).toContain('list_releases');
  });

  /*
   * A mistyped instant is a tool error, not a refusal: telling a caller its
   * purpose does not admit the tool, when the real fault is its argument,
   * sends it to fix the wrong thing.
   */
  it('keeps malformed arguments a tool error, before the admission decision', async () => {
    await expect(serveToolCall(session(), 'query_as_of', { releaseId: 'REL-CAR-2026.09.01', subject: 's', predicate: 'p', validAt: 'yesterday', knownAt: 'now', question: 'WHAT_WE_HELD' }, AT))
      .rejects.toThrow(/ISO 8601/);
  });

  it('carries the receipt on the refusal as well as on the answer', async () => {
    const refused = await serveToolCall(session({ expiresAt: '2026-09-12T09:30:00.000Z' }), 'list_releases', {}, AT);
    expect(refused.receipt).toMatchObject({ decision: 'REFUSED', refusal: 'SESSION_EXPIRED', tool: 'list_releases', servedAt: AT });
    expect(refused.receipt.terminalClass).toBe('CUSTOMER');
  });
});

describe('a terminal asks for a capability, and an operate comes back as a proposal', () => {
  it('answers a read capability through the tool that reaches it', async () => {
    const served = await serveCapabilityCall(session(), 'corpus.list-records', { releaseId: 'REL-CAR-2026.09.01' }, AT);
    expect(served.admission.outcome).toBe('ADMITTED');
    expect(served.result).toBeDefined();
    expect(served.receipt.capability).toBe('corpus.list-records');
  });

  it('refuses a capability nothing describes, rather than guessing at one', async () => {
    const served = await serveCapabilityCall(session(), 'corpus.drop-everything', {}, AT);
    expect(served.refusal?.code).toBe('CAPABILITY_UNKNOWN');
    expect(served.result).toBeUndefined();
  });

  it('refuses a described capability the session is not scoped for', async () => {
    const served = await serveCapabilityCall(session({ corpusScope: ['tradewind.freight'] }), 'corpus.list-records', { releaseId: 'REL-CAR-2026.09.01' }, AT);
    expect(served.refusal?.code).toBe('CORPUS_OUTSIDE_SCOPE');
  });

  /*
   * The registry describes only reads today, so this exercises the operate
   * path with a capability of its own rather than one of the twelve. What it
   * proves is that the plane routes by kind: nothing is dispatched, and the
   * ask comes back as the proposal it became, saying what it waits on.
   */
  it('dispatches nothing for an operate, and hands back what the ask waits on', async () => {
    const asked = admitCapability(session(), {
      id: 'discovery.run-workload',
      title: 'Run one mining workload over a set of corpus records',
      kind: 'OPERATE',
      subsystem: 'Discovery',
      module: 'src/discovery/engine.ts',
      entryPoint: 'runMiningWorkload',
      reachableToday: 'not reachable',
      gatedBy: 'nothing',
      sideEffects: ['Writes a workload run and its derived artifacts with their lineage.'],
      authorityNeeded: 'A digest-bound execution authorization.',
      touchesEstates: false,
    }, AT, 'caravan.specialty-cargo');
    expect(asked.outcome).toBe('PROPOSAL_REQUIRED');
    expect(asked.proposal?.counterparty).toBe('terminal:acme-risk');
    expect(asked.proposal?.underPurpose).toBe('customer_delivery');
    expect(asked.proposal?.blockedBy).toContain('no release has been admitted');
  });
});

/**
 * Two authorization bypasses, found by an independent review of this surface
 * and reproduced before they were closed. Both were reachable in one argument,
 * which is why they are regression tests and not comments.
 */
describe('a caller cannot argue its way past the boundary', () => {
  const landshark = session({ terminalId: 'terminal:landshark-only', corpusScope: ['landshark.parcels'] });
  const anonymous = session({ terminalId: 'terminal:anon', terminalClass: 'PUBLIC', purpose: 'redistribution' });

  /*
   * The scope check read the caller's `corpus` argument in preference to the
   * corpus of the release it also named, so a session could be judged against
   * one corpus and served another. `list_records` does not even declare a
   * `corpus` parameter; the extra key rode through because the check read the
   * raw arguments rather than the parsed ones.
   */
  it('refuses an out-of-scope release named beside an in-scope corpus', async () => {
    const honest = await serveToolCall(landshark, 'list_records', { releaseId: 'REL-CAR-2026.09.01' }, AT);
    expect(honest.refusal?.code).toBe('CORPUS_OUTSIDE_SCOPE');

    const masked = await serveToolCall(landshark, 'list_records', { releaseId: 'REL-CAR-2026.09.01', corpus: 'landshark.parcels' }, AT);
    expect(masked.refusal?.code).toBe('CORPUS_OUTSIDE_SCOPE');
    expect(masked.result).toBeUndefined();
    expect(masked.admission.because).toContain('caravan.specialty-cargo');
  });

  it('names every corpus a call names, with the release’s own first', async () => {
    expect(await corporaOfCall({ releaseId: 'REL-CAR-2026.09.01', corpus: 'landshark.parcels' }))
      .toEqual(['caravan.specialty-cargo', 'landshark.parcels']);
    expect(await corpusOfCall({ releaseId: 'REL-CAR-2026.09.01', corpus: 'landshark.parcels' })).toBe('caravan.specialty-cargo');
    /* A release that resolves to nothing contributes nothing rather than a guess. */
    expect(await corporaOfCall({ releaseId: 'nope' })).toEqual([]);
  });

  /*
   * The projection was the caller's to choose, so a public terminal could ask
   * for the counterparty view of a ruling and be given it — private detail and
   * all. Omitting the argument was the same bypass by another route, because
   * the surface's own default was the wider one.
   */
  it('serves a public terminal the public projection, asked for or not', async () => {
    for (const args of [{ rulingId: 'RUL-7C104-r2', projection: 'COUNTERPARTY_SHARED' }, { rulingId: 'RUL-7C104-r2' }]) {
      const served = await serveToolCall(anonymous, 'get_ruling', args, AT);
      expect(JSON.stringify(served.result), JSON.stringify(args)).toContain('not_visible');
      expect(JSON.stringify(served.result)).not.toContain('COUNTERPARTY_SHARED');
    }
  });

  /* And a customer still receives the counterparty projection its class may have. */
  it('leaves the counterparty projection to the classes that may receive it', async () => {
    const served = await serveToolCall(session(), 'get_ruling', { rulingId: 'RUL-7C104-r2' }, AT);
    expect(JSON.stringify(served.result)).toContain('COUNTERPARTY_SHARED');
  });
});

/**
 * A third bypass of the same shape, found by auditing the two above: the scope
 * check only ever ran on what a call named, so a call that named no corpus was
 * treated as naming none when it was in fact about all of them.
 *
 * `list_releases` with its argument omitted served the release history of
 * every corpus; `list_retractions`, which declares no corpus argument at all,
 * served every corpus's corrections and recalls; and `get_ruling` served the
 * rulings of a corpus the session had no standing in, on the stated but
 * mistaken ground that a ruling carries no corpus.
 *
 * The first two are bounded rather than refused, as the projection is: a
 * customer scoped to one corpus asking what releases there are is asking a
 * reasonable question, and the useful answer is its own. The third is refused,
 * because a ruling names exactly one corpus and it is not this session's.
 */
describe('a corpus-spanning read is bounded by the scope, not widened by silence', () => {
  const caravanOnly = session();
  const tradewindOnly = session({ terminalId: 'terminal:tw', corpusScope: ['tradewind.freight-rates'] });

  const releaseIds = (served: { result?: unknown }) =>
    ((served.result as { releases: { releaseId: string }[] }).releases).map((r) => r.releaseId);

  it('serves a one-corpus session only its own releases when no corpus is named', async () => {
    const served = await serveToolCall(caravanOnly, 'list_releases', {}, AT);
    expect(served.admission.admitted).toBe(true);
    expect(releaseIds(served)).toEqual(['REL-CAR-2026.09.01', 'REL-CAR-2026.08.25', 'REL-CAR-2026.08.11']);
    expect(releaseIds(served).some((id) => id.startsWith('REL-TW') || id.startsWith('REL-LS'))).toBe(false);
  });

  /* A scope of two corpora is two corpora, still ordered by knowledge time. */
  it('serves every corpus a session named, and no others', async () => {
    const both = session({ corpusScope: ['caravan.specialty-cargo', 'tradewind.freight-rates'] });
    const served = await serveToolCall(both, 'list_releases', {}, AT);
    expect(releaseIds(served)).toEqual([
      'REL-TW-2026.09.01', 'REL-CAR-2026.09.01', 'REL-CAR-2026.08.25', 'REL-TW-2026.08.20', 'REL-CAR-2026.08.11',
    ]);
  });

  /* A named corpus was already checked at the door, so it is served as asked. */
  it('leaves a named corpus alone', async () => {
    const served = await serveToolCall(caravanOnly, 'list_releases', { corpus: 'caravan.specialty-cargo' }, AT);
    expect(releaseIds(served)).toEqual(['REL-CAR-2026.09.01', 'REL-CAR-2026.08.25', 'REL-CAR-2026.08.11']);
  });

  it('bounds the retractions to the scope, though the tool has no corpus argument', async () => {
    const served = await serveToolCall(tradewindOnly, 'list_retractions', {}, AT);
    const body = served.result as { count: number; retractions: { releaseId: string }[] };
    expect(body.retractions.map((r) => r.releaseId)).toEqual(['REL-TW-2026.08.20']);
    expect(body.count).toBe(1);
  });

  it('refuses a ruling of a corpus the session never named, and serves nothing', async () => {
    const served = await serveToolCall(tradewindOnly, 'get_ruling', { rulingId: 'RUL-7C104-r2' }, AT);
    expect(served.refusal?.code).toBe('CORPUS_OUTSIDE_SCOPE');
    expect(served.result).toBeUndefined();
    /* The receipt names the corpus that was asked about, rather than nothing. */
    expect(served.receipt.corpus).toBe('caravan.specialty-cargo');
  });

  it('refuses the ruling manifest by the same route', async () => {
    const served = await serveToolCall(tradewindOnly, 'get_ruling_manifest', { rulingId: 'RUL-7C104-r2' }, AT);
    expect(served.refusal?.code).toBe('CORPUS_OUTSIDE_SCOPE');
    expect(served.result).toBeUndefined();
  });

  /*
   * The receipts and the events were the other half of the same mistaken
   * ground: both carry the corpus release they were drawn from, so both are
   * refused to a session that never named that corpus.
   */
  it('refuses a factoring receipt and its verification across the scope', async () => {
    for (const tool of ['get_factoring_receipt', 'verify_factoring_receipt']) {
      const served = await serveToolCall(tradewindOnly, tool, { receiptId: 'RCP-FACT-2026-0901' }, AT);
      expect(served.refusal?.code, tool).toBe('CORPUS_OUTSIDE_SCOPE');
      expect(served.result, tool).toBeUndefined();
    }
  });

  it('refuses a dispatch event and its replay across the scope', async () => {
    for (const tool of ['get_dispatch_event', 'replay_dispatch_liability']) {
      const served = await serveToolCall(tradewindOnly, tool, { decisionId: 'DISP-EVT-2026-0803' }, AT);
      expect(served.refusal?.code, tool).toBe('CORPUS_OUTSIDE_SCOPE');
      expect(served.result, tool).toBeUndefined();
    }
  });

  /* The load id reaches the same event, so it is refused by the same route. */
  it('refuses the replay reached by load id as well as by decision id', async () => {
    const served = await serveToolCall(tradewindOnly, 'replay_dispatch_liability', { decisionId: 'LOD-99203' }, AT);
    expect(served.refusal?.code).toBe('CORPUS_OUTSIDE_SCOPE');
    expect(served.result).toBeUndefined();
  });

  it('still answers the receipts and the events of the corpus the session did name', async () => {
    const receipt = await serveToolCall(caravanOnly, 'get_factoring_receipt', { receiptId: 'RCP-FACT-2026-0901' }, AT);
    expect(receipt.admission.admitted).toBe(true);
    expect(receipt.receipt.corpus).toBe('caravan.specialty-cargo');
    const event = await serveToolCall(caravanOnly, 'replay_dispatch_liability', { decisionId: 'LOD-99203' }, AT);
    expect(event.admission.admitted).toBe(true);
    expect(event.result).toBeDefined();
  });

  it('still answers a ruling of the corpus the session did name', async () => {
    const served = await serveToolCall(caravanOnly, 'get_ruling', { rulingId: 'RUL-7C104-r2' }, AT);
    expect(served.admission.admitted).toBe(true);
    expect(served.receipt.corpus).toBe('caravan.specialty-cargo');
  });

  /*
   * The narrowing belongs to the governed door. The unauthenticated feed has
   * no session and therefore no scope, and is unchanged by this: bounding it
   * here would be inventing an authorization the transport does not carry.
   */
  it('leaves the unscoped feed exactly as it was', async () => {
    const { releasesPayload, retractionsPayload } = await import('@/adapter/feed');
    expect((await releasesPayload() as { count: number }).count).toBe(7);
    expect((await retractionsPayload(undefined, 'COUNTERPARTY_SHARED') as { count: number }).count).toBe(4);
  });
});
