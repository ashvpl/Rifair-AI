'use client';

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Area, CartesianGrid, Line, XAxis, YAxis, ComposedChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface BiasDataPoint {
  date: string;
  score: number;
}

export interface BiasTrendChartProps {
  data?: BiasDataPoint[];
  className?: string;
}

const defaultData: BiasDataPoint[] = [
  { date: 'Mon', score: 65 },
  { date: 'Tue', score: 48 },
  { date: 'Wed', score: 72 },
  { date: 'Thu', score: 30 },
  { date: 'Fri', score: 55 },
  { date: 'Sat', score: 40 },
  { date: 'Sun', score: 60 },
];

const chartConfig = {
  score: {
    label: 'Bias Score',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function BiasTrendChart({ data = defaultData, className }: BiasTrendChartProps) {
  return (
    <div className={cn('w-full h-full min-h-[300px]', className)}>
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ComposedChart
            data={data}
            margin={{
              top: 20,
              right: 20,
              left: 0,
              bottom: 20,
            }}
          >
            <defs>
              <linearGradient id="biasGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#000000"
              strokeOpacity={0.04}
              horizontal={true}
              vertical={false}
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#86868B', fontWeight: 600 }}
              tickMargin={12}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#86868B', fontWeight: 600 }}
              domain={[0, 100]}
              tickCount={6}
              tickMargin={12}
            />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="rounded-xl bg-white border border-black/5 shadow-xl font-bold text-[#1D1D1F]"
                  indicator="dot"
                  nameKey="score"
                />
              }
              cursor={{
                stroke: '#10b981',
                strokeWidth: 1,
                strokeDasharray: '4 4',
              }}
            />

            <Area
              type="monotone"
              dataKey="score"
              stroke="transparent"
              fill="url(#biasGradient)"
              strokeWidth={0}
              tooltipType="none"
              activeDot={false}
            />

            <Line
              type="monotone"
              dataKey="score"
              name="Bias Score"
              stroke="#059669"
              strokeWidth={4}
              dot={{
                fill: '#059669',
                strokeWidth: 0,
                r: 4,
              }}
              activeDot={{
                r: 7,
                fill: '#059669',
                stroke: '#ffffff',
                strokeWidth: 2,
              }}
              animationDuration={1500}
            />
          </ComposedChart>
        </ChartContainer>
    </div>
  );
}
