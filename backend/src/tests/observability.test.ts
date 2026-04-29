import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';
import { SLO_CATALOG } from '../lib/slo';
import { ALERT_CATALOG } from '../lib/alerts';
import { registry } from '../lib/metrics';

// Force metric registration by importing slo module
import '../lib/slo';

describe('SLO catalog', () => {
  it('has 11 SLO definitions', () => {
    expect(SLO_CATALOG).toHaveLength(11);
  });

  it('every SLO has required fields', () => {
    for (const slo of SLO_CATALOG) {
      expect(slo.name).toBeTruthy();
      expect(slo.service).toBeTruthy();
      expect(slo.metric).toBeTruthy();
      expect(slo.target).toBeGreaterThan(0);
      expect(['P1', 'P2', 'P3']).toContain(slo.alertSeverity);
      expect(slo.window).toBeTruthy();
    }
  });

  it('contains at least one P1 severity SLO', () => {
    const p1 = SLO_CATALOG.filter(s => s.alertSeverity === 'P1');
    expect(p1.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Alert catalog', () => {
  it('has 12 alert rules', () => {
    expect(ALERT_CATALOG).toHaveLength(12);
  });

  it('every alert has unique ID', () => {
    const ids = ALERT_CATALOG.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every alert has required fields', () => {
    for (const alert of ALERT_CATALOG) {
      expect(alert.id).toMatch(/^ALR-\d{3}$/);
      expect(alert.name).toBeTruthy();
      expect(alert.condition).toBeTruthy();
      expect(['P1', 'P2', 'P3']).toContain(alert.severity);
      expect(alert.runbookUrl).toBeTruthy();
      expect(alert.notifyChannels.length).toBeGreaterThan(0);
    }
  });

  it('P1 alerts include pagerduty channel', () => {
    const p1Alerts = ALERT_CATALOG.filter(a => a.severity === 'P1');
    for (const alert of p1Alerts) {
      expect(alert.notifyChannels).toContain('pagerduty');
    }
  });
});

describe('Agent metrics registration', () => {
  it('ats_agent_runs_total is registered', async () => {
    const metric = await registry.getSingleMetricAsString('ats_agent_runs_total');
    expect(metric).toContain('ats_agent_runs_total');
  });

  it('ats_agent_cost_usd_total is registered', async () => {
    const metric = await registry.getSingleMetricAsString('ats_agent_cost_usd_total');
    expect(metric).toContain('ats_agent_cost_usd_total');
  });

  it('ats_agent_run_duration_seconds is registered', async () => {
    const metric = await registry.getSingleMetricAsString('ats_agent_run_duration_seconds');
    expect(metric).toContain('ats_agent_run_duration_seconds');
  });

  it('ats_agent_tokens_total is registered', async () => {
    const metric = await registry.getSingleMetricAsString('ats_agent_tokens_total');
    expect(metric).toContain('ats_agent_tokens_total');
  });

  it('ats_tenant_daily_cost_usd is registered', async () => {
    const metric = await registry.getSingleMetricAsString('ats_tenant_daily_cost_usd');
    expect(metric).toContain('ats_tenant_daily_cost_usd');
  });
});

describe('GET /api/observability/slos', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/observability/slos');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/observability/alerts', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/observability/alerts');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/observability/agent-costs', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/observability/agent-costs');
    expect(res.status).toBe(401);
  });
});
