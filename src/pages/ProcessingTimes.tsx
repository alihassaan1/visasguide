import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const ProcessingTimes = () => {
  const processingData = [
    {
      country: "United States",
      flag: "🇺🇸",
      visaType: "ESTA",
      currentTime: "72 hours",
      averageTime: "24-72 hours",
      trend: "stable",
      lastUpdate: "2 hours ago",
      status: "normal"
    },
    {
      country: "United States", 
      flag: "🇺🇸",
      visaType: "B1/B2 Tourist",
      currentTime: "8-12 months",
      averageTime: "6-10 months", 
      trend: "increasing",
      lastUpdate: "1 day ago",
      status: "delayed"
    },
    {
      country: "United Kingdom",
      flag: "🇬🇧",
      visaType: "Standard Visitor",
      currentTime: "3 weeks",
      averageTime: "3-8 weeks",
      trend: "stable",
      lastUpdate: "6 hours ago", 
      status: "normal"
    },
    {
      country: "Germany",
      flag: "🇩🇪",
      visaType: "Schengen Tourist",
      currentTime: "12 days",
      averageTime: "10-15 days",
      trend: "decreasing",
      lastUpdate: "4 hours ago",
      status: "fast"
    },
    {
      country: "Canada",
      flag: "🇨🇦", 
      visaType: "eTA",
      currentTime: "Minutes",
      averageTime: "Minutes-hours",
      trend: "stable",
      lastUpdate: "1 hour ago",
      status: "normal"
    },
    {
      country: "Canada",
      flag: "🇨🇦",
      visaType: "Visitor Visa",
      currentTime: "4 weeks",
      averageTime: "2-6 weeks",
      trend: "stable", 
      lastUpdate: "12 hours ago",
      status: "normal"
    },
    {
      country: "Australia",
      flag: "🇦🇺",
      visaType: "ETA (Subclass 601)",
      currentTime: "24 hours",
      averageTime: "1-2 days",
      trend: "stable",
      lastUpdate: "3 hours ago",
      status: "normal"
    },
    {
      country: "Japan",
      flag: "🇯🇵", 
      visaType: "Tourist Visa",
      currentTime: "7 days",
      averageTime: "5-10 days",
      trend: "decreasing",
      lastUpdate: "8 hours ago",
      status: "fast"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "fast": return "text-visa-success";
      case "delayed": return "text-visa-danger"; 
      case "normal": return "text-visa-info";
      default: return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "fast": return <Badge className="bg-visa-success text-white">Fast</Badge>;
      case "delayed": return <Badge variant="destructive">Delayed</Badge>;
      case "normal": return <Badge variant="secondary">Normal</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing": return <TrendingUp className="h-4 w-4 text-visa-danger" />;
      case "decreasing": return <TrendingDown className="h-4 w-4 text-visa-success" />;
      case "stable": return <Clock className="h-4 w-4 text-visa-info" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const fastTimes = processingData.filter(item => item.status === "fast");
  const delayedTimes = processingData.filter(item => item.status === "delayed");

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Global Visa Processing Times 2026 – Current Wait Times by Country | Visas.Guide"
        description="Check real-time visa processing times for 100+ countries. Compare current wait times for tourist, business, and student visas worldwide. Updated April 2026."
        canonical="https://visas.guide/processing-times"
        keywords={["visa processing time", "visa processing times", "global visa processing times", "global processing times", "visit visa processing time", "visa wait times", "visa application duration", "how long visa takes", "visa processing time by country"]}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* SEO Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Visa Processing Times
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real-time visa processing times and trends for popular destinations worldwide
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 bg-gradient-to-r from-visa-success/10 to-visa-success/5 border-visa-success/20">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-visa-success mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-visa-success">{fastTimes.length}</h3>
              <p className="text-muted-foreground">Faster Than Average</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-r from-visa-info/10 to-visa-info/5 border-visa-info/20">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-visa-info mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-visa-info">5</h3>
              <p className="text-muted-foreground">Normal Processing</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-r from-visa-danger/10 to-visa-danger/5 border-visa-danger/20">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-visa-danger mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-visa-danger">{delayedTimes.length}</h3>
              <p className="text-muted-foreground">Experiencing Delays</p>
            </CardContent>
          </Card>
        </div>

        {/* Processing Times Table */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Current Processing Times</h2>
          <div className="grid gap-4">
            {processingData.map((item, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-6 gap-4 items-center">
                    {/* Country & Visa Type */}
                    <div className="md:col-span-2 flex items-center space-x-3">
                      <span className="text-2xl">{item.flag}</span>
                      <div>
                        <h3 className="font-semibold text-foreground">{item.country}</h3>
                        <p className="text-sm text-muted-foreground">{item.visaType}</p>
                      </div>
                    </div>

                    {/* Current Time */}
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Current</p>
                      <p className={`font-bold ${getStatusColor(item.status)}`}>
                        {item.currentTime}
                      </p>
                    </div>

                    {/* Average Time */}
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Average</p>
                      <p className="font-medium text-foreground">{item.averageTime}</p>
                    </div>

                    {/* Trend */}
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        {getTrendIcon(item.trend)}
                        <span className="text-xs text-muted-foreground capitalize">{item.trend}</span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="text-center">
                      {getStatusBadge(item.status)}
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated {item.lastUpdate}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <section>
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="h-6 w-6 text-visa-warning flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Important Notice</h3>
                  <p className="text-muted-foreground mb-4">
                    Processing times are estimates based on current data and may vary depending on individual circumstances, 
                    application completeness, nationality, and embassy workload. Always apply well in advance of your travel date.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Processing times are updated regularly but can change without notice</li>
                    <li>• Peak seasons and holidays may cause additional delays</li>
                    <li>• Incomplete applications will result in longer processing times</li>
                    <li>• Some applications may require additional processing or interviews</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProcessingTimes;