import { Card, CardContent } from "@/components/ui/card";
import { Receipt, IndianRupee, Mic, Package } from "lucide-react";

export default function QuickStats({ stats }) {
  const defaultStats = {
    todayBills: 0,
    todayRevenue: 0,
    voiceCommands: 0,
    itemsSold: 0,
  };

  const displayStats = stats || defaultStats;

  const statItems = [
    {
      title: "Today's Bills",
      value: displayStats.todayBills.toString(),
      icon: Receipt,
      bgColor: "bg-success",
      testId: "stat-bills",
    },
    {
      title: "Today's Revenue",
      value: `₹${displayStats.todayRevenue.toFixed(0)}`,
      icon: IndianRupee,
      bgColor: "bg-primary",
      testId: "stat-revenue",
    },
    {
      title: "Voice Commands",
      value: displayStats.voiceCommands.toString(),
      icon: Mic,
      bgColor: "bg-warning",
      testId: "stat-commands",
    },
    {
      title: "Items Sold",
      value: displayStats.itemsSold.toString(),
      icon: Package,
      bgColor: "bg-error",
      testId: "stat-items",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
      {statItems.map((stat) => (
        <Card key={stat.title} className="shadow-sm border border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center" data-testid={stat.testId}>
              <div
                className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className="text-white w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
