/** Impact bullets for portfolio case metadata; trend drives pixel-arrow direction. */

export type ImpactTrend = 'up' | 'down';

export interface PortfolioImpactMetric {
	text: string;
	trend: ImpactTrend;
}

export type PortfolioMetricInput = string | PortfolioImpactMetric;

export function normalizePortfolioMetrics(
	raw: PortfolioMetricInput[] | undefined | null
): PortfolioImpactMetric[] {
	if (!raw?.length) return [];
	return raw.map((m) => {
		if (typeof m === 'string') return { text: m, trend: inferImpactTrendFromText(m) };
		return { text: m.text, trend: m.trend };
	});
}

/** Fallback when encrypted/legacy payloads only store plain strings. */
function inferImpactTrendFromText(text: string): ImpactTrend {
	const t = text.toLowerCase();
	if (
		/\b(stayed\s+undefined|were\s+undefined|not\s+well\s+defined|metrics?\s+were\s+not|kpi[^\n]{0,24}undefined)\b/.test(
			t
		)
	) {
		return 'down';
	}
	if (
		/\b(decline(d|ing)?|decrease(d)?|lost|fewer\s|drop(ped)?|blocked|cancellation|latency\s+rose|slowed\b|regression)\b/.test(
			t
		)
	) {
		return 'down';
	}
	return 'up';
}
