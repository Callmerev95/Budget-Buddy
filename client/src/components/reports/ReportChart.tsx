import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { PieChart as PieIcon } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#f43f5e', '#fbbf24', '#3b82f6', '#a855f7', '#ec4899'];

interface ChartItem {
  name: string;
  value: number;
}

interface ReportChartProps {
  chartData: ChartItem[];
  loading: boolean;
}

export const ReportChart = memo(({ chartData, loading }: ReportChartProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-zinc-900/30 border border-white/5 p-8 rounded-[3rem] backdrop-blur-xl shadow-2xl mb-12 overflow-hidden transform-gpu"
  >
    <div className="flex items-center justify-between mb-10">
      <div>
        <h3 className="text-lg font-black tracking-tight text-white">Distribusi Dana</h3>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Berdasarkan Kategori</p>
      </div>
      <div className="p-3 bg-emerald-500/10 rounded-2xl">
        <PieIcon size={20} className="text-emerald-500" strokeWidth={2.5} />
      </div>
    </div>

    <div className="h-[350px] w-full relative transform-gpu">
      {!loading && chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPie>
            <Pie
              data={chartData}
              innerRadius={85}
              outerRadius={120}
              paddingAngle={8}
              dataKey="value"
              stroke="none"
              animationDuration={1000}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(9, 9, 11, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '15px',
                backdropFilter: 'blur(10px)'
              }}
              itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: '900' }}
              // SOLUSI: Gunakan optional parameter 'value?' dan default value
              formatter={(value?: number | string) => {
                if (value === undefined) return ['Rp 0', 'Total'];
                const numValue = typeof value === 'string' ? parseFloat(value) : value;
                return [`Rp ${numValue.toLocaleString('id-ID')}`, 'Total'];
              }}
            />
          </RechartsPie>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-zinc-600 text-[10px] font-black uppercase tracking-widest">
          {loading ? 'Analysing Data...' : 'No Data Detected'}
        </div>
      )}
    </div>

    <div className="grid grid-cols-2 gap-3 mt-8">
      {chartData.map((item, index) => (
        <div key={index} className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 active:scale-95 transition-all">
          <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_inherit]" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black text-zinc-400 uppercase truncate">{item.name}</p>
            <p className="text-[11px] font-bold text-white">Rp {item.value.toLocaleString('id-ID')}</p>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
));