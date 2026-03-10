// Project Gutenberg integration
// Strategy: call Gutendex /books/{id} to get the real download URL for each book,
// then upgrade http:// -> https:// to avoid mixed-content CORS blocks.

import { claudeChat } from './claude'

const DEVICE_SOURCES = {
  Simile: [
    { id: 1727,  title: 'The Odyssey',                    author: 'Homer' },
    { id: 26,    title: 'The Scarlet Letter',              author: 'Nathaniel Hawthorne' },
    { id: 98,    title: 'A Tale of Two Cities',            author: 'Charles Dickens' },
    { id: 1342,  title: 'Pride and Prejudice',             author: 'Jane Austen' },
  ],
  Metaphor: [
    { id: 1524,  title: 'Hamlet',                          author: 'William Shakespeare' },
    { id: 1342,  title: 'Pride and Prejudice',             author: 'Jane Austen' },
    { id: 98,    title: 'A Tale of Two Cities',            author: 'Charles Dickens' },
    { id: 526,   title: 'The Picture of Dorian Gray',      author: 'Oscar Wilde' },
  ],
  Personification: [
    { id: 1342,  title: 'Pride and Prejudice',             author: 'Jane Austen' },
    { id: 768,   title: 'Wuthering Heights',               author: 'Emily Brontë' },
    { id: 98,    title: 'A Tale of Two Cities',            author: 'Charles Dickens' },
    { id: 219,   title: 'Heart of Darkness',               author: 'Joseph Conrad' },
  ],
  Alliteration: [
    { id: 2800,  title: 'Beowulf',                         author: 'Anonymous' },
    { id: 1524,  title: 'Hamlet',                          author: 'William Shakespeare' },
    { id: 1400,  title: 'Great Expectations',              author: 'Charles Dickens' },
    { id: 844,   title: 'The Importance of Being Earnest', author: 'Oscar Wilde' },
  ],
  Onomatopoeia: [
    { id: 1524,  title: 'Hamlet',                          author: 'William Shakespeare' },
    { id: 98,    title: 'A Tale of Two Cities',            author: 'Charles Dickens' },
    { id: 730,   title: 'Oliver Twist',                    author: 'Charles Dickens' },
    { id: 1400,  title: 'Great Expectations',              author: 'Charles Dickens' },
  ],
  Hyperbole: [
    { id: 1526,  title: "A Midsummer Night's Dream",       author: 'William Shakespeare' },
    { id: 1524,  title: 'Hamlet',                          author: 'William Shakespeare' },
    { id: 1342,  title: 'Pride and Prejudice',             author: 'Jane Austen' },
    { id: 844,   title: 'The Importance of Being Earnest', author: 'Oscar Wilde' },
  ],
  Idiom: [
    { id: 1524,  title: 'Hamlet',                          author: 'William Shakespeare' },
    { id: 1531,  title: 'Othello',                         author: 'William Shakespeare' },
    { id: 98,    title: 'A Tale of Two Cities',            author: 'Charles Dickens' },
    { id: 1342,  title: 'Pride and Prejudice',             author: 'Jane Austen' },
  ],
  Imagery: [
    { id: 26,    title: 'The Scarlet Letter',              author: 'Nathaniel Hawthorne' },
    { id: 219,   title: 'Heart of Darkness',               author: 'Joseph Conrad' },
    { id: 768,   title: 'Wuthering Heights',               author: 'Emily Brontë' },
    { id: 205,   title: 'Walden',                          author: 'Henry David Thoreau' },
  ],
  Irony: [
    { id: 1342,  title: 'Pride and Prejudice',             author: 'Jane Austen' },
    { id: 158,   title: 'Emma',                            author: 'Jane Austen' },
    { id: 1533,  title: 'Julius Caesar',                   author: 'William Shakespeare' },
    { id: 141,   title: 'Sense and Sensibility',           author: 'Jane Austen' },
  ],
  Symbolism: [
    { id: 26,    title: 'The Scarlet Letter',              author: 'Nathaniel Hawthorne' },
    { id: 526,   title: 'The Picture of Dorian Gray',      author: 'Oscar Wilde' },
    { id: 219,   title: 'Heart of Darkness',               author: 'Joseph Conrad' },
    { id: 1400,  title: 'Great Expectations',              author: 'Charles Dickens' },
  ],
  Foreshadowing: [
    { id: 1533,  title: 'Julius Caesar',                   author: 'William Shakespeare' },
    { id: 1400,  title: 'Great Expectations',              author: 'Charles Dickens' },
    { id: 1524,  title: 'Hamlet',                          author: 'William Shakespeare' },
    { id: 768,   title: 'Wuthering Heights',               author: 'Emily Brontë' },
  ],
  Flashback: [
    { id: 1260,  title: 'Jane Eyre',                       author: 'Charlotte Brontë' },
    { id: 768,   title: 'Wuthering Heights',               author: 'Emily Brontë' },
    { id: 1400,  title: 'Great Expectations',              author: 'Charles Dickens' },
    { id: 98,    title: 'A Tale of Two Cities',            author: 'Charles Dickens' },
  ],
  Dialogue: [
    { id: 844,   title: 'The Importance of Being Earnest', author: 'Oscar Wilde' },
    { id: 1342,  title: 'Pride and Prejudice',             author: 'Jane Austen' },
    { id: 98,    title: 'A Tale of Two Cities',            author: 'Charles Dickens' },
    { id: 158,   title: 'Emma',                            author: 'Jane Austen' },
  ],
  Oxymoron: [
    { id: 1524,  title: 'Hamlet',                          author: 'William Shakespeare' },
    { id: 1533,  title: 'Julius Caesar',                   author: 'William Shakespeare' },
    { id: 98,    title: 'A Tale of Two Cities',            author: 'Charles Dickens' },
    { id: 526,   title: 'The Picture of Dorian Gray',      author: 'Oscar Wilde' },
  ],
  Allusion: [
    { id: 1524,  title: 'Hamlet',                          author: 'William Shakespeare' },
    { id: 526,   title: 'The Picture of Dorian Gray',      author: 'Oscar Wilde' },
    { id: 219,   title: 'Heart of Darkness',               author: 'Joseph Conrad' },
    { id: 844,   title: 'The Importance of Being Earnest', author: 'Oscar Wilde' },
  ],
  Anaphora: [
    { id: 98,    title: 'A Tale of Two Cities',            author: 'Charles Dickens' },
    { id: 1533,  title: 'Julius Caesar',                   author: 'William Shakespeare' },
    { id: 730,   title: 'Oliver Twist',                    author: 'Charles Dickens' },
    { id: 1400,  title: 'Great Expectations',              author: 'Charles Dickens' },
  ],
  Juxtaposition: [
    { id: 98,    title: 'A Tale of Two Cities',            author: 'Charles Dickens' },
    { id: 730,   title: 'Oliver Twist',                    author: 'Charles Dickens' },
    { id: 1342,  title: 'Pride and Prejudice',             author: 'Jane Austen' },
    { id: 526,   title: 'The Picture of Dorian Gray',      author: 'Oscar Wilde' },
  ],
  Assonance: [
    { id: 1524,  title: 'Hamlet',                          author: 'William Shakespeare' },
    { id: 219,   title: 'Heart of Darkness',               author: 'Joseph Conrad' },
    { id: 1400,  title: 'Great Expectations',              author: 'Charles Dickens' },
    { id: 768,   title: 'Wuthering Heights',               author: 'Emily Brontë' },
  ],
  Euphemism: [
    { id: 1524,  title: 'Hamlet',                          author: 'William Shakespeare' },
    { id: 1342,  title: 'Pride and Prejudice',             author: 'Jane Austen' },
    { id: 141,   title: 'Sense and Sensibility',           author: 'Jane Austen' },
    { id: 158,   title: 'Emma',                            author: 'Jane Austen' },
  ],
  Allegory: [
    { id: 131,   title: "The Pilgrim's Progress",          author: 'John Bunyan' },
    { id: 219,   title: 'Heart of Darkness',               author: 'Joseph Conrad' },
    { id: 526,   title: 'The Picture of Dorian Gray',      author: 'Oscar Wilde' },
    { id: 26,    title: 'The Scarlet Letter',              author: 'Nathaniel Hawthorne' },
  ],
  Motif: [
    { id: 1524,  title: 'Hamlet',                          author: 'William Shakespeare' },
    { id: 768,   title: 'Wuthering Heights',               author: 'Emily Brontë' },
    { id: 26,    title: 'The Scarlet Letter',              author: 'Nathaniel Hawthorne' },
    { id: 219,   title: 'Heart of Darkness',               author: 'Joseph Conrad' },
  ],
  Paradox: [
    { id: 1524,  title: 'Hamlet',                          author: 'William Shakespeare' },
    { id: 1532,  title: 'King Lear',                       author: 'William Shakespeare' },
    { id: 98,    title: 'A Tale of Two Cities',            author: 'Charles Dickens' },
    { id: 526,   title: 'The Picture of Dorian Gray',      author: 'Oscar Wilde' },
  ],
  'Extended Metaphor': [
    { id: 1522,  title: 'As You Like It',                  author: 'William Shakespeare' },
    { id: 1524,  title: 'Hamlet',                          author: 'William Shakespeare' },
    { id: 131,   title: "The Pilgrim's Progress",          author: 'John Bunyan' },
    { id: 219,   title: 'Heart of Darkness',               author: 'Joseph Conrad' },
  ],
  'Stream of Consciousness': [
    { id: 4300,  title: 'Ulysses',                         author: 'James Joyce' },
    { id: 3268,  title: 'Mrs Dalloway',                    author: 'Virginia Woolf' },
    { id: 219,   title: 'Heart of Darkness',               author: 'Joseph Conrad' },
    { id: 526,   title: 'The Picture of Dorian Gray',      author: 'Oscar Wilde' },
  ],
  Tone: [
    { id: 1342,  title: 'Pride and Prejudice',             author: 'Jane Austen' },
    { id: 158,   title: 'Emma',                            author: 'Jane Austen' },
    { id: 526,   title: 'The Picture of Dorian Gray',      author: 'Oscar Wilde' },
    { id: 844,   title: 'The Importance of Being Earnest', author: 'Oscar Wilde' },
  ],
  Mood: [
    { id: 768,   title: 'Wuthering Heights',               author: 'Emily Brontë' },
    { id: 2852,  title: 'The Hound of the Baskervilles',   author: 'Arthur Conan Doyle' },
    { id: 219,   title: 'Heart of Darkness',               author: 'Joseph Conrad' },
    { id: 26,    title: 'The Scarlet Letter',              author: 'Nathaniel Hawthorne' },
  ],
  Understatement: [
    { id: 158,   title: 'Emma',                            author: 'Jane Austen' },
    { id: 1342,  title: 'Pride and Prejudice',             author: 'Jane Austen' },
    { id: 141,   title: 'Sense and Sensibility',           author: 'Jane Austen' },
    { id: 1400,  title: 'Great Expectations',              author: 'Charles Dickens' },
  ],
  Sarcasm: [
    { id: 1533,  title: 'Julius Caesar',                   author: 'William Shakespeare' },
    { id: 844,   title: 'The Importance of Being Earnest', author: 'Oscar Wilde' },
    { id: 158,   title: 'Emma',                            author: 'Jane Austen' },
    { id: 526,   title: 'The Picture of Dorian Gray',      author: 'Oscar Wilde' },
  ],
  'Point of View': [
    { id: 1260,  title: 'Jane Eyre',                       author: 'Charlotte Brontë' },
    { id: 766,   title: 'David Copperfield',               author: 'Charles Dickens' },
    { id: 1400,  title: 'Great Expectations',              author: 'Charles Dickens' },
    { id: 219,   title: 'Heart of Darkness',               author: 'Joseph Conrad' },
  ],
  Flashforward: [
    { id: 46,    title: 'A Christmas Carol',               author: 'Charles Dickens' },
    { id: 35,    title: 'The Time Machine',                author: 'H.G. Wells' },
    { id: 1400,  title: 'Great Expectations',              author: 'Charles Dickens' },
    { id: 98,    title: 'A Tale of Two Cities',            author: 'Charles Dickens' },
  ],
}

// Ask Gutendex for the real download URL for a book by ID, then upgrade to https.
async function getTextUrl(id) {
  const res = await fetch(`https://gutendex.com/books/${id}`)
  if (!res.ok) throw new Error(`Gutendex lookup failed for ID ${id}`)
  const data = await res.json()
  const formats = data.formats || {}

  // Pick the best plain text format available
  const url =
    formats['text/plain; charset=utf-8'] ||
    formats['text/plain; charset=us-ascii'] ||
    formats['text/plain']

  if (!url) throw new Error(`No plain text format for ID ${id} (${data.title})`)

  // Upgrade http:// to https:// — Gutenberg serves over both, https avoids mixed-content
  return url.replace(/^http:\/\//, 'https://')
}

// Fetch the plain text of a book given its Gutenberg ID.
async function fetchBookText(id) {
  const url = await getTextUrl(id)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Text fetch failed: ${url} (${res.status})`)
  const text = await res.text()
  if (text.length < 500) throw new Error(`Text too short for ID ${id}`)
  return text
}

// Extract a meaty chunk of real content, skipping the PG boilerplate header.
function extractChunk(fullText) {
  const markers = ['*** START OF THE PROJECT', '*** START OF THIS PROJECT', 'CHAPTER I', 'CHAPTER 1', 'ACT I.', 'ACT I\n', 'Book I\n']
  let start = 0
  for (const m of markers) {
    const idx = fullText.indexOf(m)
    if (idx > 0 && idx < 12000) { start = idx + m.length; break }
  }
  if (start === 0) start = Math.min(4000, Math.floor(fullText.length * 0.04))
  // Sample from ~15% into the main text for a representative passage
  const offset = Math.floor((fullText.length - start) * 0.15)
  return fullText.slice(start + offset, start + offset + 6000)
}

// Main export: fetch up to 3 real passages from Gutenberg for a given device.
export async function fetchGutenbergPassages(deviceName, ageGroup) {
  const sources = DEVICE_SOURCES[deviceName] || []
  const passages = []
  const errors = []

  for (const source of sources) {
    if (passages.length >= 3) break
    try {
      const fullText = await fetchBookText(source.id)
      const chunk = extractChunk(fullText)

      const raw = await claudeChat({
        system: 'Return ONLY valid JSON, no markdown. Structure: {"text":"...","source":"...","explanation":"..."}',
        messages: [{
          role: 'user',
          content: `From the following excerpt of "${source.title}" by ${source.author}, find the single best example of the literary device "${deviceName}" for a student aged ${ageGroup}. Extract the exact passage (2–5 sentences) verbatim from the text below. If no strong example exists, use the most relevant passage.

Text excerpt:
${chunk}

Return JSON with:
- text: exact verbatim passage copied from the text above (do not invent or paraphrase)
- source: "${source.title} by ${source.author}"
- explanation: one sentence explaining how this passage demonstrates ${deviceName}`
        }]
      })

      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
      if (parsed.text && parsed.source && parsed.explanation) {
        passages.push(parsed)
      }
    } catch (e) {
      errors.push(`${source.title}: ${e.message}`)
    }
  }

  if (passages.length === 0) {
    throw new Error('Could not fetch passages from Project Gutenberg. ' + errors.join('; '))
  }

  return passages
}
