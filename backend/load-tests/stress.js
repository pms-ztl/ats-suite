import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 VUs
    { duration: '3m', target: 100 }, // Hold at 100 VUs
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // p95 under 1s at load
    http_req_failed: ['rate<0.05'],    // <5% error rate under stress
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

export function setup() {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: 'admin@acme.com',
      password: 'Password123!',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  return { token: res.status === 200 ? JSON.parse(res.body).data?.token : '' };
}

export default function (data) {
  const h = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,
  };

  // Mix of read operations at scale
  const ops = [
    () => http.get(`${BASE_URL}/api/candidates?page=1&pageSize=20`, { headers: h }),
    () => http.get(`${BASE_URL}/api/requisitions`, { headers: h }),
    () => http.get(`${BASE_URL}/api/interviews`, { headers: h }),
    () => http.get(`${BASE_URL}/api/scheduling`, { headers: h }),
    () => http.get(`${BASE_URL}/api/compliance/audit-log?page=1&pageSize=10`, { headers: h }),
    () => http.get(`${BASE_URL}/api/agents/runs?page=1&pageSize=10`, { headers: h }),
  ];

  const op = ops[Math.floor(Math.random() * ops.length)];
  const res = op();
  check(res, { 'status not 5xx': (r) => r.status < 500 });

  sleep(0.5);
}
