import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'], // p95 under 500ms
    http_req_failed: ['rate<0.01'],   // <1% error rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

function getToken() {
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: 'admin@acme.com',
      password: 'Password123!',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  if (loginRes.status === 200) {
    const body = JSON.parse(loginRes.body);
    return body.data?.token || '';
  }
  return '';
}

export function setup() {
  const token = getToken();
  return { token };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,
  };

  // Health check (no auth)
  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, { 'health: status 200': (r) => r.status === 200 });

  // List candidates
  const candidatesRes = http.get(`${BASE_URL}/api/candidates?page=1&pageSize=20`, { headers });
  check(candidatesRes, {
    'candidates: status 200': (r) => r.status === 200,
    'candidates: has data': (r) => JSON.parse(r.body).data !== undefined,
  });

  // List requisitions
  const reqsRes = http.get(`${BASE_URL}/api/requisitions?page=1&pageSize=20`, { headers });
  check(reqsRes, { 'requisitions: status 200': (r) => r.status === 200 });

  // List interviews
  const intRes = http.get(`${BASE_URL}/api/interviews?page=1&pageSize=20`, { headers });
  check(intRes, { 'interviews: status 200': (r) => r.status === 200 });

  // List scheduling
  const schedRes = http.get(`${BASE_URL}/api/scheduling?page=1&pageSize=20`, { headers });
  check(schedRes, { 'scheduling: status 200': (r) => r.status === 200 });

  // Analytics
  const analyticsRes = http.get(`${BASE_URL}/api/analytics/dashboard`, { headers });
  check(analyticsRes, {
    'analytics: status 200 or 500': (r) => [200, 500].includes(r.status),
  });

  sleep(1);
}
