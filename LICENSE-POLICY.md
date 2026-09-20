# Proposed licensing policy — pending review

This is a proposal for future original first-party PayLoad-OS development.
It is not an adopted license transition or a statement about the repository's
current visibility. The accompanying `LICENSE` is a review draft.

The proposed npm `license: "UNLICENSED"` entry indicates that no general
package license is offered for the proposed proprietary scope; it does not
cancel the component licenses below. The existing `private: true` entry
prevents accidental npm publication, and Rust's `publish = false` prevents
registry publication of that crate. Neither changes GitHub visibility.

## Scope and existing rights

The proposed proprietary scope covers original application, orchestration,
admission, and operational-control code only to the extent the relevant
rights holders authorize those terms. No repository-wide license was found
in the audited base revision
`0e3b15c3ad5ae3ff2478ff0ad027c67227b57d56`. Absence of such a license does not
establish ownership of every contribution or rule out separate agreements.

Earlier permissions and licenses remain available for the versions and
material to which they apply. A future notice must not be applied retroactively
to erase those grants, remove attribution, or override file-specific licenses.
Public visibility and GitHub's platform permissions are separate from a
software license. Restricting future repository access does not retrieve
existing copies or make previously public material confidential.

## Retained component licenses and notices

- `contracts/ConditionalCustodyEscrow.sol` retains its MIT SPDX declaration.
- `examples/gat/ORIGIN.md` retains the complete upstream MIT grant and
  Notation Systems copyright notice, the pinned BIM State Transformer Engine
  source revision, and the exact fixture identities. The imported fixture
  material must not be represented as newly proprietary.
- Cesium 1.124.0 is Apache-2.0 licensed. Its distributed `LICENSE.md`,
  `ThirdParty.json`, and `ThirdParty.extra.json` and applicable asset notices
  must remain with the generated distribution. The existing
  `src/earth/assets.mjs` copier preserves those files. A Cesium code license
  does not grant rights to external imagery, terrain, feeds, or customer data.
- npm and Rust dependencies keep their own terms. The lockfile includes
  optional libvips/Sharp binary packages declaring LGPL-3.0-or-later, some
  combined with Apache-2.0 and MIT; MPL-2.0 packages; and a CC-BY-4.0
  `caniuse-lite` data package. The intended installation and distributed
  artifacts determine which components and obligations apply. These entries
  must not be relabeled as proprietary because the top-level package changes.
- Other independently licensed components include the MCP SDK, Next.js,
  React, PostgreSQL client, Zod, Drizzle, serde, and serde_json. Preserve their
  applicable licenses and notices. Missing lockfile license metadata is not
  proof that a component has no license.

This inventory is a starting point, not a complete distribution bill of
materials. Before distribution, inspect the actual installed packages,
generated Cesium assets, native binaries, copied code, and external data;
retain exact required license texts and attribution, and satisfy any other
applicable conditions.

## Adoption requirements

Before replacing this proposal with effective terms, obtain legal review and
confirmation of the relevant ownership, assignments, contributor agreements,
and previously granted rights. Commit authorship or an automated contributor
name does not establish legal title.

The adopting change must state the covered revision and effective date,
identify the authorized rights holders, and retain historical grants and
third-party exceptions. Package metadata must match the terms actually
adopted. Access controls, publication settings, and any confidential-data
handling are separate actions; this policy does not assert they have changed.
