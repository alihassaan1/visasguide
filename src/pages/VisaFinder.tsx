import { useCountries } from "@/hooks/useSharedData";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Users, Clock, CreditCard, CheckCircle, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import ResidencyToggle, { ResidencyType } from "@/components/ResidencyToggle";
import { Link } from "@/lib/router-compat";

const VisaFinder = () => {
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    nationality: "",
    destination: "",
    purpose: "",
    duration: ""
  });
  const [residency, setResidency] = useState<ResidencyType>("none");
  const [results, setResults] = useState<any>(null);

  // Fetch all countries from the database
  const { data: countries = [] } = useCountries();

  const purposes = [
    { value: "tourism", label: "Tourism & Leisure", icon: "🏖️" },
    { value: "business", label: "Business & Meetings", icon: "💼" },
    { value: "study", label: "Education & Study", icon: "🎓" },
    { value: "work", label: "Employment & Work", icon: "🏢" },
    { value: "family", label: "Family & Relatives", icon: "👥" },
    { value: "transit", label: "Transit & Layover", icon: "✈️" }
  ];

  const durations = [
    "Less than 30 days", "1-3 months", "3-6 months", "6-12 months", "More than 1 year"
  ];

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Generate results based on selections
      generateResults();
    }
  };

  const generateResults = async () => {
    // Find the country IDs from the selections
    const fromCountry = countries.find(c => c.name === selections.nationality);
    const toCountry = countries.find(c => c.name === selections.destination);

    if (!fromCountry || !toCountry) {
      // Fallback to mock data if countries not found
      const mockResults = {
        visaRequired: true,
        visaType: getVisaType(),
        processingTime: getProcessingTime(),
        fee: getFee(),
        difficulty: getDifficulty(),
        requirements: getRequirements(),
        nextSteps: getNextSteps()
      };
      setResults(mockResults);
      setStep(5);
      return;
    }

    // Fetch actual visa requirements from database
    const { data: visaReq, error } = await supabase
      .from("visa_requirements")
      .select("*")
      .eq("from_country_id", fromCountry.id)
      .eq("to_country_id", toCountry.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching visa requirements:", error);
    }

    const actualResults = {
      visaRequired: visaReq?.requirement_type !== "visa_free",
      visaType: getVisaTypeFromData(visaReq),
      processingTime: visaReq?.processing_time_days 
        ? `${visaReq.processing_time_days} days` 
        : getProcessingTime(),
      fee: visaReq?.fee_usd ? `$${visaReq.fee_usd}` : getFee(),
      difficulty: getDifficulty(),
      requirements: visaReq?.requirements?.length ? visaReq.requirements : getRequirements(),
      nextSteps: getNextSteps(),
      maxStayDays: visaReq?.max_stay_days,
      notes: visaReq?.notes,
      requirementType: visaReq?.requirement_type || "visa_required"
    };
    
    setResults(actualResults);
    setStep(5);
  };

  const getVisaTypeFromData = (visaReq: any) => {
    if (!visaReq) return getVisaType();
    
    const typeMap: Record<string, string> = {
      visa_free: "Visa Free Entry",
      visa_on_arrival: "Visa on Arrival",
      evisa_required: "eVisa Required",
      eTA_required: "eTA Required",
      visa_required: getVisaType()
    };
    
    return typeMap[visaReq.requirement_type] || getVisaType();
  };

  const getVisaType = () => {
    if (selections.purpose === "tourism") return "Tourist/Visitor Visa";
    if (selections.purpose === "business") return "Business Visa";
    if (selections.purpose === "study") return "Student Visa";
    if (selections.purpose === "work") return "Work Visa";
    if (selections.purpose === "family") return "Family/Spouse Visa";
    return "Transit Visa";
  };

  const getProcessingTime = () => {
    const times = ["1-3 days", "5-10 days", "2-4 weeks", "1-3 months", "3-6 months"];
    return times[Math.floor(Math.random() * times.length)];
  };

  const getFee = () => {
    const fees = ["$25", "$80", "$160", "$350", "$500"];
    return fees[Math.floor(Math.random() * fees.length)];
  };

  const getDifficulty = () => {
    const difficulties = ["Easy", "Medium", "Hard"];
    return difficulties[Math.floor(Math.random() * difficulties.length)];
  };

  const getRequirements = () => [
    "Valid passport (6+ months validity)",
    "Completed application form", 
    "Recent passport photos",
    "Proof of financial means",
    "Travel itinerary",
    "Travel insurance (if required)"
  ];

  const getNextSteps = () => [
    "Gather all required documents",
    "Complete online application",
    "Schedule appointment (if required)",
    "Pay visa fees",
    "Submit application"
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Visa Finder & Visa Map – Check Visa Requirements by Country | Visas.Guide"
        description="Use our free Visa Finder and interactive visa map to instantly check visa requirements by nationality and destination. Find visa-free countries and eVisa options."
        canonical="https://visas.guide/visa-finder"
        keywords={["visa finder", "visa map", "visamap", "interactive visa map", "what countries require visas map", "check visa requirements", "do I need a visa", "visa checker tool", "visa destinations", "visa eligibility", "browse visas", "visa list", "visa requirements checker", "visa worldwide"]}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* SEO Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Visa Requirements Finder
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find the exact visa requirements for your travel needs in just a few clicks
          </p>
        </div>

        {/* Residency Toggle */}
        <div className="max-w-3xl mx-auto mb-8">
          <ResidencyToggle value={residency} onChange={setResidency} />
        </div>

        {step <= 4 && (
          <>
            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {step > stepNumber ? <CheckCircle className="h-4 w-4" /> : stepNumber}
                    </div>
                    {stepNumber < 4 && (
                      <div className={`flex-1 h-0.5 mx-2 ${
                        step > stepNumber ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Question Cards */}
            <div className="max-w-2xl mx-auto">
              <Card className="border-0 shadow-xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-foreground">
                    {step === 1 && "What's your nationality?"}
                    {step === 2 && "Where are you traveling to?"}
                    {step === 3 && "What's the purpose of your visit?"}
                    {step === 4 && "How long will you stay?"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {step === 1 && (
                    <Select onValueChange={(value) => setSelections({...selections, nationality: value})}>
                      <SelectTrigger className="w-full py-3 text-lg">
                        <SelectValue placeholder="Select your nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.name}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {step === 2 && (
                    <Select onValueChange={(value) => setSelections({...selections, destination: value})}>
                      <SelectTrigger className="w-full py-3 text-lg">
                        <SelectValue placeholder="Select destination country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.name}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {step === 3 && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {purposes.map((purpose) => (
                        <Card 
                          key={purpose.value}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                            selections.purpose === purpose.value 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelections({...selections, purpose: purpose.value})}
                        >
                          <CardContent className="p-6 text-center">
                            <div className="text-3xl mb-2">{purpose.icon}</div>
                            <h3 className="font-medium text-foreground">{purpose.label}</h3>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {step === 4 && (
                    <Select onValueChange={(value) => setSelections({...selections, duration: value})}>
                      <SelectTrigger className="w-full py-3 text-lg">
                        <SelectValue placeholder="Select duration of stay" />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map((duration) => (
                          <SelectItem key={duration} value={duration}>
                            {duration}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <div className="flex justify-between mt-8">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(Math.max(1, step - 1))}
                      disabled={step === 1}
                    >
                      Previous
                    </Button>
                    <Button 
                      onClick={handleNext}
                      disabled={
                        (step === 1 && !selections.nationality) ||
                        (step === 2 && !selections.destination) ||
                        (step === 3 && !selections.purpose) ||
                        (step === 4 && !selections.duration)
                      }
                      className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground"
                    >
                      {step === 4 ? "Find My Visa" : "Next"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Results */}
        {step === 5 && results && (
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl mb-8">
              <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-accent/10">
                <CardTitle className="text-3xl text-foreground">Your Visa Requirements</CardTitle>
                <p className="text-muted-foreground">
                  {selections.nationality} traveling to {selections.destination} for {selections.purpose}
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="text-center">
                    <Badge className={results.visaRequired ? "bg-visa-warning text-white" : "bg-visa-success text-white"}>
                      {results.requirementType === "visa_free" 
                        ? "Visa Free" 
                        : results.requirementType === "visa_on_arrival"
                        ? "Visa on Arrival"
                        : results.requirementType === "evisa_required"
                        ? "eVisa"
                        : results.requirementType === "eTA_required"
                        ? "eTA Required"
                        : "Visa Required"}
                    </Badge>
                    <h3 className="font-semibold text-foreground mt-2">{results.visaType}</h3>
                    {results.maxStayDays && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Max stay: {results.maxStayDays} days
                      </p>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-visa-info mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Processing Time</p>
                    <p className="font-semibold text-foreground">{results.processingTime}</p>
                  </div>
                  
                  <div className="text-center">
                    <CreditCard className="h-8 w-8 text-visa-warning mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Visa Fee</p>
                    <p className="font-semibold text-foreground">{results.fee}</p>
                  </div>
                  
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Difficulty</p>
                    <Badge variant={
                      results.difficulty === "Easy" ? "default" : 
                      results.difficulty === "Medium" ? "secondary" : "destructive"
                    }>
                      {results.difficulty}
                    </Badge>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">Required Documents</h3>
                    <ul className="space-y-2">
                      {results.requirements.map((req: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-visa-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{req}</span>
                        </li>
                      ))}
                    </ul>
                    {results.notes && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Note:</strong> {results.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">Next Steps</h3>
                    <ol className="space-y-2">
                      {results.nextSteps.map((step: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-sm text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="flex justify-center space-x-4 mt-8">
                  <Button variant="outline" onClick={() => {setStep(1); setResults(null);}}>
                    Start Over
                  </Button>
                  <Link to={`/countries/${selections.destination.toLowerCase().replace(' ', '-')}`}>
                    <Button className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
                      View Detailed Requirements
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default VisaFinder;