# Repair punctuation and preserve article paragraphs

## What will change
- Correct malformed comma spacing in the visa and ETIAS copy templates, including headings, titles, descriptions, and sentences.
- Update the shared typography cleanup so it normalizes horizontal spacing only and never collapses line breaks or blank-line paragraph separators.
- Replace the database punctuation trigger with whitespace-aware normalization for future content.
- Repair the same malformed comma patterns in existing visitor-facing database content without changing URLs or structural data.

## Verification
- Confirm the affected source files contain no `word,word` or `word , word` patterns.
- Test the shared cleanup with dash spacing, malformed commas, HTML, and multi-paragraph plain text.
- Recount malformed punctuation in affected public database fields after cleanup.
- Check the latest preview build and resolve both monitoring findings only after verification passes.

## Technical details
- Em dashes become a comma followed by one space; en dashes become a standard hyphen.
- Repeated spaces and tabs are collapsed, while `\n` and `\n\n` remain unchanged.
- Database cleanup is limited to visitor-facing text fields already covered by the typography trigger.
