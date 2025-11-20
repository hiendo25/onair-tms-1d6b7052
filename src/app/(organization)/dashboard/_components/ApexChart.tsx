"use client";

import React from "react";
import type {
  ApexOptions,
} from "apexcharts";

type Series = ApexAxisChartSeries | ApexNonAxisChartSeries;

interface Props {
  type: any;
  options: ApexOptions;
  series: Series;
  height?: number;
}

const ApexChart = ({ type, options, series, height = 320 }: Props) => {
  const chartRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    let chart: any;
    let mounted = true;

    const load = async () => {
      const ApexCharts = (await import("apexcharts")).default;
      if (!mounted || !chartRef.current) return;

      chart = new ApexCharts(chartRef.current, {
        ...options,
        series,
        chart: {
          height,
          toolbar: { show: false },
          fontFamily: "Inter, sans-serif",
          ...(options.chart || {}),
          type,
        },
      });

      chart.render();
    };

    load();

    return () => {
      mounted = false;
      if (chart) {
        chart.destroy();
      }
    };
  }, [type, options, series, height]);

  return <div ref={chartRef} style={{ width: "100%", minHeight: height }} />;
};

export default ApexChart;
