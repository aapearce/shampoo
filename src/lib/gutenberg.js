// Project Gutenberg integration via the Gutendex API (gutendex.com)
// Fetches real public domain text and asks Claude to extract a relevant passage.

import { claudeChat } from './claude'

// Curated map: device name -> array of well-known works that exemplify it.
// Multiple options so we can try the next if one fails.
const DEVICE_SOURCES = {
  Simile: [
    { title: 'A Red Red Rose', author: 'Robert Burns', search: 'Robert Burns poems' },
    { title: 'The Iliad', author: 'Homer', search: 'Iliad Homer' },
    { title: 'Paradise Lost', author: 'John Milton', search: 'Paradise Lost Milton' },
  ],
  Metaphor: [
    { title: 'As You Like It', author: 'Shakespeare', search: 'As You Like It Shakespeare' },
    { title: 'Hamlet', author: 'Shakespeare', search: 'Hamlet Shakespeare' },
    { title: 'Leaves of Grass', author: 'Walt Whitman', search: 'Leaves of Grass Whitman' },
  ],
  Personification: [
    { title: 'Ode to the West Wind', author: 'Shelley', search: 'Shelley poems' },
    { title: 'The Prelude', author: 'Wordsworth', search: 'Prelude Wordsworth' },
    { title: 'Songs of Innocence', author: 'William Blake', search: 'Songs of Innocence Blake' },
  ],
  Alliteration: [
    { title: 'The Rime of the Ancient Mariner', author: 'Coleridge', search: 'Ancient Mariner Coleridge' },
    { title: 'Beowulf', author: 'Anonymous', search: 'Beowulf' },
    { title: 'The Canterbury Tales', author: 'Chaucer', search: 'Canterbury Tales Chaucer' },
  ],
  Onomatopoeia: [
    { title: 'The Bells', author: 'Edgar Allan Poe', search: 'Poe poems' },
    { title: 'The Charge of the Light Brigade', author: 'Tennyson', search: 'Tennyson poems' },
    { title: 'The Raven', author: 'Edgar Allan Poe', search: 'Raven Poe' },
  ],
  Hyperbole: [
    { title: 'To His Coy Mistress', author: 'Andrew Marvell', search: 'Marvell poems' },
    { title: 'A Midsummer Night Dream', author: 'Shakespeare', search: 'Midsummer Night Dream Shakespeare' },
    { title: 'Don Quixote', author: 'Cervantes', search: 'Don Quixote Cervantes' },
  ],
  Idiom: [
    { title: 'Hamlet', author: 'Shakespeare', search: 'Hamlet Shakespeare' },
    { title: 'Othello', author: 'Shakespeare', search: 'Othello Shakespeare' },
    { title: 'The Pickwick Papers', author: 'Dickens', search: 'Pickwick Papers Dickens' },
  ],
  Imagery: [
    { title: 'Ode to Autumn', author: 'John Keats', search: 'Keats poems' },
    { title: 'The Waste Land', author: 'T.S. Eliot', search: 'Eliot poems' },
    { title: 'Walden', author: 'Henry David Thoreau', search: 'Walden Thoreau' },
  ],
  Irony: [
    { title: 'Pride and Prejudice', author: 'Jane Austen', search: 'Pride and Prejudice Austen' },
    { title: 'Julius Caesar', author: 'Shakespeare', search: 'Julius Caesar Shakespeare' },
    { title: 'Emma', author: 'Jane Austen', search: 'Emma Austen' },
  ],
  Symbolism: [
    { title: 'The Scarlet Letter', author: 'Nathaniel Hawthorne', search: 'Scarlet Letter Hawthorne' },
    { title: 'Moby Dick', author: 'Herman Melville', search: 'Moby Dick Melville' },
    { title: 'Heart of Darkness', author: 'Joseph Conrad', search: 'Heart of Darkness Conrad' },
  ],
  Foreshadowing: [
    { title: 'Macbeth', author: 'Shakespeare', search: 'Macbeth Shakespeare' },
    { title: 'Romeo and Juliet', author: 'Shakespeare', search: 'Romeo and Juliet Shakespeare' },
    { title: 'Great Expectations', author: 'Charles Dickens', search: 'Great Expectations Dickens' },
  ],
  Flashback: [
    { title: 'Jane Eyre', author: 'Charlotte Bronte', search: 'Jane Eyre Bronte' },
    { title: 'Wuthering Heights', author: 'Emily Bronte', search: 'Wuthering Heights Bronte' },
    { title: 'Great Expectations', author: 'Charles Dickens', search: 'Great Expectations Dickens' },
  ],
  Dialogue: [
    { title: 'The Importance of Being Earnest', author: 'Oscar Wilde', search: 'Importance of Being Earnest Wilde' },
    { title: 'Pride and Prejudice', author: 'Jane Austen', search: 'Pride and Prejudice Austen' },
    { title: 'A Tale of Two Cities', author: 'Charles Dickens', search: 'Tale of Two Cities Dickens' },
  ],
  Oxymoron: [
    { title: 'Romeo and Juliet', author: 'Shakespeare', search: 'Romeo and Juliet Shakespeare' },
    { title: 'Hamlet', author: 'Shakespeare', search: 'Hamlet Shakespeare' },
    { title: 'Paradise Lost', author: 'John Milton', search: 'Paradise Lost Milton' },
  ],
  Allusion: [
    { title: 'The Waste Land', author: 'T.S. Eliot', search: 'Eliot poems' },
    { title: 'Ulysses', author: 'James Joyce', search: 'Ulysses Joyce' },
    { title: 'Hamlet', author: 'Shakespeare', search: 'Hamlet Shakespeare' },
  ],
  Anaphora: [
    { title: 'A Tale of Two Cities', author: 'Charles Dickens', search: 'Tale of Two Cities Dickens' },
    { title: 'Julius Caesar', author: 'Shakespeare', search: 'Julius Caesar Shakespeare' },
    { title: 'King James Bible', author: 'Various', search: 'King James Bible' },
  ],
  Juxtaposition: [
    { title: 'A Tale of Two Cities', author: 'Charles Dickens', search: 'Tale of Two Cities Dickens' },
    { title: 'Romeo and Juliet', author: 'Shakespeare', search: 'Romeo and Juliet Shakespeare' },
    { title: 'Oliver Twist', author: 'Charles Dickens', search: 'Oliver Twist Dickens' },
  ],
  Assonance: [
    { title: 'The Bells', author: 'Edgar Allan Poe', search: 'Poe poems' },
    { title: 'Ode to a Nightingale', author: 'John Keats', search: 'Keats poems' },
    { title: 'The Lady of Shalott', author: 'Tennyson', search: 'Tennyson poems' },
  ],
  Euphemism: [
    { title: 'Hamlet', author: 'Shakespeare', search: 'Hamlet Shakespeare' },
    { title: 'Henry IV', author: 'Shakespeare', search: 'Henry IV Shakespeare' },
    { title: 'Sense and Sensibility', author: 'Jane Austen', search: 'Sense Sensibility Austen' },
  ],
  Allegory: [
    { title: "The Pilgrim's Progress", author: 'John Bunyan', search: "Pilgrim's Progress Bunyan" },
    { title: 'The Faerie Queene', author: 'Edmund Spenser', search: 'Faerie Queene Spenser' },
    { title: 'The Divine Comedy', author: 'Dante', search: 'Divine Comedy Dante' },
  ],
  Motif: [
    { title: 'Macbeth', author: 'Shakespeare', search: 'Macbeth Shakespeare' },
    { title: 'Hamlet', author: 'Shakespeare', search: 'Hamlet Shakespeare' },
    { title: 'Wuthering Heights', author: 'Emily Bronte', search: 'Wuthering Heights Bronte' },
  ],
  Paradox: [
    { title: 'Hamlet', author: 'Shakespeare', search: 'Hamlet Shakespeare' },
    { title: 'King Lear', author: 'Shakespeare', search: 'King Lear Shakespeare' },
    { title: 'Songs of Experience', author: 'William Blake', search: 'Songs of Experience Blake' },
  ],
  'Extended Metaphor': [
    { title: 'As You Like It', author: 'Shakespeare', search: 'As You Like It Shakespeare' },
    { title: 'The Divine Comedy', author: 'Dante', search: 'Divine Comedy Dante' },
    { title: 'Pilgrim Progress', author: 'Bunyan', search: "Pilgrim's Progress Bunyan" },
  ],
  'Stream of Consciousness': [
    { title: 'Ulysses', author: 'James Joyce', search: 'Ulysses Joyce' },
    { title: 'Mrs Dalloway', author: 'Virginia Woolf', search: 'Mrs Dalloway Woolf' },
    { title: 'The Waves', author: 'Virginia Woolf', search: 'The Waves Woolf' },
  ],
  Tone: [
    { title: 'Pride and Prejudice', author: 'Jane Austen', search: 'Pride and Prejudice Austen' },
    { title: 'The Raven', author: 'Edgar Allan Poe', search: 'Raven Poe' },
    { title: 'Northanger Abbey', author: 'Jane Austen', search: 'Northanger Abbey Austen' },
  ],
  Mood: [
    { title: 'The Fall of the House of Usher', author: 'Edgar Allan Poe', search: 'Fall House of Usher Poe' },
    { title: 'Wuthering Heights', author: 'Emily Bronte', search: 'Wuthering Heights Bronte' },
    { title: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle', search: 'Hound Baskervilles Doyle' },
  ],
  Understatement: [
    { title: 'Emma', author: 'Jane Austen', search: 'Emma Austen' },
    { title: 'The Hitchhiker Guide to the Galaxy', author: 'Douglas Adams', search: 'Hitchhiker Guide Adams' },
    { title: 'Sense and Sensibility', author: 'Jane Austen', search: 'Sense Sensibility Austen' },
  ],
  Sarcasm: [
    { title: 'Julius Caesar', author: 'Shakespeare', search: 'Julius Caesar Shakespeare' },
    { title: 'The Importance of Being Earnest', author: 'Oscar Wilde', search: 'Importance of Being Earnest Wilde' },
    { title: 'Emma', author: 'Jane Austen', search: 'Emma Austen' },
  ],
  'Point of View': [
    { title: 'Moby Dick', author: 'Herman Melville', search: 'Moby Dick Melville' },
    { title: 'Jane Eyre', author: 'Charlotte Bronte', search: 'Jane Eyre Bronte' },
    { title: 'David Copperfield', author: 'Charles Dickens', search: 'David Copperfield Dickens' },
  ],
  Flashforward: [
    { title: 'A Christmas Carol', author: 'Charles Dickens', search: 'Christmas Carol Dickens' },
    { title: 'The Time Machine', author: 'H.G. Wells', search: 'Time Machine Wells' },
    { title: 'Bleak House', author: 'Charles Dickens', search: 'Bleak House Dickens' },
  ],
}

// Search Gutendex for a book and return plain text download URL
async function findBook(search) {
  const res = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(search)}&languages=en`)
  if (!res.ok) throw new Error('Gutendex search failed')
  const data = await res.json()
  const book = data.results?.[0]
  if (!book) throw new Error(`No Gutenberg result for: ${search}`)
  // Prefer plain text UTF-8
  const formats = book.formats || {}
  const textUrl =
    formats['text/plain; charset=utf-8'] ||
    formats['text/plain; charset=us-ascii'] ||
    formats['text/plain']
  if (!textUrl) throw new Error(`No plain text for: ${book.title}`)
  return { title: book.title, author: book.authors?.[0]?.name || 'Unknown', textUrl }
}

// Fetch the plain text and return a 6000-char chunk from partway in (avoids boilerplate header)
async function fetchChunk(textUrl) {
  const res = await fetch(textUrl)
  if (!res.ok) throw new Error('Failed to fetch Gutenberg text')
  const full = await res.text()
  // Skip Project Gutenberg header (~3000 chars) and grab a meaty middle section
  const start = Math.min(3000, Math.floor(full.length * 0.05))
  return full.slice(start, start + 6000)
}

// Main export: fetch 3 real passages from Gutenberg for a given device
export async function fetchGutenbergPassages(deviceName, ageGroup) {
  const sources = DEVICE_SOURCES[deviceName] || []
  const passages = []
  const errors = []

  for (const source of sources) {
    if (passages.length >= 3) break
    try {
      const { title, author, textUrl } = await findBook(source.search)
      const chunk = await fetchChunk(textUrl)

      // Ask Claude to find the best passage for this device within the real text
      const raw = await claudeChat({
        system: 'Return ONLY valid JSON, no markdown. Structure: {"text":"...","source":"...","explanation":"..."}',
        messages: [{
          role: 'user',
          content: `From the following excerpt of "${title}" by ${author}, find the single best example of the literary device "${deviceName}" for a student aged ${ageGroup}. Extract the exact relevant passage (2–5 sentences). If no clear example exists, use the closest relevant passage.

Text excerpt:
${chunk}

Return JSON with:
- text: the exact quoted passage from the text above
- source: "${title} by ${author}"
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
    throw new Error('Could not fetch any passages from Project Gutenberg. ' + errors.join('; '))
  }

  return passages
}
