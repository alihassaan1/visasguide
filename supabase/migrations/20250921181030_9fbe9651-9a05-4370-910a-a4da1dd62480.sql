-- Insert sample news articles for testing
INSERT INTO public.news_articles (
  title, slug, excerpt, content, categories, tags, author, published_at, source_type, seo_title, seo_description
) VALUES 
  (
    'New Student Visa Requirements for Germany 2024',
    'germany-student-visa-requirements-2024',
    'Germany introduces updated student visa requirements affecting international applicants starting January 2024.',
    '<h2>Overview of Changes</h2><p>Germany has announced significant changes to its student visa application process, affecting thousands of international students planning to study in the country. The new requirements aim to streamline the application process while ensuring proper documentation.</p><h2>Key Requirements</h2><ul><li>Enhanced financial proof requirements</li><li>Updated health insurance documentation</li><li>Academic qualification verification</li><li>Language proficiency updates</li></ul><h2>Implementation Timeline</h2><p>These changes will be implemented gradually throughout 2024, with full enforcement beginning in March 2024.</p>',
    ARRAY['Visa Updates', 'Policy Changes'],
    ARRAY['Germany', 'Student Visa', '2024', 'Requirements'],
    'Visa Guide Editorial Team',
    NOW() - INTERVAL '2 days',
    'manual',
    'Germany Student Visa Requirements 2024 - Complete Guide',
    'Complete guide to new German student visa requirements for 2024. Updated documentation, financial proof, and application process changes for international students.'
  ),
  (
    'Australia Introduces Fast-Track Visa Processing for Skilled Workers',
    'australia-fast-track-visa-skilled-workers',
    'Australia launches expedited processing for skilled worker visas to address labor shortages in key industries.',
    '<h2>Fast-Track Program Overview</h2><p>Australia has introduced a new fast-track processing system for skilled worker visas to address critical labor shortages across various industries. This initiative aims to reduce processing times from months to weeks for eligible applicants.</p><h2>Eligible Occupations</h2><ul><li>Healthcare professionals</li><li>IT specialists</li><li>Engineers</li><li>Teachers</li><li>Tradespeople</li></ul><h2>Processing Times</h2><p>The new system promises processing times of 2-4 weeks for complete applications, compared to the previous 6-12 month timeframe.</p>',
    ARRAY['Immigration News', 'Processing Times'],
    ARRAY['Australia', 'Skilled Worker', 'Fast Track', 'Processing'],
    'Immigration News Team',
    NOW() - INTERVAL '1 day',
    'manual',
    'Australia Fast-Track Skilled Worker Visa Processing 2024',
    'Australia introduces fast-track visa processing for skilled workers. Learn about eligible occupations, reduced processing times, and application requirements.'
  ),
  (
    'UK Post-Study Work Visa Extension Announced',
    'uk-post-study-work-visa-extension-2024',
    'The UK government extends the post-study work visa duration for international graduates from top universities.',
    '<h2>Extension Details</h2><p>The UK government has announced an extension to the post-study work visa program, allowing international graduates from designated universities to work in the UK for up to 3 years after graduation, up from the previous 2-year limit.</p><h2>Eligible Universities</h2><p>The extension applies to graduates from universities ranked in the top 50 globally, as determined by major university ranking systems.</p><h2>Application Process</h2><ul><li>Online application system</li><li>Document verification required</li><li>Processing fee of £715</li><li>Decision within 8 weeks</li></ul>',
    ARRAY['Visa Updates', 'Policy Changes'],
    ARRAY['UK', 'Post Study', 'Work Visa', 'Extension'],
    'UK Immigration Correspondent',
    NOW() - INTERVAL '3 hours',
    'manual',
    'UK Post-Study Work Visa Extended to 3 Years - 2024 Update',
    'UK extends post-study work visa to 3 years for top university graduates. Complete details on eligibility, application process, and requirements.'
  );