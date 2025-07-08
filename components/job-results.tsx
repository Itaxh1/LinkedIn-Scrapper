"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Building2,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  Zap,
  ExternalLink,
  Search,
  Download,
  Filter,
  X,
  Ban,
  Plus,
} from "lucide-react"
import type { JobData } from "@/app/page"

interface JobResultsProps {
  data: JobData
  blacklistedCompanies: string[]
  onUpdateBlacklist: (companies: string[]) => void
}

export function JobResults({ data, blacklistedCompanies, onUpdateBlacklist }: JobResultsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    jobType: "all",
    company: "all",
    isVerified: false,
    isEasyApply: false,
    hasSalary: false,
  })
  const [newBlacklistCompany, setNewBlacklistCompany] = useState("")
  const [appliedJobs, setAppliedJobs] = useState<string[]>([])
  const [notMyExperienceJobs, setNotMyExperienceJobs] = useState<string[]>([])

  // Load applied jobs and experience filters from sessionStorage
  useEffect(() => {
    const savedAppliedJobs = sessionStorage.getItem("applied-jobs")
    const savedNotMyExperience = sessionStorage.getItem("not-my-experience-jobs")
    const savedBlacklist = sessionStorage.getItem("blacklisted-companies")

    if (savedAppliedJobs) {
      setAppliedJobs(JSON.parse(savedAppliedJobs))
    }
    if (savedNotMyExperience) {
      setNotMyExperienceJobs(JSON.parse(savedNotMyExperience))
    }
    if (savedBlacklist) {
      onUpdateBlacklist(JSON.parse(savedBlacklist))
    }
  }, [onUpdateBlacklist])

  // Save to sessionStorage whenever data changes
  useEffect(() => {
    sessionStorage.setItem("applied-jobs", JSON.stringify(appliedJobs))
  }, [appliedJobs])

  useEffect(() => {
    sessionStorage.setItem("not-my-experience-jobs", JSON.stringify(notMyExperienceJobs))
  }, [notMyExperienceJobs])

  useEffect(() => {
    sessionStorage.setItem("blacklisted-companies", JSON.stringify(blacklistedCompanies))
  }, [blacklistedCompanies])

  const markAsApplied = (job: any) => {
    if (!appliedJobs.includes(job.id)) {
      const newAppliedJobs = [...appliedJobs, job.id]
      setAppliedJobs(newAppliedJobs)

      // Also save to localStorage for permanent tracking
      const application = {
        id: Date.now().toString(),
        jobId: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        jobType: job.jobType,
        actionTarget: job.actionTarget,
        appliedDate: new Date().toISOString(),
        status: "applied",
        notes: "Applied via LinkedIn scraper",
        priority: "medium",
        source: "linkedin",
        applicationMethod: job.isEasyApply ? "easy_apply" : "company_website",
        coverLetterUsed: false,
        tags: [],
      }

      const existingApplications = JSON.parse(localStorage.getItem("job-applications") || "[]")
      localStorage.setItem("job-applications", JSON.stringify([...existingApplications, application]))

      alert(`✅ Marked "${job.title}" at ${job.company} as applied!`)
    }
  }

  const markAsNotMyExperience = (job: any) => {
    if (!notMyExperienceJobs.includes(job.id)) {
      setNotMyExperienceJobs([...notMyExperienceJobs, job.id])
      alert(`❌ Marked "${job.title}" as not matching your experience level`)
    }
  }

  const filteredJobs = useMemo(() => {
    return data.jobs.filter((job) => {
      // Hide applied jobs
      if (appliedJobs.includes(job.id)) {
        return false
      }

      // Hide not-my-experience jobs
      if (notMyExperienceJobs.includes(job.id)) {
        return false
      }

      // Blacklist filter - exclude blacklisted companies
      if (blacklistedCompanies.includes(job.company)) {
        return false
      }

      // Search term filter
      if (
        searchTerm &&
        !job.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !job.company.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false
      }

      // Job type filter
      if (filters.jobType !== "all" && job.jobType !== filters.jobType) {
        return false
      }

      // Company filter
      if (filters.company !== "all" && job.company !== filters.company) {
        return false
      }

      // Verification filter
      if (filters.isVerified && !job.isVerified) {
        return false
      }

      // Easy Apply filter
      if (filters.isEasyApply && !job.isEasyApply) {
        return false
      }

      // Salary filter
      if (filters.hasSalary && !job.salary) {
        return false
      }

      return true
    })
  }, [data.jobs, searchTerm, filters, blacklistedCompanies, appliedJobs, notMyExperienceJobs])

  const companies = [...new Set(data.jobs.map((job) => job.company))].sort()
  const jobTypes = [...new Set(data.jobs.map((job) => job.jobType))].sort()

  const addToBlacklist = (company: string) => {
    if (company && !blacklistedCompanies.includes(company)) {
      onUpdateBlacklist([...blacklistedCompanies, company])
    }
  }

  const removeFromBlacklist = (company: string) => {
    onUpdateBlacklist(blacklistedCompanies.filter((c) => c !== company))
  }

  const addCustomBlacklistCompany = () => {
    if (newBlacklistCompany.trim()) {
      addToBlacklist(newBlacklistCompany.trim())
      setNewBlacklistCompany("")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  const getJobTypeColor = (jobType: string) => {
    switch (jobType) {
      case "Remote":
        return "bg-green-100 text-green-800"
      case "Hybrid":
        return "bg-blue-100 text-blue-800"
      case "On-site":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const downloadResults = () => {
    const dataStr = JSON.stringify(filteredJobs, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `linkedin-jobs-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Scraping Results</CardTitle>
            <Button onClick={downloadResults} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download JSON
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredJobs.length}</div>
              <div className="text-sm text-gray-600">Available Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{appliedJobs.length}</div>
              <div className="text-sm text-gray-600">Applied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{notMyExperienceJobs.length}</div>
              <div className="text-sm text-gray-600">Not My Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{blacklistedCompanies.length}</div>
              <div className="text-sm text-gray-600">Blacklisted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{data.jobs.length}</div>
              <div className="text-sm text-gray-600">Total Scraped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{companies.length}</div>
              <div className="text-sm text-gray-600">Companies</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Blacklist Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5" />
            Company Blacklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Custom Company */}
          <div className="flex gap-2">
            <Input
              placeholder="Add company to blacklist..."
              value={newBlacklistCompany}
              onChange={(e) => setNewBlacklistCompany(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCustomBlacklistCompany()}
            />
            <Button onClick={addCustomBlacklistCompany} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Current Blacklisted Companies */}
          {blacklistedCompanies.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Blacklisted Companies:</label>
              <div className="flex flex-wrap gap-2">
                {blacklistedCompanies.map((company) => (
                  <Badge
                    key={company}
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={() => removeFromBlacklist(company)}
                  >
                    {company} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500">Click on a company badge to remove it from blacklist</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search jobs by title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={filters.jobType}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, jobType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {jobTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.company}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, company: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies
                  .filter((company) => !blacklistedCompanies.includes(company))
                  .map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Checkbox Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filters.isVerified}
                onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, isVerified: !!checked }))}
              />
              <label htmlFor="verified" className="text-sm">
                Verified Only
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="easyApply"
                checked={filters.isEasyApply}
                onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, isEasyApply: !!checked }))}
              />
              <label htmlFor="easyApply" className="text-sm">
                Easy Apply
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasSalary"
                checked={filters.hasSalary}
                onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, hasSalary: !!checked }))}
              />
              <label htmlFor="hasSalary" className="text-sm">
                Has Salary
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Listings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Job Listings</h3>
          <p className="text-sm text-gray-600">
            Showing {filteredJobs.length} of {data.jobs.length} jobs
            {blacklistedCompanies.length > 0 && (
              <span className="text-red-600 ml-2">
                (
                {data.jobs.length -
                  filteredJobs.length -
                  data.jobs.filter((job) => blacklistedCompanies.includes(job.company)).length}{" "}
                filtered, {data.jobs.filter((job) => blacklistedCompanies.includes(job.company)).length} blacklisted)
              </span>
            )}
          </p>
        </div>

        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                      {job.title}
                    </h4>
                    {job.isVerified && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {appliedJobs.includes(job.id) && <Badge className="bg-green-100 text-green-800">✓ Applied</Badge>}
                    {notMyExperienceJobs.includes(job.id) && (
                      <Badge className="bg-gray-100 text-gray-800">❌ Not My Level</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      <span>{job.company}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addToBlacklist(job.company)}
                        className="ml-2 h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        title="Add to blacklist"
                      >
                        <Ban className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(job.postedDate)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={getJobTypeColor(job.jobType)}>{job.jobType}</Badge>
                    {job.isPromoted && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Promoted
                      </Badge>
                    )}
                    {job.isEasyApply && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Zap className="h-3 w-3 mr-1" />
                        Easy Apply
                      </Badge>
                    )}
                    {job.isReposted && <Badge variant="outline">Reposted</Badge>}
                  </div>

                  {job.salary && (
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">{job.salary}</span>
                    </div>
                  )}

                  {job.relevanceInsight && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-blue-800">{job.relevanceInsight}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsApplied(job)}
                    className="text-green-600 hover:text-green-700"
                  >
                    ✓ Applied
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addToBlacklist(job.company)}
                    className="text-red-600 hover:text-red-700"
                  >
                    🚫 Blacklist
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsNotMyExperience(job)}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    ❌ Not My Level
                  </Button>
                  <Button onClick={() => window.open(job.actionTarget, "_blank")}>
                    View Job
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredJobs.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 text-lg">No jobs found matching your criteria</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
              {blacklistedCompanies.length > 0 && (
                <p className="text-red-500 mt-2">
                  {data.jobs.filter((job) => blacklistedCompanies.includes(job.company)).length} jobs are hidden due to
                  blacklisted companies
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
