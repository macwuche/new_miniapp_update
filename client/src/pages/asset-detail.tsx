import { MobileLayout } from "@/components/layout/mobile-layout";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useState } from "react";

// Mock data for the chart
const CHART_DATA = [
  { time: "10:00", value: 85800 },
  { time: "10:05", value: 85900 },
  { time: "10:10", value: 85750 },
  { time: "10:15", value: 85600 },
  { time: "10:20", value: 85700 },
  { time: "10:25", value: 85850 },
  { time: "10:30", value: 85800 },
  { time: "10:35", value: 86100 },
  { time: "10:40", value: 86300 },
  { time: "10:45", value: 86250 },
  { time: "10:50", value: 86401.25 },
];

const TIMEFRAMES = ["LIVE", "1D", "7D", "1M", "3M", "6M", "1Y"];

export default function AssetDetail() {
  const [match, params] = useRoute("/asset/:symbol");
  const symbol = params?.symbol || "BTC";
  const [selectedTimeframe, setSelectedTimeframe] = useState("LIVE");

  // Mock asset data based on symbol (simplified)
  const assetData = {
    symbol: symbol,
    name: symbol === "BTC" ? "Bitcoin" : symbol === "ETH" ? "Ethereum" : "Asset",
    price: "86,401.25",
    change: "+0.6%",
    isUp: true,
    holdings: "0.001775",
    value: "153.36"
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-white pb-24">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 flex justify-between items-center sticky top-0 bg-white z-10">
          <Link href="/markets">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors">
              <ArrowLeft size={24} />
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="rounded-full w-10 h-10">
            <MoreHorizontal size={24} className="text-gray-600" />
          </Button>
        </div>

        <div className="flex flex-col items-center pt-2 px-6">
          {/* Asset Icon */}
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-200 rotate-3">
             <span className="text-white font-bold text-2xl">{assetData.symbol[0]}</span>
          </div>

          {/* Price Info */}
          <h1 className="text-4xl font-bold text-gray-900 mb-1 tracking-tight">${assetData.price}</h1>
          <p className={`text-lg font-medium ${assetData.isUp ? "text-green-500" : "text-red-500"}`}>
            {assetData.name} {assetData.change}
          </p>
        </div>

        {/* Chart Section */}
        <div className="h-[300px] w-full mt-8 mb-6 relative">
          {/* Price indicators on chart area for effect */}
          <div className="absolute top-0 left-6 text-xs text-gray-300">$86,461.45</div>
          <div className="absolute bottom-12 left-6 text-xs text-gray-300">$85,899.67</div>

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF9800" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FF9800" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#000' }}
                formatter={(value) => [`$${value}`, 'Price']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#FF9800" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Timeframe Selector */}
        <div className="px-4 mb-8">
          <div className="flex justify-between bg-gray-50 p-1 rounded-xl">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedTimeframe === tf 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Holdings Card */}
        <div className="px-6">
          <Card className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl shadow-gray-200 border-none">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1 border-r border-gray-700">
                <p className="text-2xl font-bold text-yellow-400 mb-1">{assetData.holdings}</p>
                <p className="text-sm font-medium text-gray-400">{assetData.symbol}</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-2xl font-bold text-white mb-1">${assetData.value}</p>
                <p className="text-sm font-medium text-gray-400">Value</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
}
