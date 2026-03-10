// Project Gutenberg integration via the Gutendex API (https://gutendex.com)
// Fetches real public domain text and extracts passages demonstrating literary devices.

// Well-known Gutenberg book IDs for reliable retrieval, keyed by author/title slug.
// These are pre-seeded so we skip the search step for common classics.
const KNOWN_BOOKS = {
  shakespeare:  { id: 100,   title: 'The Complete Works of Shakespeare' },
  austen_pp:    { id: 1342,  title: 'Pride and Prejudice' },
  dickens_ttc:  { id: 98,    title: 'A Tale of Two Cities' },
  dickens_gc:   { id: 1400,  title: 'Great Expectations' },
  hardy_tess:   { id: 110,   title: 'Tess of the d'Urbervilles' },
  eliot_mm:     { id: 145,   title: 'Middlemarch' },
  poe:          { id: 2147,  title: 'The Works of Edgar Allan Poe' },
  keats:        { id: 23684, title: 'Poems of Keats' },
  bronte_je:    { id: 1260,  title: 'Jane Eyre' },
  hardy_rn:     { id: 3273,  title: 'The Return of the Native' },
  shelley_fr:   { id: 84,    title: 'Frankenstein' },
  swift_gt:     { id: 829,   title: "Gulliver's Travels" },
  defoe_rc:     { id: 521,   title: 'Robinson Crusoe' },
  bunyan:       { id: 131,   title: "The Pilgrim's Progress" },
  homer_iliad:  { id: 6130,  title: 'The Iliad' },
}

// Per-device source mapping: which books to pull from for each literary device.
// Multiple sources give variety across refreshes.
export const DEVICE_SOURCES = {
  Simile:              ['keats', 'homer_iliad', 'shelley_fr'],
  Metaphor:            ['shakespeare', 'keats', 'eliot_mm'],
  Personification:     ['keats', 'shelley_fr', 'poe'],
  Alliteration:        ['shakespeare', 'poe', 'keats'],
  Onomatopoeia:        ['poe', 'keats', 'shakespeare'],
  Hyperbole:           ['shakespeare', 'swift_gt', 'dickens_gc'],
  Idiom:               ['shakespeare', 'dickens_ttc', 'dickens_gc'],
  Imagery:             ['keats', 'hardy_tess', 'bronte_je'],
  Irony:               ['austen_pp', 'swift_gt', 'dickens_ttc'],
  Symbolism:           ['hardy_tess', 'bronte_je', 'shelley_fr'],
  Foreshadowing:       ['dickens_gc', 'hardy_tess', 'shelley_fr'],
  Flashback:           ['dickens_gc', 'bronte_je', 'hardy_rn'],
  Dialogue:            ['dickens_ttc', 'austen_pp', 'bronte_je'],
  Oxymoron:            ['shakespeare', 'keats', 'dickens_ttc'],
  Allusion:            ['shakespeare', 'eliot_mm', 'bunyan'],
  Anaphora:            ['shakespeare', 'dickens_ttc', 'bunyan'],
  Juxtaposition:       ['dickens_ttc', 'austen_pp', 'hardy_tess'],
  Assonance:           ['keats', 'poe', 'shelley_fr'],
  Euphemism:           ['austen_pp', 'dickens_gc', 'swift_gt'],
  Allegory:            ['bunyan', 'swift_gt', 'shakespeare'],
  Motif:               ['hardy_tess', 'bronte_je', 'dickens_gc'],
  Paradox:             ['shakespeare', 'bunyan', 'swift_gt'],
  'Extended Metaphor': ['shakespeare', 'keats', 'bunyan'],
  'Stream of Consciousness': ['hardy_rn', 'bronte_je', 'eliot_mm'],
  Tone:                ['poe', 'austen_pp', 'dickens_ttc'],
  Mood:                ['poe', 'hardy_tess', 'shelley_fr'],
  Understatement:      ['austen_pp', 'swift_gt', 'dickens_gc'],
  Sarcasm:             ['austen_pp', 'swift_gt', 'dickens_ttc'],
  'Point of View':     ['bronte_je', 'austen_pp', 'defoe_rc'],
  Flashforward:        ['dickens_gc', 'hardy_rn', 'shelley_fr'],
}

/**
 * Fetch a real passage from a Gutenberg book that demonstrates a literary device.
 * Returns { passage, source, bookTitle, bookId }
 */
export async function fetchGutenbergPassage(deviceName, sourceKey) {
  const book = KNOWN_BOOKS[sourceKey]
  if (!book) throw new Error(`Unknown source key: ${sourceKey}`)

  // 1. Get the plain text download URL from Gutendex
  const metaRes = await fetch(`https://gutendex.com/books/${book.id}`)
  if (!metaRes.ok) throw new Error(`Gutendex lookup failed for book ${book.id}`)
  const meta = await metaRes.json()

  const formats = meta.formats || {}
  const textUrl =
    formats['text/plain; charset=utf-8'] ||
    formats['text/plain; charset=us-ascii'] ||
    formats['text/plain']

  if (!textUrl) throw new Error(`No plain text available for ${book.title}`)

  // 2. Fetch the raw text — but only a portion to keep it manageable.
  // We use a range header to grab ~80KB from the middle of the book
  // (skipping Gutenberg headers/footers at start and end).
  const textRes = await fetch(textUrl, {
    headers: { Range: 'bytes=40000-120000' }
  })
  // Range requests return 206; fall back gracefully if not supported
  const rawText = await textRes.text()

  // 3. Clean and trim the text
  const cleaned = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 60000) // cap at ~60k chars for the AI context

  return { rawText: cleaned, bookTitle: meta.title, bookId: book.id, author: (meta.authors?.[0]?.name || '') }
}
