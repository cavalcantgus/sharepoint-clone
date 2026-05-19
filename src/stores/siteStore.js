import { defineStore } from 'pinia'

export const useSiteStore = defineStore('site', {
    state: () => ({
        selectedSite: JSON.parse(localStorage.getItem('selectedSite')) || null,
        sites: JSON.parse(localStorage.getItem('sites')) || []
    }),
    actions: {
        selectSite(site) {
            this.selectedSite = site
            localStorage.setItem('selectedSite', JSON.stringify(site))
        },
        setSites(sites) {
            this.sites = sites
            localStorage.setItem('sites', JSON.stringify(sites))
        },
        getSiteById(siteId) {
            return this.sites.find(site => site.id === siteId) ?? null
        }
    }
})