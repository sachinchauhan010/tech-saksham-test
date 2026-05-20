"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Bar, BarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Question } from "@/types/question"
import { IEvent } from "@/types/interface"
import EventFilterDropdown from "@/components/admin/EventFilterDropdown"

const chartConfig = {
  active: {
    label: "Active",
    color: "#1d7edaff", // Darker blue
  },
  answered: {
    label: "Answered",
    color: "#21e292ff", // Darker green
  },
  removed: {
    label: "Removed",
    color: "#db321fff", // Darker red
  },
} satisfies ChartConfig

export default function QuestionStatusChart({
  questions,
  assignedEvents,
}: {
  questions: Question[]
  assignedEvents: IEvent[]
}) {
  const [selectedEvent, setSelectedEvent] = React.useState<IEvent | null>(null)

  // Build chart data: one entry per event, with counts per status
  const chartData = React.useMemo(() => {
    const eventsToShow =
      !selectedEvent
        ? assignedEvents
        : assignedEvents.filter((e) => String(e._id) === String(selectedEvent._id))

    return eventsToShow.map((event) => {
      const eventQuestions = questions.filter(
        (q) => String(q.eventId) === String(event._id)
      )

      const active = eventQuestions.filter(
        (q) => q.status === "active" || !q.status
      ).length

      const answered = eventQuestions.filter(
        (q) => q.status === "answered"
      ).length

      const removed = eventQuestions.filter(
        (q) => q.status === "removed"
      ).length

      // Truncate long event names for the X axis
      const label =
        event.title?.length > 16
          ? event.title.slice(0, 14) + "…"
          : event.title ?? `Event ${event._id}`

      return {
        eventId: String(event._id),
        event: label,
        fullName: event.title ?? `Event ${event._id}`,
        active,
        answered,
        removed,
        total: active + answered + removed,
      }
    })
  }, [questions, assignedEvents, selectedEvent])

  const totalActive   = chartData.reduce((s, d) => s + d.active, 0)
  const totalAnswered = chartData.reduce((s, d) => s + d.answered, 0)
  const totalRemoved  = chartData.reduce((s, d) => s + d.removed, 0)

  return (
    <Card className="pt-0">
      <CardHeader className="w-full flex justify-between items-center gap-2 space-y-0 border-b py-5">
        <div className="grid flex-1 gap-1">
          <CardTitle>Question Status by Event</CardTitle>
          <CardDescription>
            Active · Answered · Removed — across{" "}
            {!selectedEvent
              ? `all ${assignedEvents.length} events`
              : "selected event"}
          </CardDescription>
        </div>

         {/* Summary Stats */}
        <div className="flex items-center gap-8 lg:mr-6">
          <div>
            <p className="text-3xl font-bold text-[#1d7edaff]">
              {totalActive}
            </p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active</p>
          </div>
          <div className="border-l-2 border-slate-100 pl-8">
            <p className="text-3xl font-bold text-[#21e292ff]">
              {totalAnswered}
            </p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Answered</p>
          </div>
          <div className="border-l-2 border-slate-100 pl-8">
            <p className="text-3xl font-bold text-[#db321fff]">
              {totalRemoved}
            </p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Removed</p>
          </div>
        </div>

        <EventFilterDropdown
          assignEvents={assignedEvents}
          selectedEvent={selectedEvent}
          onSelectEvent={setSelectedEvent}
          allEventsLabel="All Events"
        />
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {chartData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            No data available for the selected event.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 16, left: 16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--color-active)"   stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-active)"   stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillAnswered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--color-answered)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-answered)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillRemoved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--color-removed)"  stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-removed)"  stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} />

              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
                width={30}
              />

              <XAxis
                dataKey="event"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={16}
                interval="preserveStartEnd"
              />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      // Show the full event name in the tooltip
                      return payload?.[0]?.payload?.fullName ?? ""
                    }}
                    indicator="dot"
                  />
                }
              />

              <Area
                dataKey="removed"
                type="natural"
                fill="url(#fillRemoved)"
                stroke="var(--color-removed)"
                stackId="a"
              />
              <Area
                dataKey="answered"
                type="natural"
                fill="url(#fillAnswered)"
                stroke="var(--color-answered)"
                stackId="a"
              />
              <Area
                dataKey="active"
                type="natural"
                fill="url(#fillActive)"
                stroke="var(--color-active)"
                stackId="a"
              />

              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}