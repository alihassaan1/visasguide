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
  // Generate tracked URLs
  const trackUrl = (url: string, linkName: string) => {
    const trackingUrl = `https://akmyvslglxzdnfqfcndj.supabase.co/functions/v1/track-email-click?url=${encodeURIComponent(url)}&cid=${campaignId}&email=${encodeURIComponent(subscriberEmail)}&link=${encodeURIComponent(linkName)}`;
    return trackingUrl;
  };

  const trackingPixelUrl = `https://akmyvslglxzdnfqfcndj.supabase.co/functions/v1/track-email-open?cid=${campaignId}&email=${encodeURIComponent(subscriberEmail)}`;

  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
      </Head>
      <Preview>🌍 Your weekly visa updates, travel guides & exclusive deals from Visas.Guide</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Modern Gradient Header */}
          <Section style={header}>
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ textAlign: 'center' }}>
              <tr>
                <td>
                  <Img
                    src="https://visas.guide/logo.png"
                    width="180"
                    height="auto"
                    alt="Visas.Guide"
                    style={{ margin: '0 auto 15px' }}
                  />
                  <Text style={headerTagline}>Your Global Visa & Travel Companion</Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* Welcome Section with Gradient Accent */}
          <Section style={welcomeSection}>
            <table width="100%" cellPadding="0" cellSpacing="0">
              <tr>
                <td style={accentBar}></td>
              </tr>
            </table>
            <Text style={greeting}>Hey {subscriberName}! 👋</Text>
            <Text style={welcomeText}>
              Ready for your weekly travel intel? We've curated the latest visa updates, 
              trending destinations, and exclusive deals just for you.
            </Text>
          </Section>

          {/* Latest Blog Posts - Card Style */}
          {blogPosts.length > 0 && (
            <Section style={section}>
              <table width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  <td>
                    <Text style={sectionLabel}>FRESH OFF THE PRESS</Text>
                    <Heading style={sectionTitle}>Latest Travel Insights</Heading>
                  </td>
                </tr>
              </table>
              
              {blogPosts.map((post, index) => (
                <Link 
                  key={index} 
                  href={trackUrl(`https://visas.guide/blog/${post.slug}`, `blog_${post.slug}`)} 
                  style={{ textDecoration: 'none' }}
                >
                  <table width="100%" cellPadding="0" cellSpacing="0" style={blogCard}>
                    <tr>
                      {post.featured_image_url && (
                        <td style={{ width: '120px', verticalAlign: 'top' }}>
                          <Img
                            src={post.featured_image_url}
                            width="110"
                            height="80"
                            alt={post.title}
                            style={blogImage}
                          />
                        </td>
                      )}
                      <td style={{ paddingLeft: post.featured_image_url ? '15px' : '0', verticalAlign: 'top' }}>
                        <Text style={blogTitle}>{post.title}</Text>
                        <Text style={blogExcerpt}>{post.excerpt?.substring(0, 100)}...</Text>
                        <Text style={readMore}>Read Article →</Text>
                      </td>
                    </tr>
                  </table>
                </Link>
              ))}
            </Section>
          )}

          {/* Country Guides - Modern Grid */}
          {countryGuides.length > 0 && (
            <Section style={countriesSection}>
              <table width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  <td>
                    <Text style={sectionLabelLight}>TRENDING NOW</Text>
                    <Heading style={sectionTitleLight}>Popular Destinations</Heading>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  {countryGuides.slice(0, 4).map((country, index) => (
                    <td key={index} style={{ width: '25%', padding: '8px', textAlign: 'center', verticalAlign: 'top' }}>
                      <Link 
                        href={trackUrl(`https://visas.guide/countries/${country.slug}`, `country_${country.slug}`)} 
                        style={{ textDecoration: 'none' }}
                      >
                        <table width="100%" cellPadding="0" cellSpacing="0" style={countryCard}>
                          <tr>
                            <td style={{ textAlign: 'center', padding: '15px 10px' }}>
                              <Text style={countryFlag}>{country.flag_emoji}</Text>
                              <Text style={countryName}>{country.name}</Text>
                              {country.visa_free_destinations && country.visa_free_destinations > 0 && (
                                <Text style={countryBadge}>
                                  ✓ {country.visa_free_destinations} visa-free
                                </Text>
                              )}
                            </td>
                          </tr>
                        </table>
                      </Link>
                    </td>
                  ))}
                </tr>
              </table>
              
              <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginTop: '20px' }}>
                <tr>
                  <td style={{ textAlign: 'center' }}>
                    <Button 
                      style={exploreButton} 
                      href={trackUrl("https://visas.guide/countries", "explore_countries")}
                    >
                      Explore All Countries
                    </Button>
                  </td>
                </tr>
              </table>
            </Section>
          )}

          {/* Affiliate Products - Premium Cards */}
          {affiliates.length > 0 && (
            <Section style={section}>
              <table width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                  <td>
                    <Text style={sectionLabel}>EXCLUSIVE DEALS</Text>
                    <Heading style={sectionTitle}>Travel Essentials</Heading>
                    <Text style={dealSubtext}>Handpicked products to enhance your journey</Text>
                  </td>
                </tr>
              </table>
              
              {affiliates.map((affiliate, index) => (
                <Link 
                  key={index} 
                  href={trackUrl(affiliate.target_url, `affiliate_${affiliate.name}`)} 
                  style={{ textDecoration: 'none' }}
                >
                  <table width="100%" cellPadding="0" cellSpacing="0" style={affiliateCard}>
                    <tr>
                      <td style={{ width: '80px', verticalAlign: 'middle' }}>
                        <Img
                          src={affiliate.image_url}
                          width="65"
                          height="65"
                          alt={affiliate.name}
                          style={affiliateImage}
                        />
                      </td>
                      <td style={{ paddingLeft: '15px', verticalAlign: 'middle' }}>
                        <Text style={affiliateName}>{affiliate.name}</Text>
                        <Text style={affiliateDesc}>{affiliate.description}</Text>
                      </td>
                      <td style={{ width: '80px', textAlign: 'right', verticalAlign: 'middle' }}>
                        <Text style={affiliateCta}>Get Deal →</Text>
                      </td>
                    </tr>
                  </table>
                </Link>
              ))}
            </Section>
          )}

          {/* Quick Access Links */}
          <Section style={quickLinksSection}>
            <table width="100%" cellPadding="0" cellSpacing="0">
              <tr>
                <td style={{ textAlign: 'center', paddingBottom: '15px' }}>
                  <Text style={quickLinksTitle}>Quick Access</Text>
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center' }}>
                  <Link href={trackUrl("https://visas.guide/visa-search", "quick_visa_search")} style={quickLink}>
                    🔍 Visa Finder
                  </Link>
                  <Link href={trackUrl("https://visas.guide/passport-index", "quick_passport")} style={quickLink}>
                    📊 Passport Rankings
                  </Link>
                  <Link href={trackUrl("https://visas.guide/schengen-visa-guide", "quick_schengen")} style={quickLink}>
                    🇪🇺 Schengen Guide
                  </Link>
                </td>
              </tr>
            </table>
          </Section>

          {/* Modern Footer */}
          <Section style={footer}>
            {/* Social Links */}
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: '20px' }}>
              <tr>
                <td style={{ textAlign: 'center' }}>
                  <Text style={followUs}>Follow Us</Text>
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center' }}>
                  <Link href={trackUrl("https://facebook.com/visasguide", "social_facebook")} style={socialButton}>
                    <Img 
                      src="https://cdn-icons-png.flaticon.com/512/124/124010.png" 
                      width="28" 
                      height="28" 
                      alt="Facebook"
                      style={{ display: 'inline-block' }}
                    />
                  </Link>
                  <Link href={trackUrl("https://instagram.com/visasguide", "social_instagram")} style={socialButton}>
                    <Img 
                      src="https://cdn-icons-png.flaticon.com/512/174/174855.png" 
                      width="28" 
                      height="28" 
                      alt="Instagram"
                      style={{ display: 'inline-block' }}
                    />
                  </Link>
                  <Link href={trackUrl("https://twitter.com/visasguide", "social_twitter")} style={socialButton}>
                    <Img 
                      src="https://cdn-icons-png.flaticon.com/512/733/733579.png" 
                      width="28" 
                      height="28" 
                      alt="Twitter"
                      style={{ display: 'inline-block' }}
                    />
                  </Link>
                </td>
              </tr>
            </table>

            <Hr style={footerDivider} />

            <table width="100%" cellPadding="0" cellSpacing="0">
              <tr>
                <td style={{ textAlign: 'center' }}>
                  <Img
                    src="https://visas.guide/favicon.png"
                    width="40"
                    height="40"
                    alt="Visas.Guide"
                    style={{ margin: '15px auto' }}
                  />
                  <Text style={footerText}>
                    You're receiving this because you subscribed to Visas.Guide newsletter.
                  </Text>
                  <Text style={footerAddress}>
                    5900 Balcones Drive, STE 100, Austin, TX 78731
                  </Text>
                  <Link href={unsubscribeUrl} style={unsubscribeLink}>
                    Unsubscribe from this list
                  </Link>
                  <Text style={copyright}>
                    © 2025 Visas.Guide. All rights reserved.
                  </Text>
                </td>
              </tr>
            </table>
          </Section>

          {/* Tracking Pixel */}
          <Img 
            src={trackingPixelUrl} 
            width="1" 
            height="1" 
            alt="" 
            style={{ display: 'block', width: '1px', height: '1px' }}
          />
        </Container>
      </Body>
    </Html>
  );
}

export default NewsletterEmail

// Modern Styles
const main = {
  backgroundColor: '#f0f4f8',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  padding: '40px 20px',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
}

const header = {
  background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
  padding: '40px 30px',
  textAlign: 'center' as const,
}

const headerTagline = {
  color: 'rgba(255, 255, 255, 0.85)',
  fontSize: '14px',
  margin: '0',
  letterSpacing: '0.5px',
}

const welcomeSection = {
  padding: '30px',
}

const accentBar = {
  height: '4px',
  background: 'linear-gradient(90deg, #d4a853, #e8c476)',
  borderRadius: '2px',
  marginBottom: '20px',
}

const greeting = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#1e3a5f',
  margin: '0 0 10px',
}

const welcomeText = {
  color: '#64748b',
  fontSize: '15px',
  lineHeight: '1.7',
  margin: '0',
}

const section = {
  padding: '30px',
}

const sectionLabel = {
  fontSize: '11px',
  fontWeight: '600',
  color: '#d4a853',
  letterSpacing: '1.5px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
}

const sectionTitle = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#1e3a5f',
  margin: '0 0 20px',
}

const sectionLabelLight = {
  fontSize: '11px',
  fontWeight: '600',
  color: 'rgba(255,255,255,0.7)',
  letterSpacing: '1.5px',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
}

const sectionTitleLight = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0 0 20px',
}

const blogCard = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '15px',
  marginBottom: '12px',
  border: '1px solid #e2e8f0',
}

const blogImage = {
  borderRadius: '8px',
  objectFit: 'cover' as const,
}

const blogTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1e3a5f',
  margin: '0 0 6px',
  lineHeight: '1.4',
}

const blogExcerpt = {
  fontSize: '13px',
  color: '#64748b',
  lineHeight: '1.5',
  margin: '0 0 8px',
}

const readMore = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#d4a853',
  margin: '0',
}

const countriesSection = {
  background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
  padding: '30px',
}

const countryCard = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  backdropFilter: 'blur(10px)',
}

const countryFlag = {
  fontSize: '36px',
  margin: '0 0 8px',
}

const countryName = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#ffffff',
  margin: '0 0 4px',
}

const countryBadge = {
  fontSize: '10px',
  color: '#86efac',
  margin: '0',
  fontWeight: '500',
}

const exploreButton = {
  backgroundColor: '#d4a853',
  borderRadius: '25px',
  color: '#1e3a5f',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '14px 32px',
  display: 'inline-block',
}

const dealSubtext = {
  fontSize: '14px',
  color: '#94a3b8',
  margin: '0 0 20px',
}

const affiliateCard = {
  backgroundColor: '#fffbeb',
  borderRadius: '12px',
  padding: '18px',
  marginBottom: '12px',
  border: '1px solid #fde68a',
}

const affiliateImage = {
  borderRadius: '10px',
  objectFit: 'cover' as const,
}

const affiliateName = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#1e3a5f',
  margin: '0 0 4px',
}

const affiliateDesc = {
  fontSize: '12px',
  color: '#64748b',
  margin: '0',
  lineHeight: '1.4',
}

const affiliateCta = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#d4a853',
  margin: '0',
}

const quickLinksSection = {
  backgroundColor: '#f8fafc',
  padding: '25px 30px',
  textAlign: 'center' as const,
}

const quickLinksTitle = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#94a3b8',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
  margin: '0',
}

const quickLink = {
  display: 'inline-block',
  backgroundColor: '#1e3a5f',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '500',
  padding: '10px 16px',
  borderRadius: '20px',
  textDecoration: 'none',
  margin: '5px',
}

const footer = {
  backgroundColor: '#1e3a5f',
  padding: '30px',
  textAlign: 'center' as const,
}

const followUs = {
  fontSize: '12px',
  fontWeight: '600',
  color: 'rgba(255,255,255,0.7)',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
  margin: '0 0 15px',
}

const socialButton = {
  display: 'inline-block',
  margin: '0 8px',
  padding: '10px',
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderRadius: '50%',
}

const footerDivider = {
  borderColor: 'rgba(255,255,255,0.1)',
  margin: '20px 0',
}

const footerText = {
  color: 'rgba(255,255,255,0.6)',
  fontSize: '12px',
  margin: '0 0 6px',
}

const footerAddress = {
  color: 'rgba(255,255,255,0.5)',
  fontSize: '11px',
  margin: '0 0 15px',
}

const unsubscribeLink = {
  color: 'rgba(255,255,255,0.7)',
  fontSize: '12px',
  textDecoration: 'underline',
}

const copyright = {
  color: 'rgba(255,255,255,0.4)',
  fontSize: '11px',
  margin: '15px 0 0',
}
