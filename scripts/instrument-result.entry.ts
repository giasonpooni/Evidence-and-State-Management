import { readFileSync } from 'node:fs';
import { inspectInstrumentResult, type InstrumentReviewContext } from '../src/data-os/instrument-result';
import type { InstrumentRuntime } from '../src/data-os/instrument-result-verifier';

try {
  const args = process.argv.slice(2);
  const values = new Map<string, string>();
  if (args.length !== 8) throw new Error('Expected --bundle PATH --context PATH --runtime PATH --at ISO_INSTANT.');
  for (let index = 0; index < args.length; index += 2) {
    if (!['--bundle', '--context', '--runtime', '--at'].includes(args[index]) || values.has(args[index]) || !args[index + 1]) {
      throw new Error('Invalid or repeated argument.');
    }
    values.set(args[index], args[index + 1]);
  }
  const inspection = inspectInstrumentResult(
    readFileSync(values.get('--bundle')!),
    JSON.parse(readFileSync(values.get('--context')!, 'utf8')) as InstrumentReviewContext,
    JSON.parse(readFileSync(values.get('--runtime')!, 'utf8')) as InstrumentRuntime,
    values.get('--at')!,
  );
  process.stdout.write(`${JSON.stringify(inspection, null, 2)}\n`);
  process.exitCode = inspection.state === 'ELIGIBLE_FOR_CANDIDATE_REVIEW' ? 0 : 2;
} catch {
  process.stderr.write('Instrument inspection input is invalid or unavailable. No evidence or canonical state was written.\n');
  process.exitCode = 1;
}
