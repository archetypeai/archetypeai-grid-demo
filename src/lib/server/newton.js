import { ATAI_API_KEY, ATAI_API_ENDPOINT } from '$env/static/private';

const API_VERSION = 'v0.5';
// C 2.6 fusion checkpoint, per the atai-newton-fusion-model skill.
const MODEL = 'Newton::c2_6_8b_fp8_260424d7a55d5e';

const INSTRUCTION_PROMPT =
	'You are an energy grid analyst AI monitoring the California Independent System Operator (CAISO) power grid in real-time. ' +
	'You help users understand grid conditions, generation mix, demand patterns, and renewable energy performance. ' +
	'Key concepts: the "duck curve" (midday solar surplus followed by evening ramp), renewable curtailment, ' +
	'net demand (demand minus renewables), grid stress during peak hours (typically 4-9 PM), and battery dispatch patterns. ' +
	'California targets 100% clean energy by 2045. CAISO manages ~80% of California\'s electric flow. ' +
	'All values are in megawatts (MW). Data is 5-minute intervals from CAISO Today\'s Outlook.';

export async function queryNewton(query) {
	const url = `${ATAI_API_ENDPOINT.replace(/\/$/, '')}/${API_VERSION}/query`;

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 120000);

	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${ATAI_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				// The system turn goes in `instruction_prompt`. C 2.6 honors only this
				// field; the legacy `system_prompt` is inert on this checkpoint, so we
				// don't send it (per the atai-newton-fusion-model skill).
				query,
				instruction_prompt: INSTRUCTION_PROMPT,
				file_ids: [],
				model: MODEL,
				// Grid analyses (duck-curve, ramp, risk) run long; 1024 truncated them.
				max_new_tokens: 3072
			}),
			signal: controller.signal
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw new Error(`Newton query failed: ${res.status} - ${JSON.stringify(err)}`);
		}

		const data = await res.json();

		if (data?.response?.response) {
			const r = data.response.response;
			if (Array.isArray(r)) return r[0];
			if (typeof r === 'string') return r;
		}
		if (Array.isArray(data?.response)) return data.response[0];
		if (typeof data?.response === 'string') return data.response;
		if (typeof data?.text === 'string') return data.text;

		return JSON.stringify(data);
	} finally {
		clearTimeout(timeoutId);
	}
}
