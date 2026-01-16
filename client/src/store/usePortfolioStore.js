import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Portfolio Store - Manages portfolio generation state
 * Uses resume data as source of truth, stores enhanced portfolio content
 */
const usePortfolioStore = create(
    persist(
        (set, get) => ({
            // Enhanced portfolio data from AI
            portfolioData: null,

            // Selected theme
            selectedTheme: 'minimal',

            // Portfolio settings
            settings: {
                isPublic: true,
                showPhone: false,
                showEmail: true,
                showLocation: true,
                enableDownload: true,
                username: '',
            },

            // Generation state
            isEnhancing: false,
            enhanceError: null,
            lastGenerated: null,

            // Actions
            setPortfolioData: (data) => set({
                portfolioData: data,
                lastGenerated: new Date().toISOString(),
                enhanceError: null
            }),

            setSelectedTheme: (theme) => set({ selectedTheme: theme }),

            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),

            setEnhancing: (isEnhancing) => set({ isEnhancing }),

            setEnhanceError: (error) => set({ enhanceError: error, isEnhancing: false }),

            clearPortfolio: () => set({
                portfolioData: null,
                lastGenerated: null,
                enhanceError: null
            }),

            // Get portfolio with applied settings (hide certain fields)
            getDisplayPortfolio: () => {
                const { portfolioData, settings } = get()
                if (!portfolioData) return null

                const display = { ...portfolioData }

                // Apply privacy settings to contact
                if (display.contact) {
                    display.contact = {
                        ...display.contact,
                        email: settings.showEmail ? display.contact.email : '',
                        phone: settings.showPhone ? display.contact.phone : '',
                        location: settings.showLocation ? display.contact.location : ''
                    }
                }

                return display
            }
        }),
        {
            name: 'portfolio-storage',
            partialize: (state) => ({
                portfolioData: state.portfolioData,
                selectedTheme: state.selectedTheme,
                settings: state.settings,
                lastGenerated: state.lastGenerated,
            }),
        }
    )
)

export default usePortfolioStore
