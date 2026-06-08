import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-lg shadow-lg text-left text-xs font-semibold">
        <p className="font-bold text-gray-300">{label}</p>
        {payload.map((pld, idx) => (
          <p key={idx} style={{ color: pld.color }} className="mt-1">
            {pld.name}: {pld.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsChart = ({
  data = [],
  type = 'line',
  dataKey,
  xKey = 'date',
  title,
  color = '#0ea5e9', // Primary-500
  height = 300,
}) => {
  return (
    <div className="space-y-4">
      {title && <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide text-left">{title}</h3>}
      
      <div style={{ width: '100%', height }} className="min-h-[250px]">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center border border-dashed border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-400">
            No data records available for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === 'line' ? (
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey={xKey}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dx={-5}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 1.5, fill: '#fff' }}
                  activeDot={{ r: 6 }}
                  name={title || dataKey}
                />
              </LineChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey={xKey}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dx={-5}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey={dataKey}
                  fill={color}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={45}
                  name={title || dataKey}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AnalyticsChart;
