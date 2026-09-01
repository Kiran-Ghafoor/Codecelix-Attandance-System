// ---------------------------------------------------------------------------
// Relation helpers — pure lookups over live API data (batches + internee
// roster). No fabricated values; these only join/map data the backend returns.
// ---------------------------------------------------------------------------

// Maps domainId -> { batch, domain } given the live batch list, so callers can
// resolve an internee's batch code / domain name / team leader from ids.
export function buildDomainIndex(batches) {
  const index = new Map();
  (batches ?? []).forEach((batch) => {
    (batch.domains ?? []).forEach((domain) => index.set(domain.id, { batch, domain }));
  });
  return index;
}

export function getInterneeById(id, list = []) {
  if (!id) return null;
  return list.find((i) => i.id === id) ?? null;
}

// Team leaders are enrolled internees. Resolves a domain's teamLeaderId
// against the live roster.
export function getDomainLeader(teamLeaderId, list = []) {
  if (!teamLeaderId) return null;
  return getInterneeById(teamLeaderId, list);
}
