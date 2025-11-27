'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface HomeSection {
  _id?: string
  type: 'hero' | 'features' | 'categories' | 'courses' | 'stats' | 'testimonials' | 'cta' | 'custom'
  title: string
  subtitle?: string
  content?: string
  isActive: boolean
  order: number
  settings: {
    backgroundColor?: string
    textColor?: string
    showButton?: boolean
    buttonText?: string
    buttonLink?: string
    imageUrl?: string
    items?: Array<{
      title?: string
      description?: string
      icon?: string
      value?: string
    }>
  }
}

interface HomeSectionsContextType {
  sections: HomeSection[]
  loading: boolean
  activeSections: HomeSection[]
  refreshSections: () => Promise<void>
}

const HomeSectionsContext = createContext<HomeSectionsContextType>({
  sections: [],
  loading: true,
  activeSections: [],
  refreshSections: async () => {},
})

export const useHomeSections = () => useContext(HomeSectionsContext)

interface HomeSectionsProviderProps {
  children: ReactNode
}

export function HomeSectionsProvider({ children }: HomeSectionsProviderProps) {
  const [sections, setSections] = useState<HomeSection[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/home-sections')
      const data = await res.json()
      setSections(data)
    } catch (error) {
      console.error('Error fetching home sections:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSections()
  }, [])

  const activeSections = sections.filter(section => section.isActive)

  return (
    <HomeSectionsContext.Provider
      value={{
        sections,
        loading,
        activeSections,
        refreshSections: fetchSections,
      }}
    >
      {children}
    </HomeSectionsContext.Provider>
  )
}
