import dynamic from 'next/dynamic';

// Heavy chart libraries loaded lazily
export const DynamicChart = dynamic(
  () => import('recharts').then(m => ({ default: m.LineChart })),
  { ssr: false, loading: () => null }
);

// Heavy data table loaded lazily
// Replace the import path once a dedicated data-table component is created
export const DynamicDataTable = dynamic(
  () => import('@/components/ui/table').then(m => ({ default: m.Table })),
  { ssr: false, loading: () => null }
);
