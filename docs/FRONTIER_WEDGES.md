# Frontier interface reference

These interfaces expose the declared fixture contracts. Endpoint availability is not evidence of customer adoption, independent verification or live source coverage.

## Endpoints and schemas

- **Disclosure Assurance:**
  - Contract: `src/domain/frontierWedges.ts` (`DisclosureAssurancePack`)
  - Endpoint: `GET /api/v1/frontier/assurance`
  - Workbench: `/frontier` (Tab: 1. Disclosure Assurance)
- **Insurability Dynamics:**
  - Contract: `src/domain/frontierWedges.ts` (`InsurabilityChangeFeedEvent`)
  - Endpoint: `GET /api/v1/frontier/insurability`
  - Workbench: `/frontier` (Tab: 2. Insurability Dynamics)
- **Capex Progress Verification:**
  - Contract: `src/domain/frontierWedges.ts` (`CapexProgressVerification`)
  - Endpoint: `GET /api/v1/frontier/capex-progress`
  - Workbench: `/frontier` (Tab: 3. Capex Progress)
