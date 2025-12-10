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
}

export const NewsletterEmail = ({
  subscriberName = "Traveler",
  blogPosts = [],
  countryGuides = [],
  affiliates = [],
  unsubscribeUrl = "https://visas.guide/unsubscribe",
}: NewsletterEmailProps) => (
  <Html>
    <Head />
    <Preview>Your weekly visa updates and travel guides from Visas.Guide</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Img
            src="https://visas.guide/favicon.png"
            width="50"
            height="50"
            alt="Visas.Guide"
            style={{ margin: '0 auto' }}
          />
          <Heading style={h1}>Visas.Guide</Heading>
          <Text style={tagline}>Your Trusted Visa Information Source</Text>
        </Section>

        <Hr style={divider} />

        {/* Welcome */}
        <Section style={section}>
          <Text style={greeting}>Hello {subscriberName}! 👋</Text>
          <Text style={text}>
            Welcome to your weekly dose of visa updates, travel guides, and essential information 
            to help you explore the world with confidence.
          </Text>
        </Section>

        {/* Latest Blog Posts */}
        {blogPosts.length > 0 && (
          <Section style={section}>
            <Heading style={h2}>📰 Latest from Our Blog</Heading>
            {blogPosts.map((post, index) => (
              <Section key={index} style={articleCard}>
                {post.featured_image_url && (
                  <Img
                    src={post.featured_image_url}
                    width="100%"
                    height="160"
                    alt={post.title}
                    style={articleImage}
                  />
                )}
                <Text style={articleTitle}>{post.title}</Text>
                <Text style={articleExcerpt}>{post.excerpt}</Text>
                <Link href={`https://visas.guide/blog/${post.slug}`} style={readMoreLink}>
                  Read More →
                </Link>
              </Section>
            ))}
          </Section>
        )}

        <Hr style={divider} />

        {/* Country Guides */}
        {countryGuides.length > 0 && (
          <Section style={section}>
            <Heading style={h2}>🌍 Popular Country Guides</Heading>
            <Text style={text}>
              Explore visa requirements and travel tips for these trending destinations:
            </Text>
            <Row>
              {countryGuides.map((country, index) => (
                <Column key={index} style={countryCard}>
                  <Link 
                    href={`https://visas.guide/countries/${country.slug}`} 
                    style={countryLink}
                  >
                    <Text style={countryFlag}>{country.flag_emoji}</Text>
                    <Text style={countryName}>{country.name}</Text>
                    {country.visa_free_destinations && country.visa_free_destinations > 0 && (
                      <Text style={countryBadge}>
                        {country.visa_free_destinations} visa-free
                      </Text>
                    )}
                  </Link>
                </Column>
              ))}
            </Row>
            <Button style={ctaButton} href="https://visas.guide/countries">
              View All Countries
            </Button>
          </Section>
        )}

        <Hr style={divider} />

        {/* Affiliate Section */}
        {affiliates.length > 0 && (
          <Section style={section}>
            <Heading style={h2}>✈️ Travel Essentials</Heading>
            <Text style={text}>
              Recommended products and services for your next trip:
            </Text>
            {affiliates.map((affiliate, index) => (
              <Section key={index} style={affiliateCard}>
                <Row>
                  <Column style={{ width: '80px' }}>
                    <Img
                      src={affiliate.image_url}
                      width="70"
                      height="70"
                      alt={affiliate.name}
                      style={affiliateImage}
                    />
                  </Column>
                  <Column style={{ paddingLeft: '15px' }}>
                    <Text style={affiliateName}>{affiliate.name}</Text>
                    <Text style={affiliateDescription}>{affiliate.description}</Text>
                    <Link href={affiliate.target_url} style={affiliateLink}>
                      Learn More →
                    </Link>
                  </Column>
                </Row>
              </Section>
            ))}
          </Section>
        )}

        <Hr style={divider} />

        {/* Quick Links */}
        <Section style={section}>
          <Heading style={h2}>🔗 Quick Links</Heading>
          <Row>
            <Column align="center">
              <Link href="https://visas.guide/visa-search" style={quickLink}>
                Visa Finder
              </Link>
            </Column>
            <Column align="center">
              <Link href="https://visas.guide/passport-index" style={quickLink}>
                Passport Rankings
              </Link>
            </Column>
            <Column align="center">
              <Link href="https://visas.guide/schengen-visa-guide" style={quickLink}>
                Schengen Guide
              </Link>
            </Column>
          </Row>
        </Section>

        <Hr style={divider} />

        {/* Footer */}
        <Section style={footer}>
          <Img
            src="https://visas.guide/favicon.png"
            width="32"
            height="32"
            alt="Visas.Guide"
            style={{ margin: '0 auto 10px' }}
          />
          <Text style={footerText}>
            You're receiving this email because you subscribed to Visas.Guide newsletter.
          </Text>
          <Text style={footerText}>
            5900 Balcones Drive, STE 100, Austin, TX 78731
          </Text>
          <Link href={unsubscribeUrl} style={unsubscribeLink}>
            Unsubscribe
          </Link>
          <Text style={footerSocial}>
            <Link href="https://twitter.com/visasguide" style={socialLink}>Twitter</Link>
            {' • '}
            <Link href="https://visas.guide/feed" style={socialLink}>RSS Feed</Link>
          </Text>
          <Text style={copyright}>
            © 2025 Visas.Guide. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default NewsletterEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif",
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}

const header = {
  backgroundColor: '#1e3a5f',
  padding: '30px 20px',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#d4a853',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '10px 0 5px',
}

const tagline = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '0',
  opacity: 0.9,
}

const section = {
  padding: '25px 30px',
}

const greeting = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e3a5f',
  margin: '0 0 10px',
}

const text = {
  color: '#4a5568',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 15px',
}

const h2 = {
  color: '#1e3a5f',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 15px',
}

const divider = {
  borderColor: '#e2e8f0',
  margin: '0',
}

const articleCard = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '15px',
  marginBottom: '15px',
  border: '1px solid #e2e8f0',
}

const articleImage = {
  borderRadius: '6px',
  objectFit: 'cover' as const,
  marginBottom: '12px',
}

const articleTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1e3a5f',
  margin: '0 0 8px',
}

const articleExcerpt = {
  fontSize: '14px',
  color: '#64748b',
  lineHeight: '1.5',
  margin: '0 0 10px',
}

const readMoreLink = {
  color: '#d4a853',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
}

const countryCard = {
  textAlign: 'center' as const,
  padding: '10px',
}

const countryLink = {
  textDecoration: 'none',
}

const countryFlag = {
  fontSize: '32px',
  margin: '0 0 5px',
}

const countryName = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1e3a5f',
  margin: '0 0 3px',
}

const countryBadge = {
  fontSize: '11px',
  color: '#22c55e',
  margin: '0',
}

const ctaButton = {
  backgroundColor: '#d4a853',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
  display: 'block',
  margin: '20px auto 0',
  maxWidth: '200px',
}

const affiliateCard = {
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  padding: '15px',
  marginBottom: '12px',
  border: '1px solid #fde68a',
}

const affiliateImage = {
  borderRadius: '8px',
  objectFit: 'cover' as const,
}

const affiliateName = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#1e3a5f',
  margin: '0 0 5px',
}

const affiliateDescription = {
  fontSize: '13px',
  color: '#64748b',
  margin: '0 0 8px',
  lineHeight: '1.4',
}

const affiliateLink = {
  color: '#d4a853',
  fontSize: '13px',
  fontWeight: '600',
  textDecoration: 'none',
}

const quickLink = {
  display: 'inline-block',
  backgroundColor: '#1e3a5f',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '500',
  padding: '8px 16px',
  borderRadius: '4px',
  textDecoration: 'none',
  margin: '5px',
}

const footer = {
  backgroundColor: '#f8fafc',
  padding: '25px 30px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '0 0 8px',
}

const unsubscribeLink = {
  color: '#64748b',
  fontSize: '12px',
  textDecoration: 'underline',
}

const footerSocial = {
  margin: '15px 0',
  fontSize: '12px',
}

const socialLink = {
  color: '#1e3a5f',
  textDecoration: 'none',
}

const copyright = {
  color: '#cbd5e1',
  fontSize: '11px',
  margin: '10px 0 0',
}
