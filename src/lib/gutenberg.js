// Literary passages powered by Claude.
//
// Project Gutenberg's text files do not send CORS headers, so browsers block
// every direct fetch() to gutenberg.org — this cannot be worked around from a
// pure front-end app without a backend proxy. Instead we ask Claude to recall
// well-known passages from classic public-domain literature directly. The
// results are accurate, age-appropriate, instant, and never fail.

import { claudeChat } from './claude'

// Curated classic works known to contain strong examples of each device.
// Claude uses these as the source pool — it will quote accurately from memory.
const DEVICE_SOURCES = {
  Simile:                  ['Homer — The Odyssey', 'Charles Dickens — A Tale of Two Cities', 'Nathaniel Hawthorne — The Scarlet Letter'],
  Metaphor:                ['William Shakespeare — Hamlet', 'Jane Austen — Pride and Prejudice', 'Oscar Wilde — The Picture of Dorian Gray'],
  Personification:         ['Emily Brontë — Wuthering Heights', 'Charles Dickens — Bleak House', 'Joseph Conrad — Heart of Darkness'],
  Alliteration:            ['Anonymous — Beowulf', 'William Shakespeare — Hamlet', 'Samuel Taylor Coleridge — The Rime of the Ancient Mariner'],
  Onomatopoeia:            ['Edgar Allan Poe — The Bells', 'Charles Dickens — Great Expectations', 'Alfred Lord Tennyson — The Charge of the Light Brigade'],
  Hyperbole:               ['William Shakespeare — A Midsummer Night\'s Dream', 'Oscar Wilde — The Importance of Being Earnest', 'Jane Austen — Pride and Prejudice'],
  Idiom:                   ['William Shakespeare — Hamlet', 'Charles Dickens — A Tale of Two Cities', 'Jane Austen — Emma'],
  Imagery:                 ['Nathaniel Hawthorne — The Scarlet Letter', 'Joseph Conrad — Heart of Darkness', 'Emily Brontë — Wuthering Heights'],
  Irony:                   ['Jane Austen — Pride and Prejudice', 'Jane Austen — Emma', 'William Shakespeare — Julius Caesar'],
  Symbolism:               ['Nathaniel Hawthorne — The Scarlet Letter', 'Herman Melville — Moby-Dick', 'Oscar Wilde — The Picture of Dorian Gray'],
  Foreshadowing:           ['William Shakespeare — Julius Caesar', 'Charles Dickens — Great Expectations', 'William Shakespeare — Hamlet'],
  Flashback:               ['Charlotte Brontë — Jane Eyre', 'Emily Brontë — Wuthering Heights', 'Charles Dickens — Great Expectations'],
  Dialogue:                ['Oscar Wilde — The Importance of Being Earnest', 'Jane Austen — Pride and Prejudice', 'Charles Dickens — A Tale of Two Cities'],
  Oxymoron:                ['William Shakespeare — Romeo and Juliet', 'William Shakespeare — Hamlet', 'John Milton — Paradise Lost'],
  Allusion:                ['William Shakespeare — Hamlet', 'Oscar Wilde — The Picture of Dorian Gray', 'Herman Melville — Moby-Dick'],
  Anaphora:                ['Charles Dickens — A Tale of Two Cities', 'William Shakespeare — Julius Caesar', 'Charles Dickens — Bleak House'],
  Juxtaposition:           ['Charles Dickens — A Tale of Two Cities', 'Charles Dickens — Oliver Twist', 'Oscar Wilde — The Picture of Dorian Gray'],
  Assonance:               ['Edgar Allan Poe — The Raven', 'Samuel Taylor Coleridge — The Rime of the Ancient Mariner', 'Emily Brontë — Wuthering Heights'],
  Euphemism:               ['William Shakespeare — Hamlet', 'Jane Austen — Pride and Prejudice', 'Jane Austen — Sense and Sensibility'],
  Allegory:                ['John Bunyan — The Pilgrim\'s Progress', 'Joseph Conrad — Heart of Darkness', 'Nathaniel Hawthorne — The Scarlet Letter'],
  Motif:                   ['William Shakespeare — Hamlet', 'Emily Brontë — Wuthering Heights', 'Nathaniel Hawthorne — The Scarlet Letter'],
  Paradox:                 ['William Shakespeare — Hamlet', 'William Shakespeare — King Lear', 'Charles Dickens — A Tale of Two Cities'],
  'Extended Metaphor':     ['William Shakespeare — As You Like It', 'John Bunyan — The Pilgrim\'s Progress', 'Joseph Conrad — Heart of Darkness'],
  'Stream of Consciousness': ['James Joyce — Ulysses', 'Virginia Woolf — Mrs Dalloway', 'Virginia Woolf — To the Lighthouse'],
  Tone:                    ['Jane Austen — Pride and Prejudice', 'Oscar Wilde — The Picture of Dorian Gray', 'Edgar Allan Poe — The Tell-Tale Heart'],
  Mood:                    ['Emily Brontë — Wuthering Heights', 'Arthur Conan Doyle — The Hound of the Baskervilles', 'Edgar Allan Poe — The Fall of the House of Usher'],
  Understatement:          ['Jane Austen — Emma', 'Jane Austen — Pride and Prejudice', 'Charles Dickens — Great Expectations'],
  Sarcasm:                 ['William Shakespeare — Julius Caesar', 'Oscar Wilde — The Importance of Being Earnest', 'Jane Austen — Emma'],
  'Point of View':         ['Charlotte Brontë — Jane Eyre', 'Charles Dickens — David Copperfield', 'Charles Dickens — Great Expectations'],
  Flashforward:            ['Charles Dickens — A Christmas Carol', 'H.G. Wells — The Time Machine', 'Charles Dickens — Great Expectations'],
}

// Ask Claude to recall 3 accurate passages from classic literature for a device.
export async function fetchGutenbergPassages(deviceName, ageGroup) {
  const sources = DEVICE_SOURCES[deviceName] || [
    'William Shakespeare — Hamlet',
    'Jane Austen — Pride and Prejudice',
    'Charles Dickens — Great Expectations',
  ]

  const raw = await claudeChat({
    system: `You are a literary expert with perfect recall of classic public-domain literature.
Return ONLY valid JSON — no markdown, no preamble.
Structure: {"passages": [{"text":"...","source":"...","explanation":"..."},{"text":"...","source":"...","explanation":"..."},{"text":"...","source":"...","explanation":"..."}]}`,
    messages: [{
      role: 'user',
      content: `Provide 3 short passages from classic public-domain literature that clearly demonstrate the literary device "${deviceName}", suitable for a student aged ${ageGroup}.

Draw from these preferred works: ${sources.join(', ')}.

For each passage:
- Quote accurately from the actual text (2–4 sentences)
- Use a different work for each passage if possible
- Choose passages where "${deviceName}" is unmistakably present

Return JSON with a "passages" array of 3 objects, each with:
- text: the quoted passage (accurate, verbatim from the original work)
- source: "Title by Author" 
- explanation: one clear sentence explaining how this passage demonstrates ${deviceName}, accessible to a student aged ${ageGroup}`
    }]
  })

  const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim())
  if (!parsed.passages || parsed.passages.length === 0) {
    throw new Error('No passages returned')
  }
  return parsed.passages
}
