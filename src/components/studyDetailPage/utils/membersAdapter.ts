export type AnyRecord = Record<string, any>;

// Normalize MEMBERS props from API to UI-friendly shape
export function normalizeMembersPropsForUI(apiProps: AnyRecord): AnyRecord {
  if (!apiProps || typeof apiProps !== 'object') return apiProps;
  const props = { ...apiProps };

  // Clone stats
  const stats = { ...(props.stats || {}) } as AnyRecord;
  const customStats: Array<AnyRecord> = Array.isArray(stats.customStats) ? [...stats.customStats] : [];

  // Extract popular algorithms from customStats
  let popularAlgorithms: string[] | undefined = stats.popularAlgorithms;
  if (!popularAlgorithms && customStats.length > 0) {
    const idx = customStats.findIndex(
      (s) => typeof s?.label === 'string' && s.label.includes('인기 알고리즘')
    );
    if (idx >= 0) {
      const value = customStats[idx]?.value ?? '';
      popularAlgorithms = String(value)
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
      // Remove the original row to avoid double rendering
      customStats.splice(idx, 1);
    }
  }

  // Reassign stats
  props.stats = {
    ...stats,
    customStats,
    ...(popularAlgorithms ? { popularAlgorithms } : {}),
  };

  // Infer weeklyMvp if missing
  if (!props.weeklyMvp && Array.isArray(props.members)) {
    const mvp = props.members.find(
      (m: AnyRecord) => Array.isArray(m?.badges) && m.badges.some((b: AnyRecord) => b?.type === 'mvp')
    );
    if (mvp && mvp.name) props.weeklyMvp = mvp.name;
  }

  // Normalize member derived fields (streak/solvedProblems)
  if (Array.isArray(props.members)) {
    props.members = props.members.map((m: AnyRecord) => {
      const member = { ...m };
      const fields: Array<AnyRecord> = Array.isArray(member.customFields) ? member.customFields : [];

      // streak
      if (typeof member.streak !== 'number') {
        const streakRow = fields.find((f) => typeof f?.label === 'string' && f.label.includes('연속 참여'));
        if (streakRow && streakRow.value) {
          const match = String(streakRow.value).match(/(\d+)/);
          member.streak = match ? Number(match[1]) : undefined;
        }
      }

      // solvedProblems
      if (typeof member.solvedProblems !== 'number') {
        const solvedRow = fields.find((f) => typeof f?.label === 'string' && f.label.includes('해결한 문제'));
        if (solvedRow && solvedRow.value) {
          const n = Number(String(solvedRow.value).replace(/[^\d]/g, ''));
          if (!Number.isNaN(n)) member.solvedProblems = n;
        }
      }

      return member;
    });
  }

  return props;
}

// Serialize UI-friendly shape back to API props (to keep backward compatibility)
export function serializeMembersPropsForAPI(uiProps: AnyRecord): AnyRecord {
  if (!uiProps || typeof uiProps !== 'object') return uiProps;
  const props = { ...uiProps };

  const stats = { ...(props.stats || {}) } as AnyRecord;
  const customStats: Array<AnyRecord> = Array.isArray(stats.customStats) ? [...stats.customStats] : [];

  // If popularAlgorithms array is present, sync it to a customStats row labeled "인기 알고리즘"
  if (Array.isArray(stats.popularAlgorithms)) {
    // Remove old row if exists
    const filtered = customStats.filter((s) => !(typeof s?.label === 'string' && s.label.includes('인기 알고리즘')));
    filtered.push({ label: '인기 알고리즘', value: stats.popularAlgorithms.join(', '), icon: '🏆' });
    stats.customStats = filtered;
  }

  // Keep numeric fields as-is (formatting is a view concern)
  props.stats = stats;

  // weeklyMvp remains as-is (optional)
  return props;
}
