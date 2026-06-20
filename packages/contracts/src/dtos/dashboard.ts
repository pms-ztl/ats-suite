import { z } from "zod";

// Customizable dashboard contracts. A dashboard document is the persisted
// description of a tenant/user's home: a set of widget instances plus their
// responsive grid placement (react-grid-layout style breakpoints). The shape
// is versioned via schemaVersion so later migrations can be applied safely.

export const DashboardWidgetSchema = z.object({
  // Stable id for this placed instance (a dashboard may hold many widgets of
  // the same type).
  instanceId: z.string().min(1).max(64),
  // Widget kind key (resolves to a registered widget renderer + data source).
  type: z.string().min(1).max(120),
  title: z.string().max(200).optional(),
  // Key naming the server-side data source that feeds this widget.
  dataSourceKey: z.string().min(1).max(120),
  // Visualization variant for the renderer (e.g. "bar", "line", "kpi", "table").
  viz: z.string().max(60).optional(),
  // Free-form, widget-specific configuration (thresholds, filters, columns).
  config: z.record(z.string(), z.unknown()).optional(),
  // Minimum grid footprint, in grid units, the widget needs to render.
  minW: z.number().int().positive().optional(),
  minH: z.number().int().positive().optional(),
});
export type DashboardWidget = z.infer<typeof DashboardWidgetSchema>;

// A single widget's position/size on the grid for one breakpoint.
export const GridLayoutItemSchema = z.object({
  i: z.string().min(1).max(64),
  x: z.number().int().nonnegative(),
  y: z.number().int().nonnegative(),
  w: z.number().int().positive(),
  h: z.number().int().positive(),
});
export type GridLayoutItem = z.infer<typeof GridLayoutItemSchema>;

// Responsive layouts keyed by breakpoint, matching react-grid-layout.
export const DashboardLayoutsSchema = z.object({
  lg: z.array(GridLayoutItemSchema),
  md: z.array(GridLayoutItemSchema),
  sm: z.array(GridLayoutItemSchema),
  xs: z.array(GridLayoutItemSchema),
  xxs: z.array(GridLayoutItemSchema),
});
export type DashboardLayouts = z.infer<typeof DashboardLayoutsSchema>;

export const DashboardDocumentSchema = z.object({
  schemaVersion: z.number().int().positive(),
  // Filters applied across every widget (e.g. date range, requisition).
  globalFilters: z.record(z.string(), z.unknown()).default({}),
  widgets: z.array(DashboardWidgetSchema),
  layouts: DashboardLayoutsSchema,
});
export type DashboardDocument = z.infer<typeof DashboardDocumentSchema>;
