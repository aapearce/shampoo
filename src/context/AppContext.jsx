import { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export const BADGES = [
  // Flowers
  { id: 'b1', emoji: '🌸', name: 'Cherry Blossom', device: 'Simile', rarity: 'common', earned: false },
  { id: 'b2', emoji: '🌻', name: 'Sunflower', device: 'Metaphor', rarity: 'common', earned: false },
  { id: 'b3', emoji: '🌷', name: 'Tulip', device: 'Alliteration', rarity: 'common', earned: false },
  { id: 'b4', emoji: '🪻', name: 'Lavender', device: 'Personification', rarity: 'rare', earned: false },
  { id: 'b5', emoji: '🌹', name: 'Rose', device: 'Imagery', rarity: 'rare', earned: false },
  // Foods
  { id: 'b6', emoji: '🥐', name: 'Croissant', device: 'Onomatopoeia', rarity: 'common', earned: false },
  { id: 'b7', emoji: '🍰', name: 'Cake Slice', device: 'Hyperbole', rarity: 'common', earned: false },
  { id: 'b8', emoji: '🍩', name: 'Donut', device: 'Idiom', rarity: 'rare', earned: false },
  { id: 'b9', emoji: '🧁', name: 'Cupcake', device: 'Dialogue', rarity: 'rare', earned: false },
  { id: 'b10', emoji: '🍜', name: 'Ramen', device: 'Foreshadowing', rarity: 'legendary', earned: false },
  // Creatures
  { id: 'b11', emoji: '🦋', name: 'Butterfly', device: 'Symbolism', rarity: 'rare', earned: false },
  { id: 'b12', emoji: '🐝', name: 'Bee', device: 'Irony', rarity: 'rare', earned: false },
  { id: 'b13', emoji: '🦚', name: 'Peacock', device: 'Extended Metaphor', rarity: 'legendary', earned: false },
  { id: 'b14', emoji: '🐠', name: 'Tropical Fish', device: 'Flashback', rarity: 'legendary', earned: false },
  { id: 'b15', emoji: '🦊', name: 'Fox', device: 'Narrative Voice', rarity: 'legendary', earned: false },
]

export const AGE_GROUPS = [
  { label: 'Ages 6–8',  value: '6-8' },
  { label: 'Ages 9–12', value: '9-12' },
  { label: 'Ages 12–15', value: '12-15' },
  { label: 'Ages 15+', value: '15+' },
]

export function AppProvider({ children }) {
  const [ageGroup, setAgeGroup] = useState('9-12')
  const [badges, setBadges] = useState(BADGES)
  const [assessments, setAssessments] = useState([])

  function earnBadge(deviceName) {
    setBadges(prev => prev.map(b =>
      b.device.toLowerCase() === deviceName.toLowerCase() ? { ...b, earned: true } : b
    ))
  }

  function addAssessment(assessment) {
    setAssessments(prev => [assessment, ...prev])
  }

  return (
    <AppContext.Provider value={{ ageGroup, setAgeGroup, badges, earnBadge, assessments, addAssessment }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
