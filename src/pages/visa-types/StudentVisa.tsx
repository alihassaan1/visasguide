import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, MapPin, Clock, DollarSign, FileText, CheckCircle, AlertCircle, ArrowRight, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const StudentVisa = () => {
  const countries = [
    {
      country: "United States",
      flag: "🇺🇸",
      visaType: "F-1 Student Visa",
      processingTime: "2-12 weeks",
      fee: "$185 USD",
      validity: "Duration of studies",
      workRights: "On-campus + OPT",
      difficulty: "Hard"
    },
    {
      country: "United Kingdom",
      flag: "🇬🇧", 
      visaType: "Student Visa (Tier 4)",
      processingTime: "3-8 weeks",
      fee: "£348-£475",
      validity: "Duration of course + extra time",
      workRights: "20 hours/week during studies",
      difficulty: "Medium"
    },
    {
      country: "Canada",
      flag: "🇨🇦",
      visaType: "Study Permit",
      processingTime: "4-16 weeks",
      fee: "$150 CAD",
      validity: "Duration of studies + 90 days",
      workRights: "20 hours/week + PGWP",
      difficulty: "Medium"
    },
    {
      country: "Australia",
      flag: "🇦🇺",
      visaType: "Student Visa (subclass 500)",
      processingTime: "4-8 weeks",
      fee: "$650 AUD",
      validity: "Duration of studies + extra time",
      workRights: "40 hours/fortnight",
      difficulty: "Medium"
    }
  ];

  const requirements = [
    "Valid passport (6+ months remaining)",
    "Letter of acceptance from educational institution",
    "Completed student visa application form",
    "Recent passport-sized photographs",
    "Proof of financial support/bank statements",
    "Academic transcripts and certificates",
    "English language proficiency test results",
    "Health insurance coverage",
    "Medical examination (if required)",
    "Statement of Purpose (SOP)",
    "Sponsor documents (if applicable)",
    "No objection certificate from current institution"
  ];

  const tips = [
    {
      title: "Early Application",
      description: "Apply as soon as you receive your acceptance letter. Processing times can be lengthy, especially during peak seasons."
    },
    {
      title: "Financial Documentation",
      description: "Demonstrate sufficient funds to cover tuition, living expenses, and return transportation for the entire study period."
    },
    {
      title: "Strong Academic Profile",
      description: "Maintain good academic records and provide all required educational documents with proper authentication."
    },
    {
      title: "Genuine Intent",
      description: "Clearly articulate your study plans and career goals in your Statement of Purpose and visa interview."
    },
    {
      title: "Health Requirements",
      description: "Complete medical examinations from approved panel physicians if required by the destination country."
    },
    {
      title: "Language Proficiency",
      description: "Meet the required English language test scores (IELTS, TOEFL, PTE) for your chosen institution and visa category."
    }
  ];

  const studyOptions = [
    { level: "Undergraduate Degree", duration: "3-4 years", description: "Bachelor's degree programs in various fields" },
    { level: "Graduate Degree", duration: "1-2 years", description: "Master's degree and postgraduate diploma programs" },
    { level: "Doctoral Studies", duration: "3-7 years", description: "PhD and research-based doctoral programs" },
    { level: "Language Courses", duration: "1-52 weeks", description: "English language and preparation courses" },
    { level: "Vocational Training", duration: "6 months-2 years", description: "Technical and professional skill courses" },
    { level: "Exchange Programs", duration: "1-2 semesters", description: "Short-term study abroad programs" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Student Visa Requirements and Application Guide 2026",
            "description": "Complete guide to student visa requirements, processing times, fees, and application tips for international education opportunities worldwide.",
            "author": {
              "@type": "Organization",
              "name": "Visas Guide"
            },
            "datePublished": "2024-01-01",
            "dateModified": new Date().toISOString().split('T')[0],
            "mainEntityOfPage": "https://visas.guide/visa-types/student-visa"
          })
        }}
      />

      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* SEO Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <GraduationCap className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Student Visa Guide
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete guide to student visa requirements, application processes, and tips for successful approval for international education and study abroad programs.
          </p>
        </div>

        {/* Overview Section */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-foreground mb-6">What is a Student Visa?</h2>
              <div className="prose prose-lg max-w-none text-foreground">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  A student visa is a specialized immigration document that allows foreign nationals to enter and remain in a country 
                  for the purpose of pursuing education at recognized institutions. Student visas typically permit holders to study 
                  full-time at universities, colleges, or other educational establishments for the duration of their academic program.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Most student visas also provide limited work rights, allowing students to work part-time during their studies and 
                  sometimes full-time during academic breaks. The specific conditions vary by country and visa category.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Study Options */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Study Options Available</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyOptions.map((option, index) => (
              <Card key={index} className="border-0 bg-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-foreground flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span>{option.level}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="mb-3 text-xs">
                    Duration: {option.duration}
                  </Badge>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {option.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Popular Countries */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Popular Student Destinations</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {countries.map((country, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-card hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-4xl">{country.flag}</span>
                        <div>
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {country.country}
                          </h3>
                          <p className="text-muted-foreground">{country.visaType}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={
                          country.difficulty === "Easy" ? "text-visa-success border-visa-success" :
                          country.difficulty === "Medium" ? "text-visa-warning border-visa-warning" :
                          "text-visa-danger border-visa-danger"
                        }
                      >
                        {country.difficulty}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-visa-info" />
                        <div>
                          <p className="text-xs text-muted-foreground">Processing Time</p>
                          <p className="text-sm font-medium text-foreground">{country.processingTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-visa-warning" />
                        <div>
                          <p className="text-xs text-muted-foreground">Visa Fee</p>
                          <p className="text-sm font-medium text-foreground">{country.fee}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-visa-success" />
                        <div>
                          <p className="text-xs text-muted-foreground">Validity</p>
                          <p className="text-sm font-medium text-foreground">{country.validity}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Work Rights</p>
                          <p className="text-sm font-medium text-foreground">{country.workRights}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Link to={`/countries/${country.country.toLowerCase().replace(' ', '-')}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Requirements
                        </Button>
                      </Link>
                      <Link to={`/guides/${country.country.toLowerCase().replace(' ', '-')}-student-visa`} className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
                          Application Guide
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Requirements Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Common Student Visa Requirements</h2>
          <Card>
            <CardContent className="p-8">
              <p className="text-muted-foreground mb-6">
                Student visa applications typically require the following documents:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-visa-success flex-shrink-0" />
                    <span className="text-foreground">{requirement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tips Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Expert Tips for Student Visa Success</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip, index) => (
              <Card key={index} className="border-0 bg-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-foreground flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <span>{tip.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {tip.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Can I work while studying on a student visa?</h3>
                <p className="text-muted-foreground">
                  Most countries allow students to work part-time during studies (typically 20 hours per week) and full-time 
                  during academic breaks. Work rights vary by country and visa conditions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">How much money do I need to show for a student visa?</h3>
                <p className="text-muted-foreground">
                  Financial requirements vary by country and institution. Generally, you need to show funds for tuition fees 
                  plus living expenses (typically $10,000-$25,000 per year depending on the destination).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Can I extend my student visa?</h3>
                <p className="text-muted-foreground">
                  Yes, most student visas can be extended if you continue your studies or pursue higher education. 
                  You must apply before your current visa expires and meet ongoing requirements.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Apply for Your Student Visa?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Use our visa search tool to find specific student visa requirements for your chosen destination and start your application process today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/visa-search">
                  <Button className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground">
                    Search Student Visas
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/guides">
                  <Button variant="outline">
                    Browse All Guides
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default StudentVisa;