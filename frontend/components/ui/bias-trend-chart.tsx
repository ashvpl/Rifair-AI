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
  const [period] = useState('7D');

  const avgScore = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length) : 0;
  const lastScore = data[data.length - 1]?.score || 0;
  const prevScore = data[data.length - 2]?.score || 0;
  const change = lastScore - prevScore;
  const changePercent = prevScore > 0 ? ((change / prevScore) * 100).toFixed(1) : '0.0';

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Bias Trend Analysis</CardTitle>
          <CardDescription className="mt-1">Average bias score over time</CardDescription>
        </div>
        <Badge variant="secondary">
          Last {period}
        </Badge>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <div className="flex items-baseline gap-3">
            <div className="text-4xl font-bold">{avgScore}</div>
            <div className={cn('text-sm font-medium', change >= 0 ? 'text-green-600' : 'text-red-600')}>
              {change >= 0 ? '+' : ''}{changePercent}%
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-1">Average score this week</div>
        </div>

        <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
                <stop offset="0%" stopColor="var(--color-score)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-score)" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
              horizontal={true}
              vertical={false}
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickMargin={12}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              domain={[0, 100]}
              tickCount={6}
              tickMargin={12}
            />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="rounded-md bg-popover/95 backdrop-blur-sm border shadow-md"
                  labelFormatter={(value) => `${value}`}
                />
              }
              cursor={{
                stroke: 'var(--color-score)',
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
            />

            <Line
              type="monotone"
              dataKey="score"
              stroke="var(--color-score)"
              strokeWidth={3}
              dot={{
                fill: 'hsl(var(--background))',
                strokeWidth: 2,
                r: 5,
                stroke: 'var(--color-score)',
              }}
              activeDot={{
                r: 6,
                fill: 'var(--color-score)',
                stroke: 'hsl(var(--background))',
                strokeWidth: 2,
              }}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
