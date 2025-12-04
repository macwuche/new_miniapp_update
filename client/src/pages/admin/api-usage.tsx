import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, Coins } from "lucide-react";

export default function ApiConfiguration() {
  const { toast } = useToast();
  const [cryptoApiUrl, setCryptoApiUrl] = useState("");
  const [chartApiUrl, setChartApiUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedUrl = localStorage.getItem("crypto_api_url");
    if (savedUrl) {
      setCryptoApiUrl(savedUrl);
    } else {
      // Default URL provided by user
      setCryptoApiUrl("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=price_desc&per_page=250&page=1&x_cg_demo_api_key=CG-7Rc5Jh3xjgp1MT5J9vG5BsSk");
    }

    const savedChartUrl = localStorage.getItem("chart_api_url");
    if (savedChartUrl) {
      setChartApiUrl(savedChartUrl);
    } else {
      setChartApiUrl("https://api.coingecko.com/api/v3/coins/{id}/market_chart?vs_currency=usd&days=1&x_cg_demo_api_key=CG-7Rc5Jh3xjgp1MT5J9vG5BsSk");
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API validation/saving
    setTimeout(() => {
      localStorage.setItem("crypto_api_url", cryptoApiUrl);
      localStorage.setItem("chart_api_url", chartApiUrl);
      setIsSaving(false);
      toast({
        title: "API Configuration Saved",
        description: "The market data sources have been updated.",
      });
    }, 800);
  };

  const handleSync = () => {
    // Dispatch a custom event that the markets page listens to
    // In a real app this would likely trigger a server-side job, 
    // but for this client-side prototype we use events
    window.dispatchEvent(new Event('sync-api-data'));
    toast({
      title: "Sync Started",
      description: "Fetching latest market data from API...",
    });
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Configuration</h1>
          <p className="text-gray-500 mt-2">Manage external integrations and API keys for the platform.</p>
        </div>
        <Button onClick={handleSync} variant="outline" className="gap-2">
          <RefreshCw size={16} />
          Sync API Data
        </Button>
      </div>

      <div className="space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <Coins size={24} />
              </div>
              <div>
                <CardTitle>Cryptocurrency Market Data</CardTitle>
                <CardDescription>Configure the data source for populating crypto assets.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="crypto-api">API Endpoint URL</Label>
              <Input 
                id="crypto-api" 
                placeholder="https://api.example.com/v3/coins/markets..." 
                value={cryptoApiUrl}
                onChange={(e) => setCryptoApiUrl(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                This endpoint will be used to fetch real-time data for the "Popular Assets" section on the user dashboard.
              </p>
            </div>

            <div className="h-px bg-gray-100 my-4" />

            <div className="space-y-2">
              <Label htmlFor="chart-api">Chart Data API Endpoint</Label>
              <Input 
                id="chart-api" 
                placeholder="https://api.example.com/v3/coins/{id}/market_chart..." 
                value={chartApiUrl}
                onChange={(e) => setChartApiUrl(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Endpoint for historical price data. Use <code>{`{id}`}</code> as a placeholder for the coin ID.
              </p>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
