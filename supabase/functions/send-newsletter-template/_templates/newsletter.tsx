import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Button,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface BlogPost {
  title: string;
  excerpt: string;
  slug: string;
  featured_image_url?: string;
}

interface CountryGuide {
  name: string;
  slug: string;
  flag_emoji: string;
  visa_free_destinations?: number;
}

interface Affiliate {
  name: string;
  description: string;
  image_url: string;
  target_url: string;
}

interface NewsletterEmailProps {
  subscriberName: string;
  blogPosts: BlogPost[];
  countryGuides: CountryGuide[];
  affiliates: Affiliate[];
  unsubscribeUrl?: string;
  campaignId?: string;
  subscriberEmail?: string;
}

export const NewsletterEmail = ({
  subscriberName = "Traveler",
  blogPosts = [],
  countryGuides = [],
  affiliates = [],
  unsubscribeUrl = "https://visas.guide/unsubscribe",
  campaignId = "",
  subscriberEmail = "",
}: NewsletterEmailProps) => {
  // FIXED: Correct Supabase project ID for tracking
  const SUPABASE_URL = "https://awiytryceqehqapytfgn.supabase.co";
  
  const trackUrl = (url: string, linkName: string) => {
    return `${SUPABASE_URL}/functions/v1/track-email-click?url=${encodeURIComponent(url)}&cid=${campaignId}&email=${encodeURIComponent(subscriberEmail)}&link=${encodeURIComponent(linkName)}`;
  };

  const trackingPixelUrl = `${SUPABASE_URL}/functions/v1/track-email-open?cid=${campaignId}&email=${encodeURIComponent(subscriberEmail)}`;

  // Get current date for dynamic content
  const today = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonth = monthNames[today.getMonth()];

  return (
    <Html>
      <Head />
      <Preview>
        {subscriberName}, your weekly visa updates are here! New destinations, travel tips & more 🌍
      </Preview>
      <Body style={main}>
        <Container style={container}>
          
          {/* Clean Header with Logo */}
          <Section style={header}>
            <Link href={trackUrl("https://visas.guide", "logo")}>
              <Img
                src="https://visas.guide/favicon.png"
                width="48"
                height="48"
                alt="Visas Guide"
                style={{ display: 'block', margin: '0 auto 12px' }}
              />
            </Link>
            <Text style={headerTagline}>Your Trusted Visa Information Source</Text>
          </Section>

          {/* Personal Greeting with Travel Quote */}
          <Section style={greetingSection}>
            <Heading style={greetingTitle}>
              Hi {subscriberName}! 👋
            </Heading>
            <Text style={greetingText}>
              Ready to explore the world? Here are this week's top visa updates and destination guides curated just for you.
            </Text>
          </Section>

          {/* Travel Tip of the Week */}
          <Section style={tipSection}>
            <Text style={tipIcon}>💡</Text>
            <Text style={tipTitle}>Travel Tip of the Week</Text>
            <Text style={tipText}>
              Always keep digital copies of your passport and visa in cloud storage. It can save your trip if documents are lost!
            </Text>
          </Section>

          {/* Featured Story - Large Image Card */}
          {blogPosts.length > 0 && (
            <Section style={section}>
              <Link 
                href={trackUrl(`https://visas.guide/blog/${blogPosts[0].slug}`, `featured_${blogPosts[0].slug}`)}
                style={{ textDecoration: 'none' }}
              >
                <Section style={featuredCard}>
                  {blogPosts[0].featured_image_url ? (
                    <Img
                      src={blogPosts[0].featured_image_url.startsWith('/') ? `https://visas.guide${blogPosts[0].featured_image_url}` : blogPosts[0].featured_image_url}
                      width="100%"
                      height="220"
                      alt={blogPosts[0].title}
                      style={featuredImg}
                    />
                  ) : (
                    <Section style={placeholderImg}>
                      <Text style={placeholderEmoji}>✈️</Text>
                    </Section>
                  )}
                  <Section style={featuredBody}>
                    <Text style={featuredLabel}>✨ Featured Story</Text>
                    <Heading style={featuredTitle}>{blogPosts[0].title}</Heading>
                    <Text style={featuredExcerpt}>
                      {blogPosts[0].excerpt?.substring(0, 120)}...
                    </Text>
                    <Text style={readMoreBtn}>Read full article →</Text>
                  </Section>
                </Section>
              </Link>
            </Section>
          )}

          {/* More Articles - Clean List */}
          {blogPosts.length > 1 && (
            <Section style={section}>
              <Heading style={sectionHeading}>📚 More to Explore</Heading>
              {blogPosts.slice(1, 4).map((post, index) => (
                <Link 
                  key={index}
                  href={trackUrl(`https://visas.guide/blog/${post.slug}`, `article_${post.slug}`)}
                  style={{ textDecoration: 'none' }}
                >
                  <Section style={articleItem}>
                    <Row>
                      <Column style={{ width: '80%', verticalAlign: 'middle' }}>
                        <Text style={articleTitle}>{post.title}</Text>
                        <Text style={articleExcerpt}>{post.excerpt?.substring(0, 60)}...</Text>
                      </Column>
                      <Column style={{ width: '20%', textAlign: 'right', verticalAlign: 'middle' }}>
                        <Text style={articleArrow}>→</Text>
                      </Column>
                    </Row>
                  </Section>
                </Link>
              ))}
            </Section>
          )}

          {/* Destinations - Improved Grid */}
          {countryGuides.length > 0 && (
            <Section style={destinationSection}>
              <Heading style={sectionHeadingWhite}>🌍 Popular Destinations</Heading>
              <Text style={sectionSubWhite}>Check visa requirements for trending countries</Text>
              
              <Row>
                {countryGuides.slice(0, 2).map((country, index) => (
                  <Column key={index} style={{ width: '50%', padding: '8px' }}>
                    <Link 
                      href={trackUrl(`https://visas.guide/countries/${country.slug}`, `dest_${country.slug}`)}
                      style={{ textDecoration: 'none' }}
                    >
                      <Section style={destCard}>
                        <Text style={destFlag}>{country.flag_emoji}</Text>
                        <Text style={destName}>{country.name}</Text>
                        {country.visa_free_destinations && country.visa_free_destinations > 0 && (
                         <Text style={destMeta}>{country.visa_free_destinations} visa-free access</Text>
                        )}
                        <Text style={destCta}>View Guide →</Text>
                      </Section>
                    </Link>
                  </Column>
                ))}
              </Row>
              {countryGuides.length > 2 && (
                <Row>
                  {countryGuides.slice(2, 4).map((country, index) => (
                    <Column key={index} style={{ width: '50%', padding: '8px' }}>
                      <Link 
                        href={trackUrl(`https://visas.guide/countries/${country.slug}`, `dest_${country.slug}`)}
                        style={{ textDecoration: 'none' }}
                      >
                        <Section style={destCard}>
                          <Text style={destFlag}>{country.flag_emoji}</Text>
                          <Text style={destName}>{country.name}</Text>
                          {country.visa_free_destinations && country.visa_free_destinations > 0 && (
                            <Text style={destMeta}>{country.visa_free_destinations} visa-free access</Text>
                          )}
                          <Text style={destCta}>View Guide →</Text>
                        </Section>
                      </Link>
                    </Column>
                  ))}
                </Row>
              )}
              
              <Button 
                style={primaryBtn}
                href={trackUrl("https://visas.guide/countries", "all_countries")}
              >
                Explore All Countries
              </Button>
            </Section>
          )}

          {/* Our Sponsors */}
          {affiliates.length > 0 && (
            <Section style={section}>
              <Text style={sponsoredLabel}>Sponsored</Text>
              
              {affiliates.map((affiliate, index) => (
                <Link 
                  key={index}
                  href={trackUrl(affiliate.target_url, `affiliate_${affiliate.name}`)}
                  style={{ textDecoration: 'none', display: 'block', marginBottom: '12px' }}
                >
                  <Img
                    src={affiliate.image_url}
                    width="100%"
                    alt={affiliate.name}
                    style={sponsorImg}
                  />
                </Link>
              ))}
            </Section>
          )}

          {/* Quick Tools */}
          <Section style={toolsSection}>
            <Heading style={toolsTitle}>🛠️ Quick Tools</Heading>
            <Row>
              <Column style={{ width: '33%', textAlign: 'center', padding: '8px' }}>
                <Link href={trackUrl("https://visas.guide/visa-search", "tool_finder")} style={{ textDecoration: 'none' }}>
                  <Section style={toolCard}>
                    <Text style={toolEmoji}>🔍</Text>
                    <Text style={toolLabel}>Visa Finder</Text>
                  </Section>
                </Link>
              </Column>
              <Column style={{ width: '33%', textAlign: 'center', padding: '8px' }}>
                <Link href={trackUrl("https://visas.guide/passport-rankings", "tool_passport")} style={{ textDecoration: 'none' }}>
                  <Section style={toolCard}>
                    <Text style={toolEmoji}>📊</Text>
                    <Text style={toolLabel}>Rankings</Text>
                  </Section>
                </Link>
              </Column>
              <Column style={{ width: '33%', textAlign: 'center', padding: '8px' }}>
                <Link href={trackUrl("https://visas.guide/schengen-visa-guide", "tool_schengen")} style={{ textDecoration: 'none' }}>
                  <Section style={toolCard}>
                    <Text style={toolEmoji}>🇪🇺</Text>
                    <Text style={toolLabel}>Schengen</Text>
                  </Section>
                </Link>
              </Column>
            </Row>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={footerDivider} />
            
            <Text style={footerBrand}>Visas Guide</Text>
            <Text style={footerTagline}>Your trusted source for global visa information</Text>
            
            <Row style={{ marginTop: '20px' }}>
              <Column align="center">
                <Link href={trackUrl("https://facebook.com/visasguide", "social_fb")} style={socialLink}>Facebook</Link>
                <Text style={socialDot}> • </Text>
                <Link href={trackUrl("https://instagram.com/visasguide", "social_ig")} style={socialLink}>Instagram</Link>
                <Text style={socialDot}> • </Text>
                <Link href={trackUrl("https://twitter.com/visasguide", "social_tw")} style={socialLink}>Twitter</Link>
              </Column>
            </Row>
            
            <Text style={footerText}>
              You're receiving this because you subscribed to visa updates at visas.guide
            </Text>
            
            <Row style={{ marginTop: '16px' }}>
              <Column align="center">
                <Link href={trackUrl("https://visas.guide/contact", "manage_prefs")} style={footerLink}>Contact Us</Link>
                <Text style={footerDot}> | </Text>
                <Link href={unsubscribeUrl} style={footerLink}>Unsubscribe</Link>
                <Text style={footerDot}> | </Text>
                <Link href={trackUrl("https://visas.guide/privacy-policy", "privacy")} style={footerLink}>Privacy Policy</Link>
              </Column>
            </Row>
            
            <Text style={footerAddress}>
              5900 Balcones Drive, STE 100, Austin, TX 78731
            </Text>
            <Text style={copyright}>© {today.getFullYear()} Visas Guide. All rights reserved.</Text>
          </Section>

          {/* Tracking Pixel */}
          <Img src={trackingPixelUrl} width="1" height="1" alt="" style={{ display: 'none' }} />
        </Container>
      </Body>
    </Html>
  );
}

export default NewsletterEmail

// Clean, modern email styles
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
}

const header = {
  padding: '32px 24px 16px',
  backgroundColor: '#ffffff',
  textAlign: 'center' as const,
}

const headerTagline = {
  fontSize: '13px',
  color: '#888888',
  margin: '0',
  letterSpacing: '0.3px',
}

const greetingSection = {
  padding: '8px 24px 24px',
}

const greetingTitle = {
  fontSize: '26px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 12px',
  lineHeight: '1.2',
}

const greetingText = {
  fontSize: '16px',
  color: '#555555',
  margin: '0',
  lineHeight: '1.6',
}

const tipSection = {
  margin: '0 24px 24px',
  padding: '20px',
  backgroundColor: '#fff8e6',
  borderRadius: '12px',
  borderLeft: '4px solid #f5a623',
}

const tipIcon = {
  fontSize: '24px',
  margin: '0 0 8px',
}

const tipTitle = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const tipText = {
  fontSize: '14px',
  color: '#555555',
  margin: '0',
  lineHeight: '1.5',
}

const section = {
  padding: '0 24px 32px',
}

const sectionHeading = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 16px',
}

const sectionSub = {
  fontSize: '14px',
  color: '#777777',
  margin: '-8px 0 16px',
}

const featuredCard = {
  borderRadius: '16px',
  overflow: 'hidden',
  backgroundColor: '#f9f9f9',
  border: '1px solid #eeeeee',
}

const featuredImg = {
  display: 'block',
  width: '100%',
  objectFit: 'cover' as const,
}

const placeholderImg = {
  backgroundColor: '#0066cc',
  height: '180px',
  textAlign: 'center' as const,
  paddingTop: '60px',
}

const placeholderEmoji = {
  fontSize: '64px',
  margin: '0',
}

const featuredBody = {
  padding: '24px',
}

const featuredLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#0066cc',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
}

const featuredTitle = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 12px',
  lineHeight: '1.3',
}

const featuredExcerpt = {
  fontSize: '15px',
  color: '#555555',
  margin: '0 0 16px',
  lineHeight: '1.5',
}

const readMoreBtn = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#0066cc',
  margin: '0',
}

const articleItem = {
  padding: '16px 0',
  borderBottom: '1px solid #eeeeee',
}

const articleTitle = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 4px',
  lineHeight: '1.4',
}

const articleExcerpt = {
  fontSize: '13px',
  color: '#888888',
  margin: '0',
}

const articleArrow = {
  fontSize: '20px',
  color: '#0066cc',
  margin: '0',
}

const destinationSection = {
  padding: '32px 16px',
  backgroundColor: '#0a2540',
}

const sectionHeadingWhite = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0 0 8px',
  textAlign: 'center' as const,
}

const sectionSubWhite = {
  fontSize: '14px',
  color: '#a0aec0',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const destCard = {
  backgroundColor: '#1a3a5c',
  borderRadius: '12px',
  padding: '24px 16px',
  textAlign: 'center' as const,
}

const destFlag = {
  fontSize: '40px',
  margin: '0 0 10px',
}

const destName = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#ffffff',
  margin: '0 0 6px',
}

const destMeta = {
  fontSize: '12px',
  color: '#a0aec0',
  margin: '0',
}

const primaryBtn = {
  backgroundColor: '#0066cc',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '14px 28px',
  display: 'block',
  textAlign: 'center' as const,
  margin: '24px auto 0',
  maxWidth: '220px',
}

const dealItem = {
  padding: '16px',
  backgroundColor: '#f9f9f9',
  borderRadius: '12px',
  marginBottom: '12px',
  border: '1px solid #eeeeee',
}

const dealImg = {
  borderRadius: '10px',
}

const dealName = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 4px',
}

const dealDesc = {
  fontSize: '13px',
  color: '#666666',
  margin: '0',
  lineHeight: '1.4',
}

const dealArrow = {
  fontSize: '18px',
  color: '#0066cc',
  margin: '0',
}

const toolsSection = {
  padding: '32px 24px',
  backgroundColor: '#f9f9f9',
}

const toolsTitle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}

const toolCard = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '20px 12px',
  border: '1px solid #eeeeee',
}

const toolEmoji = {
  fontSize: '28px',
  margin: '0 0 8px',
}

const toolLabel = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0',
}

const footer = {
  padding: '32px 24px',
  backgroundColor: '#ffffff',
  textAlign: 'center' as const,
}

const footerDivider = {
  borderColor: '#eeeeee',
  margin: '0 0 24px',
}

const footerBrand = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 4px',
}

const footerTagline = {
  fontSize: '13px',
  color: '#888888',
  margin: '0',
}

const socialLink = {
  fontSize: '13px',
  color: '#0066cc',
  textDecoration: 'none',
}

const socialDot = {
  fontSize: '13px',
  color: '#cccccc',
  display: 'inline',
}

const footerText = {
  fontSize: '12px',
  color: '#999999',
  margin: '20px 0 0',
  lineHeight: '1.5',
}

const footerLink = {
  fontSize: '12px',
  color: '#666666',
  textDecoration: 'underline',
}

const footerDot = {
  fontSize: '12px',
  color: '#cccccc',
  display: 'inline',
}

const footerAddress = {
  fontSize: '11px',
  color: '#aaaaaa',
  margin: '16px 0 0',
}

const copyright = {
  fontSize: '11px',
  color: '#aaaaaa',
  margin: '8px 0 0',
}
