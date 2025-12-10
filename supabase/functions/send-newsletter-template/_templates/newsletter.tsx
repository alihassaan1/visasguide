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
  Hr,
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
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
      </Head>
      <Preview>✈️ {subscriberName}, your weekly visa intel is here</Preview>
      <Body style={main}>
        <Container style={container}>
          
          {/* Minimal Header */}
          <Section style={header}>
            <Row>
              <Column>
                <Img
                  src="https://visas.guide/logo.png"
                  width="140"
                  height="auto"
                  alt="Visas.Guide"
                />
              </Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={dateText}>Weekly Update</Text>
              </Column>
            </Row>
          </Section>

          {/* Hero Section */}
          <Section style={heroSection}>
            <Text style={heroEmoji}>🌍</Text>
            <Heading style={heroTitle}>
              Hey {subscriberName}
            </Heading>
            <Text style={heroSubtitle}>
              Your passport to global visa insights awaits
            </Text>
          </Section>

          {/* Featured Article - Large Card */}
          {blogPosts.length > 0 && (
            <Section style={contentSection}>
              <Text style={sectionTag}>FEATURED</Text>
              
              <Link 
                href={trackUrl(`https://visas.guide/blog/${blogPosts[0].slug}`, `featured_${blogPosts[0].slug}`)}
                style={{ textDecoration: 'none' }}
              >
                <Section style={featuredCard}>
                  {blogPosts[0].featured_image_url && (
                    <Img
                      src={blogPosts[0].featured_image_url}
                      width="100%"
                      height="200"
                      alt={blogPosts[0].title}
                      style={featuredImage}
                    />
                  )}
                  <Section style={featuredContent}>
                    <Text style={featuredTitle}>{blogPosts[0].title}</Text>
                    <Text style={featuredExcerpt}>
                      {blogPosts[0].excerpt?.substring(0, 120)}...
                    </Text>
                    <Text style={readLink}>Read article →</Text>
                  </Section>
                </Section>
              </Link>

              {/* Other Articles - Minimal List */}
              {blogPosts.slice(1).map((post, index) => (
                <Link 
                  key={index}
                  href={trackUrl(`https://visas.guide/blog/${post.slug}`, `blog_${post.slug}`)}
                  style={{ textDecoration: 'none' }}
                >
                  <Section style={articleRow}>
                    <Row>
                      <Column style={{ width: '70%' }}>
                        <Text style={articleTitle}>{post.title}</Text>
                        <Text style={articleMeta}>5 min read</Text>
                      </Column>
                      <Column style={{ width: '30%', textAlign: 'right', verticalAlign: 'middle' }}>
                        <Text style={arrowIcon}>→</Text>
                      </Column>
                    </Row>
                  </Section>
                </Link>
              ))}
            </Section>
          )}

          {/* Destinations Grid */}
          {countryGuides.length > 0 && (
            <Section style={destinationsSection}>
              <Text style={sectionTagDark}>TRENDING DESTINATIONS</Text>
              <Heading style={sectionTitleWhite}>Where to next?</Heading>
              
              <Row>
                {countryGuides.slice(0, 2).map((country, index) => (
                  <Column key={index} style={{ width: '50%', padding: '6px' }}>
                    <Link 
                      href={trackUrl(`https://visas.guide/countries/${country.slug}`, `country_${country.slug}`)}
                      style={{ textDecoration: 'none' }}
                    >
                      <Section style={destinationCard}>
                        <Text style={destinationFlag}>{country.flag_emoji}</Text>
                        <Text style={destinationName}>{country.name}</Text>
                        {country.visa_free_destinations && country.visa_free_destinations > 0 && (
                          <Text style={destinationBadge}>
                            {country.visa_free_destinations} destinations
                          </Text>
                        )}
                      </Section>
                    </Link>
                  </Column>
                ))}
              </Row>
              <Row>
                {countryGuides.slice(2, 4).map((country, index) => (
                  <Column key={index} style={{ width: '50%', padding: '6px' }}>
                    <Link 
                      href={trackUrl(`https://visas.guide/countries/${country.slug}`, `country_${country.slug}`)}
                      style={{ textDecoration: 'none' }}
                    >
                      <Section style={destinationCard}>
                        <Text style={destinationFlag}>{country.flag_emoji}</Text>
                        <Text style={destinationName}>{country.name}</Text>
                        {country.visa_free_destinations && country.visa_free_destinations > 0 && (
                          <Text style={destinationBadge}>
                            {country.visa_free_destinations} destinations
                          </Text>
                        )}
                      </Section>
                    </Link>
                  </Column>
                ))}
              </Row>

              <Button 
                style={exploreBtn}
                href={trackUrl("https://visas.guide/countries", "explore_all")}
              >
                Explore all countries
              </Button>
            </Section>
          )}

          {/* Deals Section - Clean Cards */}
          {affiliates.length > 0 && (
            <Section style={contentSection}>
              <Text style={sectionTag}>EXCLUSIVE DEALS</Text>
              <Heading style={sectionTitle}>Travel essentials</Heading>
              
              {affiliates.map((affiliate, index) => (
                <Link 
                  key={index}
                  href={trackUrl(affiliate.target_url, `deal_${affiliate.name}`)}
                  style={{ textDecoration: 'none' }}
                >
                  <Section style={dealCard}>
                    <Row>
                      <Column style={{ width: '60px' }}>
                        <Img
                          src={affiliate.image_url}
                          width="48"
                          height="48"
                          alt={affiliate.name}
                          style={dealIcon}
                        />
                      </Column>
                      <Column style={{ paddingLeft: '12px' }}>
                        <Text style={dealName}>{affiliate.name}</Text>
                        <Text style={dealDesc}>{affiliate.description}</Text>
                      </Column>
                      <Column style={{ width: '60px', textAlign: 'right', verticalAlign: 'middle' }}>
                        <Text style={dealArrow}>→</Text>
                      </Column>
                    </Row>
                  </Section>
                </Link>
              ))}
            </Section>
          )}

          {/* Quick Links - Pills */}
          <Section style={quickSection}>
            <Row>
              <Column align="center">
                <Link href={trackUrl("https://visas.guide/visa-search", "quick_search")} style={pillLink}>
                  🔍 Visa Finder
                </Link>
                <Link href={trackUrl("https://visas.guide/passport-index", "quick_passport")} style={pillLink}>
                  📊 Rankings
                </Link>
                <Link href={trackUrl("https://visas.guide/schengen-visa-guide", "quick_schengen")} style={pillLink}>
                  🇪🇺 Schengen
                </Link>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Social Section */}
          <Section style={socialSection}>
            <Text style={socialTitle}>Follow our journey</Text>
            <Row>
              <Column align="center">
                <Link href={trackUrl("https://facebook.com/visasguide", "social_fb")} style={socialLink}>
                  <Img 
                    src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg" 
                    width="20" 
                    height="20" 
                    alt="Facebook"
                    style={socialIcon}
                  />
                </Link>
                <Link href={trackUrl("https://instagram.com/visasguide", "social_ig")} style={socialLink}>
                  <Img 
                    src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg" 
                    width="20" 
                    height="20" 
                    alt="Instagram"
                    style={socialIcon}
                  />
                </Link>
                <Link href={trackUrl("https://twitter.com/visasguide", "social_tw")} style={socialLink}>
                  <Img 
                    src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/x.svg" 
                    width="20" 
                    height="20" 
                    alt="X"
                    style={socialIcon}
                  />
                </Link>
              </Column>
            </Row>
          </Section>

          {/* Minimal Footer */}
          <Section style={footer}>
            <Img
              src="https://visas.guide/favicon.png"
              width="32"
              height="32"
              alt="V"
              style={{ margin: '0 auto 16px' }}
            />
            <Text style={footerText}>
              You received this because you subscribed to Visas.Guide
            </Text>
            <Text style={footerAddress}>
              5900 Balcones Drive, STE 100, Austin, TX 78731
            </Text>
            <Link href={unsubscribeUrl} style={unsubLink}>
              Unsubscribe
            </Link>
            <Text style={copyright}>© 2025 Visas.Guide</Text>
          </Section>

          {/* Tracking Pixel */}
          <Img src={trackingPixelUrl} width="1" height="1" alt="" style={{ display: 'none' }} />
        </Container>
      </Body>
    </Html>
  );
}

export default NewsletterEmail

// 2024/2025 Trendy Minimal Styles
const main = {
  backgroundColor: '#f8f9fa',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '520px',
}

const header = {
  padding: '32px 24px 24px',
  borderBottom: '1px solid #f0f0f0',
}

const dateText = {
  fontSize: '12px',
  color: '#8c8c8c',
  margin: '0',
  fontWeight: '500',
  letterSpacing: '0.5px',
}

const heroSection = {
  padding: '48px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#fafafa',
}

const heroEmoji = {
  fontSize: '48px',
  margin: '0 0 16px',
}

const heroTitle = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 8px',
  lineHeight: '1.2',
}

const heroSubtitle = {
  fontSize: '16px',
  color: '#666666',
  margin: '0',
  fontWeight: '400',
}

const contentSection = {
  padding: '32px 24px',
}

const sectionTag = {
  fontSize: '11px',
  fontWeight: '600',
  color: '#c9a227',
  letterSpacing: '1.5px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
}

const sectionTitle = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 24px',
  lineHeight: '1.3',
}

const featuredCard = {
  borderRadius: '16px',
  overflow: 'hidden',
  backgroundColor: '#f5f5f5',
  marginBottom: '24px',
}

const featuredImage = {
  width: '100%',
  height: '200px',
  objectFit: 'cover' as const,
  display: 'block',
}

const featuredContent = {
  padding: '20px',
}

const featuredTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 8px',
  lineHeight: '1.4',
}

const featuredExcerpt = {
  fontSize: '14px',
  color: '#666666',
  margin: '0 0 12px',
  lineHeight: '1.6',
}

const readLink = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#c9a227',
  margin: '0',
}

const articleRow = {
  padding: '16px 0',
  borderBottom: '1px solid #f0f0f0',
}

const articleTitle = {
  fontSize: '15px',
  fontWeight: '500',
  color: '#1a1a1a',
  margin: '0 0 4px',
  lineHeight: '1.4',
}

const articleMeta = {
  fontSize: '12px',
  color: '#999999',
  margin: '0',
}

const arrowIcon = {
  fontSize: '20px',
  color: '#c9a227',
  margin: '0',
}

const destinationsSection = {
  padding: '32px 18px',
  backgroundColor: '#1a1a2e',
}

const sectionTagDark = {
  fontSize: '11px',
  fontWeight: '600',
  color: '#c9a227',
  letterSpacing: '1.5px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
}

const sectionTitleWhite = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0 0 24px',
  lineHeight: '1.3',
  textAlign: 'center' as const,
}

const destinationCard = {
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '20px 16px',
  textAlign: 'center' as const,
}

const destinationFlag = {
  fontSize: '32px',
  margin: '0 0 8px',
}

const destinationName = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#ffffff',
  margin: '0 0 4px',
}

const destinationBadge = {
  fontSize: '11px',
  color: 'rgba(255,255,255,0.6)',
  margin: '0',
}

const exploreBtn = {
  backgroundColor: '#c9a227',
  borderRadius: '100px',
  color: '#1a1a2e',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '14px 28px',
  display: 'block',
  textAlign: 'center' as const,
  margin: '24px auto 0',
  maxWidth: '200px',
}

const dealCard = {
  padding: '16px',
  backgroundColor: '#fafafa',
  borderRadius: '12px',
  marginBottom: '12px',
}

const dealIcon = {
  borderRadius: '10px',
}

const dealName = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 2px',
}

const dealDesc = {
  fontSize: '13px',
  color: '#666666',
  margin: '0',
}

const dealArrow = {
  fontSize: '18px',
  color: '#c9a227',
  margin: '0',
}

const quickSection = {
  padding: '24px',
  textAlign: 'center' as const,
  backgroundColor: '#fafafa',
}

const pillLink = {
  display: 'inline-block',
  backgroundColor: '#1a1a2e',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '500',
  padding: '10px 16px',
  borderRadius: '100px',
  textDecoration: 'none',
  margin: '4px',
}

const divider = {
  borderColor: '#f0f0f0',
  margin: '0',
}

const socialSection = {
  padding: '32px 24px',
  textAlign: 'center' as const,
}

const socialTitle = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#666666',
  margin: '0 0 16px',
}

const socialLink = {
  display: 'inline-block',
  margin: '0 8px',
  padding: '12px',
  backgroundColor: '#f5f5f5',
  borderRadius: '50%',
}

const socialIcon = {
  display: 'block',
  filter: 'brightness(0)',
  opacity: 0.6,
}

const footer = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#fafafa',
}

const footerText = {
  fontSize: '12px',
  color: '#999999',
  margin: '0 0 4px',
}

const footerAddress = {
  fontSize: '11px',
  color: '#bbbbbb',
  margin: '0 0 16px',
}

const unsubLink = {
  fontSize: '12px',
  color: '#666666',
  textDecoration: 'underline',
}

const copyright = {
  fontSize: '11px',
  color: '#cccccc',
  margin: '16px 0 0',
}
