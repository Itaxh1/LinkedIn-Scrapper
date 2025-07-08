"use client"

import { useState } from "react"
import { ScrapingForm } from "@/components/scraping-form"
import { JobResults } from "@/components/job-results"
import { ScrapingProgress } from "@/components/scraping-progress"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

export interface ScrapingParams {
  keywords: string
  location: string
  geoId: string
  timePosted: string
  jobType: string
  experienceLevel: string
  count: number
  startPage: number
  email: string
  password: string
}

export interface JobData {
  metadata: {
    totalResults: number
    currentPage: number
    resultsPerPage: number
    searchQuery: string
    location: string
    timestamp: string
  }
  jobs: Array<{
    id: string
    title: string
    company: string
    location: string
    salary: string | null
    postedDate: string
    isPromoted: boolean
    isEasyApply: boolean
    isVerified: boolean
    isReposted: boolean
    actionTarget: string
    trackingId: string | null
    companyLogo: string | null
    relevanceInsight: string | null
    benefits: string[] | number | null
    jobType: string
  }>
}

export interface JobApplication {
  id: string
  jobId: string
  title: string
  company: string
  location: string
  salary: string | null
  jobType: string
  actionTarget: string
  appliedDate: string
  status: "applied" | "interview_scheduled" | "interviewed" | "offer_received" | "rejected" | "withdrawn"
  notes: string
  followUpDate?: string
  interviewDate?: string
  offerDetails?: string
  rejectionReason?: string
  priority: "low" | "medium" | "high"
  source: "linkedin" | "company_website" | "referral" | "other"
  contactPerson?: string
  contactEmail?: string
  applicationMethod: "easy_apply" | "company_website" | "email" | "referral"
  resumeVersion?: string
  coverLetterUsed: boolean
  tags: string[]
}

export default function LinkedInScraper() {
  const [isScrapingActive, setIsScrapingActive] = useState(false)
  const [scrapingProgress, setScrapingProgress] = useState<string>("")
  const [jobData, setJobData] = useState<JobData | null>(null)
  const [error, setError] = useState<string>("")
  const [blacklistedCompanies, setBlacklistedCompanies] = useState<string[]>([])

  const handleStartScraping = async (params: ScrapingParams) => {
    setIsScrapingActive(true)
    setError("")
    setJobData(null)
    setScrapingProgress("Initializing scraper...")

    try {
      const response = await fetch("/api/scrape-jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6))

                if (data.type === "progress") {
                  setScrapingProgress(data.message)
                } else if (data.type === "complete") {
                  setJobData(data.data)
                  setScrapingProgress("Scraping completed successfully!")
                } else if (data.type === "error") {
                  setError(data.message)
                }
              } catch (e) {
                console.error("Error parsing SSE data:", e)
              }
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsScrapingActive(false)
    }
  }

  const handleStopScraping = () => {
    setIsScrapingActive(false)
    setScrapingProgress("Scraping stopped by user")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">LinkedIn Job Scraper</h1>
              <p className="text-gray-600">Scrape jobs and track your applications with quick actions</p>
            </div>
            <Link href="/tracker">
              <Button variant="outline">
                📋 Application Tracker
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Scraping Form */}
          <div className="lg:col-span-1">
            <ScrapingForm
              onStartScraping={handleStartScraping}
              onStopScraping={handleStopScraping}
              isActive={isScrapingActive}
            />
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            {/* Progress Section */}
            {(isScrapingActive || scrapingProgress) && (
              <div className="mb-6">
                <ScrapingProgress isActive={isScrapingActive} progress={scrapingProgress} error={error} />
              </div>
            )}

            {/* Results Section */}
            {jobData && (
              <JobResults
                data={jobData}
                blacklistedCompanies={blacklistedCompanies}
                onUpdateBlacklist={setBlacklistedCompanies}
              />
            )}

            {/* Empty State */}
            {!isScrapingActive && !jobData && !error && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Scrape</h3>
                <p className="text-gray-500">Configure your search parameters and click "Start Scraping" to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
