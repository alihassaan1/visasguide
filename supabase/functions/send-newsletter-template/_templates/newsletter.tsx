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
  featured_image_url?: string | null;
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

const SUPABASE_URL = 'https://awiytryceqehqapytfgn.supabase.co';
const SITE_URL = 'https://visas.guide';
const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&h=630&fit=crop&q=80';

export const NewsletterEmail = ({
  subscriberName = 'Traveler',
  blogPosts = [],
  countryGuides = [],
  affiliates = [],
  unsubscribeUrl = `${SITE_URL}/unsubscribe`,
  campaignId = '',
  subscriberEmail = '',
}: NewsletterEmailProps) => {
  const track = (url: string, linkName: string) =>
    `${SUPABASE_URL}/functions/v1/track-email-click?url=${encodeURIComponent(
      url
    )}&cid=${campaignId}&email=${encodeURIComponent(subscriberEmail)}&link=${encodeURIComponent(linkName)}`;

  const pixelUrl = `${SUPABASE_URL}/functions/v1/track-email-open?cid=${campaignId}&email=${encodeURIComponent(subscriberEmail)}`;

  const today = new Date();
  const issueDate = today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const featured = blogPosts[0];
  const rest = blogPosts.slice(1, 4);
  const featuredImg =
    featured?.featured_image_url && featured.featured_image_url.startsWith('http')
      ? featured.featured_image_url
      : FALLBACK_IMG;

  return (
    <Html>
      <Head />
      <Preview>
        {subscriberName}, your weekly visa briefing — new guides, destinations and travel intel inside.
      </Preview>
      <Body style={main}>
        <Container style={wrapper}>
          {/* Brand bar */}
          <Section style={brandBar}>
            <Row>
              <Column>
                <Link href={track(SITE_URL, 'logo')} style={brandLink}>
                  visas<span style={brandDot}>.</span>guide
                </Link>
              </Column>
              <Column align="right">
                <Text style={issueMeta}>Weekly Briefing · {issueDate}</Text>
              </Column>
            </Row>
          </Section>

          <Container style={card}>
            {/* Hero */}
            <Section style={hero}>
              <Text style={kicker}>The Visas Guide Weekly</Text>
              <Heading as="h1" style={heroTitle}>
                Hi {subscriberName}, here's where the world is open this week.
              </Heading>
              <Text style={heroSubtitle}>
                A short, useful read — fresh visa updates, destination guides, and one travel tip you can actually use.
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Featured story */}
            {featured && (
              <Section style={{ padding: '0 32px' }}>
                <Text style={sectionLabel}>Featured story</Text>
                <Link
                  href={track(`${SITE_URL}/blog/${featured.slug}`, `featured_${featured.slug}`)}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Img
                    src={featuredImg}
                    alt={featured.title}
                    width="536"
                    height="280"
                    style={featuredImage}
                  />
                  <Heading as="h2" style={featuredTitle}>
                    {featured.title}
                  </Heading>
                  <Text style={featuredExcerpt}>
                    {featured.excerpt || 'Read the full briefing on Visas Guide.'}
                  </Text>
                  <Text style={readMore}>Read the full story →</Text>
                </Link>
              </Section>
            )}

            {/* More stories */}
            {rest.length > 0 && (
              <Section style={{ padding: '8px 32px 0' }}>
                <Hr style={hrLight} />
                <Text style={sectionLabel}>Also worth your time</Text>
                {rest.map((post) => (
                  <Link
                    key={post.slug}
                    href={track(`${SITE_URL}/blog/${post.slug}`, `story_${post.slug}`)}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Row style={storyRow}>
                      <Column style={{ width: '110px', verticalAlign: 'top' }}>
                        <Img
                          src={
                            post.featured_image_url && post.featured_image_url.startsWith('http')
                              ? post.featured_image_url
                              : FALLBACK_IMG
                          }
                          alt={post.title}
                          width="100"
                          height="74"
                          style={storyThumb}
                        />
                      </Column>
                      <Column style={{ verticalAlign: 'top', paddingLeft: '12px' }}>
                        <Text style={storyTitle}>{post.title}</Text>
                        <Text style={storyExcerpt}>
                          {(post.excerpt || '').slice(0, 110)}
                          {post.excerpt && post.excerpt.length > 110 ? '…' : ''}
                        </Text>
                      </Column>
                    </Row>
                  </Link>
                ))}
              </Section>
            )}

            {/* Destinations */}
            {countryGuides.length > 0 && (
              <Section style={{ padding: '24px 32px 0' }}>
                <Hr style={hrLight} />
                <Text style={sectionLabel}>Trending destinations</Text>
                <Row>
                  {countryGuides.slice(0, 4).map((c) => (
                    <Column key={c.slug} style={destCol} align="center">
                      <Link
                        href={track(`${SITE_URL}/${c.slug}`, `dest_${c.slug}`)}
                        style={destLink}
                      >
                        <Text style={destFlag}>{c.flag_emoji || '🌍'}</Text>
                        <Text style={destName}>{c.name}</Text>
                        {typeof c.visa_free_destinations === 'number' && (
                          <Text style={destMeta}>
                            {c.visa_free_destinations} visa-free
                          </Text>
                        )}
                      </Link>
                    </Column>
                  ))}
                </Row>
              </Section>
            )}

            {/* Travel tip */}
            <Section style={{ padding: '28px 32px 0' }}>
              <Hr style={hrLight} />
              <div style={tipBox}>
                <Text style={tipLabel}>💡 Travel tip of the week</Text>
                <Text style={tipText}>
                  Save a PDF copy of your passport and active visas to a folder you can access
                  offline. If your phone dies or roaming fails, you'll still have everything you
                  need at immigration.
                </Text>
              </div>
            </Section>

            {/* CTA */}
            <Section style={{ padding: '28px 32px 8px', textAlign: 'center' as const }}>
              <Button
                href={track(`${SITE_URL}/blog`, 'main_cta')}
                style={ctaButton}
              >
                Read more on Visas Guide
              </Button>
              <Text style={ctaSub}>
                Or check{' '}
                <Link href={track(`${SITE_URL}/etias`, 'cta_etias')} style={inlineLink}>
                  ETIAS updates
                </Link>{' '}
                ·{' '}
                <Link href={track(`${SITE_URL}/visa-news`, 'cta_news')} style={inlineLink}>
                  Latest visa news
                </Link>
              </Text>
            </Section>

            {/* Sponsored */}
            {affiliates.length > 0 && (
              <Section style={{ padding: '24px 32px 0' }}>
                <Hr style={hrLight} />
                <Text style={sectionLabel}>Sponsored — partner picks</Text>
                {affiliates.slice(0, 2).map((a) => (
                  <Link
                    key={a.target_url}
                    href={track(a.target_url, `aff_${a.name}`)}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Row style={affRow}>
                      <Column style={{ width: '64px', verticalAlign: 'middle' }}>
                        <Img
                          src={a.image_url || `${SITE_URL}/favicon.png`}
                          alt={a.name}
                          width="56"
                          height="56"
                          style={affLogo}
                        />
                      </Column>
                      <Column style={{ verticalAlign: 'middle', paddingLeft: '12px' }}>
                        <Text style={affName}>{a.name}</Text>
                        <Text style={affDesc}>{a.description}</Text>
                      </Column>
                    </Row>
                  </Link>
                ))}
              </Section>
            )}
          </Container>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerBrand}>visas.guide</Text>
            <Text style={footerText}>
              You're receiving this because you subscribed at visas.guide. We send one briefing
              per week — no spam, ever.
            </Text>
            <Text style={footerLinks}>
              <Link href={track(SITE_URL, 'footer_home')} style={footerLink}>
                Home
              </Link>
              {' · '}
              <Link href={track(`${SITE_URL}/about`, 'footer_about')} style={footerLink}>
                About
              </Link>
              {' · '}
              <Link href={track(`${SITE_URL}/contact`, 'footer_contact')} style={footerLink}>
                Contact
              </Link>
              {' · '}
              <Link href={unsubscribeUrl} style={footerLink}>
                Unsubscribe
              </Link>
            </Text>
            <Text style={footerLegal}>
              © {today.getFullYear()} Visas Guide. All rights reserved.
            </Text>
          </Section>

          {/* Open tracking pixel */}
          <Img src={pixelUrl} width="1" height="1" alt="" style={{ display: 'none' }} />
        </Container>
      </Body>
    </Html>
  );
};

export default NewsletterEmail;

// ===== Styles =====
const main: React.CSSProperties = {
  backgroundColor: '#f4f5f7',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  margin: 0,
  padding: '24px 0',
};

const wrapper: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '0 12px',
};

const brandBar: React.CSSProperties = {
  padding: '4px 8px 16px',
};

const brandLink: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#0f172a',
  textDecoration: 'none',
  letterSpacing: '-0.01em',
};

const brandDot: React.CSSProperties = {
  color: '#16a34a',
};

const issueMeta: React.CSSProperties = {
  fontSize: '12px',
  color: '#64748b',
  margin: 0,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const card: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '14px',
  border: '1px solid #e5e7eb',
  overflow: 'hidden',
  padding: '0',
};

const hero: React.CSSProperties = {
  padding: '36px 32px 8px',
};

const kicker: React.CSSProperties = {
  fontSize: '12px',
  color: '#16a34a',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  margin: '0 0 12px',
};

const heroTitle: React.CSSProperties = {
  fontSize: '28px',
  lineHeight: '1.2',
  color: '#0f172a',
  fontWeight: 700,
  margin: '0 0 12px',
  letterSpacing: '-0.02em',
};

const heroSubtitle: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#475569',
  margin: 0,
};

const hr: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '24px 32px 16px',
};

const hrLight: React.CSSProperties = {
  borderColor: '#eef2f7',
  margin: '20px 0',
};

const sectionLabel: React.CSSProperties = {
  fontSize: '11px',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontWeight: 600,
  margin: '0 0 12px',
};

const featuredImage: React.CSSProperties = {
  width: '100%',
  height: 'auto',
  borderRadius: '10px',
  display: 'block',
  marginBottom: '14px',
  objectFit: 'cover' as const,
};

const featuredTitle: React.CSSProperties = {
  fontSize: '20px',
  lineHeight: '1.3',
  color: '#0f172a',
  fontWeight: 700,
  margin: '0 0 8px',
  letterSpacing: '-0.01em',
};

const featuredExcerpt: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#475569',
  margin: '0 0 8px',
};

const readMore: React.CSSProperties = {
  fontSize: '14px',
  color: '#16a34a',
  fontWeight: 600,
  margin: 0,
};

const storyRow: React.CSSProperties = {
  marginBottom: '16px',
};

const storyThumb: React.CSSProperties = {
  width: '100px',
  height: '74px',
  borderRadius: '8px',
  objectFit: 'cover' as const,
  display: 'block',
};

const storyTitle: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.35',
  color: '#0f172a',
  fontWeight: 600,
  margin: '0 0 4px',
};

const storyExcerpt: React.CSSProperties = {
  fontSize: '13px',
  lineHeight: '1.5',
  color: '#64748b',
  margin: 0,
};

const destCol: React.CSSProperties = {
  padding: '8px 4px',
  width: '25%',
};

const destLink: React.CSSProperties = {
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
};

const destFlag: React.CSSProperties = {
  fontSize: '28px',
  margin: '0 0 4px',
  lineHeight: 1,
};

const destName: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#0f172a',
  margin: '0 0 2px',
};

const destMeta: React.CSSProperties = {
  fontSize: '11px',
  color: '#64748b',
  margin: 0,
};

const tipBox: React.CSSProperties = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '10px',
  padding: '16px 18px',
};

const tipLabel: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#15803d',
  margin: '0 0 6px',
};

const tipText: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#166534',
  margin: 0,
};

const ctaButton: React.CSSProperties = {
  backgroundColor: '#16a34a',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600,
  textDecoration: 'none',
  padding: '12px 28px',
  borderRadius: '8px',
  display: 'inline-block',
};

const ctaSub: React.CSSProperties = {
  fontSize: '13px',
  color: '#64748b',
  margin: '14px 0 0',
};

const inlineLink: React.CSSProperties = {
  color: '#16a34a',
  textDecoration: 'none',
  fontWeight: 600,
};

const affRow: React.CSSProperties = {
  marginBottom: '12px',
};

const affLogo: React.CSSProperties = {
  width: '56px',
  height: '56px',
  borderRadius: '8px',
  objectFit: 'cover' as const,
  border: '1px solid #e5e7eb',
};

const affName: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#0f172a',
  margin: '0 0 2px',
};

const affDesc: String = '';

// (use object below; the const above kept to avoid renaming references)
const _affDescStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#64748b',
  margin: 0,
};

const footer: React.CSSProperties = {
  padding: '24px 8px 8px',
  textAlign: 'center' as const,
};

const footerBrand: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#0f172a',
  margin: '0 0 8px',
};

const footerText: React.CSSProperties = {
  fontSize: '12px',
  lineHeight: '1.6',
  color: '#64748b',
  margin: '0 0 12px',
};

const footerLinks: React.CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '0 0 8px',
};

const footerLink: React.CSSProperties = {
  color: '#475569',
  textDecoration: 'none',
};

const footerLegal: React.CSSProperties = {
  fontSize: '11px',
  color: '#94a3b8',
  margin: 0,
};
