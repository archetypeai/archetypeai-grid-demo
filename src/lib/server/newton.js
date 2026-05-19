import { ATAI_API_KEY, ATAI_API_ENDPOINT } from '$env/static/private';

const API_VERSION = 'v0.5';
const MODEL = 'Newton::c2_5_8b_260413b723a9ab';

const SYSTEM_PROMPT =
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
				query,
				system_prompt: SYSTEM_PROMPT,
				instruction_prompt: SYSTEM_PROMPT,
				file_ids: [],
				model: MODEL,
				max_new_tokens: 1024,
				sanitize: false
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
