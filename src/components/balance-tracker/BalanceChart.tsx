"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from "chart.js";
import { ProjectionDataItem } from "@/types/dashboard";
import { TransactionEntity } from "@/types/transaction";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function BalanceChart({ projectionData }: { projectionData: ProjectionDataItem[] }) {
  const chartData = {
    labels: projectionData.map((d) => d.date),
    datasets: [
      {
        label: "Balance Over Time",
        data: projectionData.map((d) => d.dataPoint.balance),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Projected Balance" },
      tooltip: {
        callbacks: {
          label(item: TooltipItem<"line">) {
            const d = projectionData[item.dataIndex];
            const txs: TransactionEntity[] = d.dataPoint.transactionList;
            let text = `Balance: $${Number(d.dataPoint.balance).toLocaleString()}`;
            if (txs.length > 0) {
              text += "\n" + txs.map((t) => `  ${t.sourceName}: $${t.amount} (${t.type})`).join("\n");
            }
            return text;
          },
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
