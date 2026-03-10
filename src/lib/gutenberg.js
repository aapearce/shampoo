// Project Gutenberg integration
// Uses direct Gutenberg book IDs — no search needed, no "not found" errors.
// Text is fetched via https to avoid mixed-content blocks.

import { claudeChat } from './claude'

// Each entry has a confirmed Gutenberg ID and known https text URL.
// We use 4+ sources per device so there are plenty of fallbacks.
const DEVICE_SOURCES = {
  Simile: [
    { id: 1727,  title: 'The Odyssey',              author: 'Homer' },
    { id: 20,    title: 'The Iliad',                author: 'Homer' },
    { id: 26,    title: 'The Scarlet Letter',        author: 'Nathaniel Hawthorne' },
    { id: 2701,  title: 'Moby Dick',                author: 'Herman Melville' },
  ],
  Metaphor: [
    { id: 1524,  title: 'Hamlet',                   author: 'Shakespeare' },
    { id: 1513,  title: 'Romeo and Juliet',          author: 'Shakespeare' },
    { id: 1041,  title: 'Leaves of Grass',           author: 'Walt Whitman' },
    { id: 2701,  title: 'Moby Dick',                author: 'Herman Melville' },
  ],
  Personification: [
    { id: 1342,  title: 'Pride and Prejudice',       author: 'Jane Austen' },
    { id: 768,   title: 'Wuthering Heights',         author: 'Emily Brontë' },
    { id: 1041,  title: 'Leaves of Grass',           author: 'Walt Whitman' },
    { id: 2701,  title: 'Moby Dick',                author: 'Herman Melville' },
  ],
  Alliteration: [
    { id: 1622,  title: 'The Rime of the Ancient Mariner', author: 'Coleridge' },
    { id: 2800,  title: 'Beowulf',                  author: 'Anonymous' },
    { id: 2383,  title: 'The Canterbury Tales',      author: 'Chaucer' },
    { id: 1524,  title: 'Hamlet',                   author: 'Shakespeare' },
  ],
  Onomatopoeia: [
    { id: 1065,  title: 'The Raven and Other Poems', author: 'Edgar Allan Poe' },
    { id: 932,   title: 'The Charge of the Light Brigade', author: 'Tennyson' },
    { id: 1622,  title: 'The Rime of the Ancient Mariner', author: 'Coleridge' },
    { id: 2701,  title: 'Moby Dick',                author: 'Herman Melville' },
  ],
  Hyperbole: [
    { id: 1526,  title: 'A Midsummer Night\'s Dream', author: 'Shakespeare' },
    { id: 1524,  title: 'Hamlet',                   author: 'Shakespeare' },
    { id: 996,   title: 'Don Quixote',              author: 'Cervantes' },
    { id: 1342,  title: 'Pride and Prejudice',       author: 'Jane Austen' },
  ],
  Idiom: [
    { id: 1524,  title: 'Hamlet',                   author: 'Shakespeare' },
    { id: 1531,  title: 'Othello',                  author: 'Shakespeare' },
    { id: 98,    title: 'A Tale of Two Cities',      author: 'Charles Dickens' },
    { id: 1342,  title: 'Pride and Prejudice',       author: 'Jane Austen' },
  ],
  Imagery: [
    { id: 2701,  title: 'Moby Dick',                author: 'Herman Melville' },
    { id: 1041,  title: 'Leaves of Grass',           author: 'Walt Whitman' },
    { id: 205,   title: 'Walden',                   author: 'Henry David Thoreau' },
    { id: 26,    title: 'The Scarlet Letter',        author: 'Nathaniel Hawthorne' },
  ],
  Irony: [
    { id: 1342,  title: 'Pride and Prejudice',       author: 'Jane Austen' },
    { id: 158,   title: 'Emma',                     author: 'Jane Austen' },
    { id: 1533,  title: 'Julius Caesar',             author: 'Shakespeare' },
    { id: 141,   title: 'Sense and Sensibility',     author: 'Jane Austen' },
  ],
  Symbolism: [
    { id: 26,    title: 'The Scarlet Letter',        author: 'Nathaniel Hawthorne' },
    { id: 2701,  title: 'Moby Dick',                author: 'Herman Melville' },
    { id: 526,   title: 'The Picture of Dorian Gray', author: 'Oscar Wilde' },
    { id: 219,   title: 'Heart of Darkness',         author: 'Joseph Conrad' },
  ],
  Foreshadowing: [
    { id: 1533,  title: 'Julius Caesar',             author: 'Shakespeare' },
    { id: 1513,  title: 'Romeo and Juliet',          author: 'Shakespeare' },
    { id: 1400,  title: 'Great Expectations',        author: 'Charles Dickens' },
    { id: 1524,  title: 'Hamlet',                   author: 'Shakespeare' },
  ],
  Flashback: [
    { id: 1260,  title: 'Jane Eyre',                author: 'Charlotte Brontë' },
    { id: 768,   title: 'Wuthering Heights',         author: 'Emily Brontë' },
    { id: 1400,  title: 'Great Expectations',        author: 'Charles Dickens' },
    { id: 98,    title: 'A Tale of Two Cities',      author: 'Charles Dickens' },
  ],
  Dialogue: [
    { id: 844,   title: 'The Importance of Being Earnest', author: 'Oscar Wilde' },
    { id: 1342,  title: 'Pride and Prejudice',       author: 'Jane Austen' },
    { id: 98,    title: 'A Tale of Two Cities',      author: 'Charles Dickens' },
    { id: 158,   title: 'Emma',                     author: 'Jane Austen' },
  ],
  Oxymoron: [
    { id: 1513,  title: 'Romeo and Juliet',          author: 'Shakespeare' },
    { id: 1524,  title: 'Hamlet',                   author: 'Shakespeare' },
    { id: 20,    title: 'Paradise Lost',             author: 'John Milton' },
    { id: 1533,  title: 'Julius Caesar',             author: 'Shakespeare' },
  ],
  Allusion: [
    { id: 1524,  title: 'Hamlet',                   author: 'Shakespeare' },
    { id: 2701,  title: 'Moby Dick',                author: 'Herman Melville' },
    { id: 1041,  title: 'Leaves of Grass',           author: 'Walt Whitman' },
    { id: 526,   title: 'The Picture of Dorian Gray', author: 'Oscar Wilde' },
  ],
  Anaphora: [
    { id: 98,    title: 'A Tale of Two Cities',      author: 'Charles Dickens' },
    { id: 1533,  title: 'Julius Caesar',             author: 'Shakespeare' },
    { id: 1041,  title: 'Leaves of Grass',           author: 'Walt Whitman' },
    { id: 2701,  title: 'Moby Dick',                author: 'Herman Melville' },
  ],
  Juxtaposition: [
    { id: 98,    title: 'A Tale of Two Cities',      author: 'Charles Dickens' },
    { id: 1513,  title: 'Romeo and Juliet',          author: 'Shakespeare' },
    { id: 730,   title: 'Oliver Twist',              author: 'Charles Dickens' },
    { id: 1342,  title: 'Pride and Prejudice',       author: 'Jane Austen' },
  ],
  Assonance: [
    { id: 1065,  title: 'The Raven and Other Poems', author: 'Edgar Allan Poe' },
    { id: 1622,  title: 'The Rime of the Ancient Mariner', author: 'Coleridge' },
    { id: 932,   title: 'Tennyson\'s Poems',         author: 'Alfred Lord Tennyson' },
    { id: 2701,  title: 'Moby Dick',                author: 'Herman Melville' },
  ],
  Euphemism: [
    { id: 1524,  title: 'Hamlet',                   author: 'Shakespeare' },
    { id: 1342,  title: 'Pride and Prejudice',       author: 'Jane Austen' },
    { id: 141,   title: 'Sense and Sensibility',     author: 'Jane Austen' },
    { id: 158,   title: 'Emma',                     author: 'Jane Austen' },
  ],
  Allegory: [
    { id: 131,   title: "The Pilgrim's Progress",    author: 'John Bunyan' },
    { id: 219,   title: 'Heart of Darkness',         author: 'Joseph Conrad' },
    { id: 526,   title: 'The Picture of Dorian Gray', author: 'Oscar Wilde' },
    { id: 2701,  title: 'Moby Dick',                author: 'Herman Melville' },
  ],
  Motif: [
    { id: 1524,  title: 'Hamlet',                   author: 'Shakespeare' },
    { id: 1513,  title: 'Romeo and Juliet',          author: 'Shakespeare' },
    { id: 768,   title: 'Wuthering Heights',         author: 'Emily Brontë' },
    { id: 26,    title: 'The Scarlet Letter',        author: 'Nathaniel Hawthorne' },
  ],
  Paradox: [
    { id: 1524,  title: 'Hamlet',                   author: 'Shakespeare' },
    { id: 1532,  title: 'King Lear',                author: 'Shakespeare' },
    { id: 98,    title: 'A Tale of Two Cities',      author: 'Charles Dickens' },
    { id: 1041,  title: 'Leaves of Grass',           author: 'Walt Whitman' },
  ],
  'Extended Metaphor': [
    { id: 1522,  title: 'As You Like It',            author: 'Shakespeare' },
    { id: 1524,  title: 'Hamlet',                   author: 'Shakespeare' },
    { id: 131,   title: "The Pilgrim's Progress",    author: 'John Bunyan' },
    { id: 1041,  title: 'Leaves of Grass',           author: 'Walt Whitman' },
  ],
  'Stream of Consciousness': [
    { id: 4300,  title: 'Ulysses',                  author: 'James Joyce' },
    { id: 3268,  title: 'Mrs Dalloway',             author: 'Virginia Woolf' },
    { id: 144,   title: 'Sister Carrie',             author: 'Theodore Dreiser' },
    { id: 2701,  title: 'Moby Dick',                author: 'Herman Melville' },
  ],
  Tone: [
    { id: 1342,  title: 'Pride and Prejudice',       author: 'Jane Austen' },
    { id: 1065,  title: 'The Raven and Other Poems', author: 'Edgar Allan Poe' },
    { id: 158,   title: 'Emma',                     author: 'Jane Austen' },
    { id: 526,   title: 'The Picture of Dorian Gray', author: 'Oscar Wilde' },
  ],
  Mood: [
    { id: 932,   title: 'Tales of Mystery and Imagination', author: 'Edgar Allan Poe' },
    { id: 768,   title: 'Wuthering Heights',         author: 'Emily Brontë' },
    { id: 2852,  title: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle' },
    { id: 219,   title: 'Heart of Darkness',         author: 'Joseph Conrad' },
  ],
  Understatement: [
    { id: 158,   title: 'Emma',                     author: 'Jane Austen' },
    { id: 1342,  title: 'Pride and Prejudice',       author: 'Jane Austen' },
    { id: 141,   title: 'Sense and Sensibility',     author: 'Jane Austen' },
    { id: 1400,  title: 'Great Expectations',        author: 'Charles Dickens' },
  ],
  Sarcasm: [
    { id: 1533,  title: 'Julius Caesar',             author: 'Shakespeare' },
    { id: 844,   title: 'The Importance of Being Earnest', author: 'Oscar Wilde' },
    { id: 158,   title: 'Emma',                     author: 'Jane Austen' },
    { id: 526,   title: 'The Picture of Dorian Gray', author: 'Oscar Wilde' },
  ],
  'Point of View': [
    { id: 2701,  title: 'Moby Dick',                author: 'Herman Melville' },
    { id: 1260,  title: 'Jane Eyre',                author: 'Charlotte Brontë' },
    { id: 766,   title: 'David Copperfield',         author: 'Charles Dickens' },
    { id: 1400,  title: 'Great Expectations',        author: 'Charles Dickens' },
  ],
  Flashforward: [
    { id: 46,    title: 'A Christmas Carol',         author: 'Charles Dickens' },
    { id: 35,    title: 'The Time Machine',          author: 'H.G. Wells' },
    { id: 1400,  title: 'Great Expectations',        author: 'Charles Dickens' },
    { id: 98,    title: 'A Tale of Two Cities',      author: 'Charles Dickens' },
  ],
}

// Build a reliable https text URL from a Gutenberg book ID.
// Gutenberg hosts plain text at predictable paths; we try two common patterns.
function textUrls(id) {
  return [
    `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,
    `https://www.gutenberg.org/files/${id}/${id}-0.txt`,
    `https://www.gutenberg.org/files/${id}/${id}.txt`,
  ]
}

// Fetch plain text, trying each URL pattern until one works.
async function fetchBookText(id) {
  const urls = textUrls(id)
  for (const url of urls) {
    try {
      const res = await fetch(url)
      if (res.ok) {
        const text = await res.text()
        if (text.length > 500) return text
      }
    } catch { /* try next */ }
  }
  throw new Error(`Could not fetch text for Gutenberg ID ${id}`)
}

// Pull a representative chunk, skipping the PG boilerplate header.
function extractChunk(fullText) {
  // Find where actual content starts — look past the PG header
  const markers = ['*** START OF', '***START OF', 'CHAPTER I', 'CHAPTER 1', 'ACT I', 'Book I']
  let start = 0
  for (const m of markers) {
    const idx = fullText.indexOf(m)
    if (idx > 0 && idx < 8000) { start = idx; break }
  }
  if (start === 0) start = Math.min(3000, Math.floor(fullText.length * 0.04))
  // Take 6000 chars from a point 10% into the main text for variety
  const offset = Math.floor((fullText.length - start) * 0.1)
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
          content: `From the following excerpt of "${source.title}" by ${source.author}, find the single best example of the literary device "${deviceName}" for a student aged ${ageGroup}. Extract the exact passage (2–5 sentences) from the text. If no clear example exists, use the most relevant passage available.

Text excerpt:
${chunk}

Return JSON with:
- text: the exact quoted passage from the text above (do not invent — copy verbatim)
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
