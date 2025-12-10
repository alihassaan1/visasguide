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
  const trackUrl = (url: string, linkName: string) => {
    return `https://akmyvslglxzdnfqfcndj.supabase.co/functions/v1/track-email-click?url=${encodeURIComponent(url)}&cid=${campaignId}&email=${encodeURIComponent(subscriberEmail)}&link=${encodeURIComponent(linkName)}`;
  };

  const trackingPixelUrl = `https://akmyvslglxzdnfqfcndj.supabase.co/functions/v1/track-email-open?cid=${campaignId}&email=${encodeURIComponent(subscriberEmail)}`;

  return (
    <Html>
      <Head />
      <Preview>Hey {subscriberName}, discover visa-free destinations this week</Preview>
      <Body style={main}>
        <Container style={container}>
          
          {/* Simple Header */}
          <Section style={header}>
            <Img
              src="https://visas.guide/logo.png"
              width="120"
              alt="Visas Guide"
              style={{ display: 'block', margin: '0 auto' }}
            />
          </Section>

          {/* Personal Greeting */}
          <Section style={greetingSection}>
            <Heading style={greetingTitle}>
              Hi {subscriberName} 👋
            </Heading>
            <Text style={greetingText}>
              Ready to plan your next adventure? Here are this week's top visa updates and destination guides curated just for you.
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
                      src={blogPosts[0].featured_image_url}
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
                    <Text style={featuredLabel}>Featured Story</Text>
                    <Heading style={featuredTitle}>{blogPosts[0].title}</Heading>
                    <Text style={featuredExcerpt}>
                      {blogPosts[0].excerpt?.substring(0, 100)}...
                    </Text>
                    <Text style={readMoreBtn}>Read more →</Text>
                  </Section>
                </Section>
              </Link>
            </Section>
          )}

          {/* More Articles - Simple List */}
          {blogPosts.length > 1 && (
            <Section style={section}>
              <Heading style={sectionHeading}>More to explore</Heading>
              {blogPosts.slice(1, 3).map((post, index) => (
                <Link 
                  key={index}
                  href={trackUrl(`https://visas.guide/blog/${post.slug}`, `article_${post.slug}`)}
                  style={{ textDecoration: 'none' }}
                >
                  <Section style={articleItem}>
                    <Row>
                      <Column style={{ width: '75%', verticalAlign: 'middle' }}>
                        <Text style={articleTitle}>{post.title}</Text>
                      </Column>
                      <Column style={{ width: '25%', textAlign: 'right', verticalAlign: 'middle' }}>
                        <Text style={articleArrow}>→</Text>
                      </Column>
                    </Row>
                  </Section>
                </Link>
              ))}
            </Section>
          )}

          {/* Destinations - Image Grid */}
          {countryGuides.length > 0 && (
            <Section style={destinationSection}>
              <Heading style={sectionHeadingWhite}>Popular destinations</Heading>
              <Text style={sectionSubWhite}>Explore visa requirements for trending countries</Text>
              
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
                          <Text style={destMeta}>{country.visa_free_destinations} visa-free</Text>
                        )}
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
                            <Text style={destMeta}>{country.visa_free_destinations} visa-free</Text>
                          )}
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
                View all countries
              </Button>
            </Section>
          )}

          {/* Deals Section */}
          {affiliates.length > 0 && (
            <Section style={section}>
              <Heading style={sectionHeading}>Travel essentials</Heading>
              
              {affiliates.map((affiliate, index) => (
                <Link 
                  key={index}
                  href={trackUrl(affiliate.target_url, `affiliate_${affiliate.name}`)}
                  style={{ textDecoration: 'none' }}
                >
                  <Section style={dealItem}>
                    <Row>
                      <Column style={{ width: '56px', verticalAlign: 'middle' }}>
                        <Img
                          src={affiliate.image_url}
                          width="48"
                          height="48"
                          alt={affiliate.name}
                          style={dealImg}
                        />
                      </Column>
                      <Column style={{ paddingLeft: '16px', verticalAlign: 'middle' }}>
                        <Text style={dealName}>{affiliate.name}</Text>
                        <Text style={dealDesc}>{affiliate.description}</Text>
                      </Column>
                    </Row>
                  </Section>
                </Link>
              ))}
            </Section>
          )}

          {/* Quick Tools */}
          <Section style={toolsSection}>
            <Heading style={toolsTitle}>Quick tools</Heading>
            <Row>
              <Column style={{ width: '33%', textAlign: 'center', padding: '8px' }}>
                <Link href={trackUrl("https://visas.guide/visa-search", "tool_finder")} style={{ textDecoration: 'none' }}>
                  <Text style={toolEmoji}>🔍</Text>
                  <Text style={toolLabel}>Visa Finder</Text>
                </Link>
              </Column>
              <Column style={{ width: '33%', textAlign: 'center', padding: '8px' }}>
                <Link href={trackUrl("https://visas.guide/passport-index", "tool_passport")} style={{ textDecoration: 'none' }}>
                  <Text style={toolEmoji}>📊</Text>
                  <Text style={toolLabel}>Rankings</Text>
                </Link>
              </Column>
              <Column style={{ width: '33%', textAlign: 'center', padding: '8px' }}>
                <Link href={trackUrl("https://visas.guide/schengen-visa-guide", "tool_schengen")} style={{ textDecoration: 'none' }}>
                  <Text style={toolEmoji}>🇪🇺</Text>
                  <Text style={toolLabel}>Schengen</Text>
                </Link>
              </Column>
            </Row>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={socialLabel}>Connect with us</Text>
            <Row>
              <Column align="center">
                <Link href={trackUrl("https://facebook.com/visasguide", "fb")} style={socialIconLink}>
                  <Text style={socialIconText}>f</Text>
                </Link>
                <Link href={trackUrl("https://instagram.com/visasguide", "ig")} style={socialIconLink}>
                  <Text style={socialIconText}>📷</Text>
                </Link>
                <Link href={trackUrl("https://twitter.com/visasguide", "tw")} style={socialIconLink}>
                  <Text style={socialIconText}>𝕏</Text>
                </Link>
              </Column>
            </Row>
            
            <Text style={footerText}>
              You are receiving this email because you signed up at visas.guide
            </Text>
            <Text style={footerAddress}>
              5900 Balcones Drive, STE 100, Austin, TX 78731
            </Text>
            <Link href={unsubscribeUrl} style={unsubscribeLink}>
              Unsubscribe
            </Link>
            <Text style={copyright}>© 2025 Visas Guide</Text>
          </Section>

          {/* Tracking */}
          <Img src={trackingPixelUrl} width="1" height="1" alt="" style={{ display: 'none' }} />
        </Container>
      </Body>
    </Html>
  );
}

export default NewsletterEmail

// GetYourGuide-inspired clean styles
const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
}

const header = {
  padding: '32px 24px',
  backgroundColor: '#ffffff',
}

const greetingSection = {
  padding: '0 24px 32px',
}

const greetingTitle = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 12px',
  lineHeight: '1.2',
}

const greetingText = {
  fontSize: '16px',
  color: '#4a4a4a',
  margin: '0',
  lineHeight: '1.6',
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

const featuredCard = {
  borderRadius: '16px',
  overflow: 'hidden',
  backgroundColor: '#f7f7f7',
}

const featuredImg = {
  display: 'block',
  width: '100%',
  objectFit: 'cover' as const,
}

const placeholderImg = {
  backgroundColor: '#ff5533',
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
  color: '#ff5533',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
}

const featuredTitle = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 12px',
  lineHeight: '1.3',
}

const featuredExcerpt = {
  fontSize: '15px',
  color: '#666666',
  margin: '0 0 16px',
  lineHeight: '1.5',
}

const readMoreBtn = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#ff5533',
  margin: '0',
}

const articleItem = {
  padding: '16px 0',
  borderBottom: '1px solid #eeeeee',
}

const articleTitle = {
  fontSize: '16px',
  fontWeight: '500',
  color: '#1a1a1a',
  margin: '0',
  lineHeight: '1.4',
}

const articleArrow = {
  fontSize: '20px',
  color: '#ff5533',
  margin: '0',
  fontWeight: '300',
}

const destinationSection = {
  padding: '32px 16px',
  backgroundColor: '#1a1a1a',
}

const sectionHeadingWhite = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0 0 8px',
  textAlign: 'center' as const,
}

const sectionSubWhite = {
  fontSize: '15px',
  color: '#aaaaaa',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const destCard = {
  backgroundColor: '#2a2a2a',
  borderRadius: '12px',
  padding: '24px 16px',
  textAlign: 'center' as const,
}

const destFlag = {
  fontSize: '36px',
  margin: '0 0 8px',
}

const destName = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#ffffff',
  margin: '0 0 4px',
}

const destMeta = {
  fontSize: '12px',
  color: '#888888',
  margin: '0',
}

const primaryBtn = {
  backgroundColor: '#ff5533',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '16px 32px',
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
}

const dealImg = {
  borderRadius: '8px',
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
}

const toolsSection = {
  padding: '32px 24px',
  backgroundColor: '#f7f7f7',
  textAlign: 'center' as const,
}

const toolsTitle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 20px',
}

const toolEmoji = {
  fontSize: '28px',
  margin: '0 0 8px',
}

const toolLabel = {
  fontSize: '13px',
  fontWeight: '500',
  color: '#1a1a1a',
  margin: '0',
}

const footer = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#ffffff',
}

const socialLabel = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#666666',
  margin: '0 0 16px',
}

const socialIconLink = {
  display: 'inline-block',
  width: '40px',
  height: '40px',
  backgroundColor: '#f0f0f0',
  borderRadius: '50%',
  margin: '0 6px',
  textDecoration: 'none',
  lineHeight: '40px',
  textAlign: 'center' as const,
}

const socialIconText = {
  fontSize: '16px',
  color: '#1a1a1a',
  margin: '0',
  lineHeight: '40px',
}

const footerText = {
  fontSize: '13px',
  color: '#999999',
  margin: '24px 0 4px',
}

const footerAddress = {
  fontSize: '12px',
  color: '#bbbbbb',
  margin: '0 0 16px',
}

const unsubscribeLink = {
  fontSize: '13px',
  color: '#666666',
  textDecoration: 'underline',
}

const copyright = {
  fontSize: '12px',
  color: '#cccccc',
  margin: '16px 0 0',
}
