module.exports = function (data) {
  const sources = Array.isArray(data.sources) ? data.sources : [];
  const state = data.state || {};
  const stats = data.stats || null;

  const statSources = stats?.sources || {};

  const merged = sources.map((s) => {
    const id = s.id;
    const st = state[id] || {};
    const ss = statSources[id] || {};

    const isFailing = ss.ok === false || (st.consecutiveFailures || 0) > 0;
    const statusCode = ss.status ?? st.lastStatus ?? null;

    return {
      id,
      name: s.name,
      enabled: s.enabled !== false,
      feedUrl: s.feedUrl,
      siteUrl: s.siteUrl || null,
      category: s.defaultCategory || "world",
      language: s.language || "en",
      country: s.country || null,
      lastFetchAt: st.lastFetchAt || null,
      lastSuccessAt: st.lastSuccessAt || null,
      consecutiveFailures: st.consecutiveFailures || 0,
      lastStatus: st.lastStatus || null,
      lastError: st.lastError || null,
      run: {
        ok: ss.ok ?? null,
        status: ss.status ?? null,
        error: ss.error ?? null,
        fetchedAt: ss.fetchedAt ?? null,
        parsedItems: ss.parsedItems ?? null,
        added: ss.added ?? null,
        duplicates: ss.duplicates ?? null,
        skipped: ss.skipped ?? null,
      },
      isFailing,
      statusCode,
    };
  });

  merged.sort((a, b) => {
    if (a.isFailing !== b.isFailing) return a.isFailing ? -1 : 1;
    const aName = String(a.name || "");
    const bName = String(b.name || "");
    return aName.localeCompare(bName);
  });

  return merged;
};

