'use client'

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

export type RankingItem = {
  id: string
  etiqueta: string
  nombre: string
  unidad: string
  actual: number
  anterior: number
}

export function RankingChart({
  data,
  etiquetaActual,
  etiquetaAnterior,
}: {
  data: RankingItem[]
  etiquetaActual: string
  etiquetaAnterior: string
}) {
  const config = {
    actual: { label: etiquetaActual, color: 'var(--chart-1)' },
    anterior: { label: etiquetaAnterior, color: 'var(--chart-3)' },
  } satisfies ChartConfig

  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: Math.max(260, data.length * 56) }}>
      <BarChart data={data} layout="vertical" margin={{ left: 4, right: 16 }} barGap={2}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="etiqueta"
          width={130}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 13 }}
        />
        <ChartTooltip
          cursor={{ fill: 'var(--secondary)' }}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const item = payload?.[0]?.payload as RankingItem | undefined
                return item ? `${item.nombre} (${item.unidad})` : ''
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="actual" fill="var(--color-actual)" radius={4} />
        <Bar dataKey="anterior" fill="var(--color-anterior)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

const COLORES = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-5)', '#0f2f52']

export function TendenciaChart({
  data,
  series,
}: {
  data: Record<string, number | string>[]
  series: { key: string; label: string }[]
}) {
  const config = Object.fromEntries(
    series.map((s, i) => [s.key, { label: s.label, color: COLORES[i % COLORES.length] }]),
  ) satisfies ChartConfig

  return (
    <ChartContainer config={config} className="aspect-auto h-80 w-full">
      <LineChart data={data} margin={{ left: 0, right: 16, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={40} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent className="flex-wrap" />} />
        {series.map((s) => (
          <Line
            key={s.key}
            dataKey={s.key}
            type="monotone"
            stroke={`var(--color-${s.key})`}
            strokeWidth={2.5}
            dot={{ r: 3 }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  )
}
