"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Square, Settings } from "lucide-react"
import type { ScrapingParams } from "@/app/page"

interface ScrapingFormProps {
  onStartScraping: (params: ScrapingParams) => void
  onStopScraping: () => void
  isActive: boolean
}

export function ScrapingForm({ onStartScraping, onStopScraping, isActive }: ScrapingFormProps) {
  const [params, setParams] = useState<ScrapingParams>({
    keywords: "angular",
    location: "United States",
    geoId: "103644278",
    timePosted: "any",
    jobType: "all",
    experienceLevel: "all",
    count: 25,
    startPage: 0,
    email: "",
    password: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!params.email || !params.password) {
      alert("Please provide LinkedIn credentials")
      return
    }
    onStartScraping(params)
  }

  const updateParam = (key: keyof ScrapingParams, value: string | number) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  const locationOptions = [
    { label: "United States", value: "103644278" },
    { label: "New York, NY", value: "105080838" },
    { label: "San Francisco, CA", value: "90000084" },
    { label: "Los Angeles, CA", value: "90000002" },
    { label: "Chicago, IL", value: "103112676" },
    { label: "Boston, MA", value: "100364837" },
    { label: "Seattle, WA", value: "104994827" },
    { label: "Austin, TX", value: "100364253" },
  ]

  const timePostedOptions = [
    { label: "Past 24 hours", value: "r86400" },
    { label: "Past week", value: "r604800" },
    { label: "Past month", value: "r2592000" },
    { label: "Any time", value: "any" },
  ]

  const jobTypeOptions = [
    { label: "All types", value: "all" },
    { label: "Full-time", value: "F" },
    { label: "Part-time", value: "P" },
    { label: "Contract", value: "C" },
    { label: "Temporary", value: "T" },
    { label: "Internship", value: "I" },
  ]

  const experienceLevelOptions = [
    { label: "All levels", value: "all" },
    { label: "Internship", value: "1" },
    { label: "Entry level", value: "2" },
    { label: "Associate", value: "3" },
    { label: "Mid-Senior level", value: "4" },
    { label: "Director", value: "5" },
    { label: "Executive", value: "6" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Scraping Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* LinkedIn Credentials */}
          <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800">LinkedIn Credentials</h4>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={params.email}
                onChange={(e) => updateParam("email", e.target.value)}
                placeholder="your-email@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={params.password}
                onChange={(e) => updateParam("password", e.target.value)}
                placeholder="Your LinkedIn password"
                required
              />
            </div>
            <p className="text-xs text-yellow-700">Your credentials are only used for scraping and are not stored.</p>
          </div>

          {/* Search Parameters */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                value={params.keywords}
                onChange={(e) => updateParam("keywords", e.target.value)}
                placeholder="e.g., angular, react, javascript"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={params.geoId}
                onValueChange={(value) => {
                  const location = locationOptions.find((loc) => loc.value === value)
                  updateParam("geoId", value)
                  updateParam("location", location?.label || "United States")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timePosted">Time Posted</Label>
              <Select
                value={params.timePosted || "any"}
                onValueChange={(value) => updateParam("timePosted", value === "any" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  {timePostedOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type</Label>
              <Select value={params.jobType} onValueChange={(value) => updateParam("jobType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Select value={params.experienceLevel} onValueChange={(value) => updateParam("experienceLevel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="count">Results per page</Label>
                <Select
                  value={params.count.toString()}
                  onValueChange={(value) => updateParam("count", Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startPage">Start Page</Label>
                <Input
                  id="startPage"
                  type="number"
                  min="0"
                  value={params.startPage}
                  onChange={(e) => updateParam("startPage", Number.parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            {!isActive ? (
              <Button type="submit" className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Start Scraping
              </Button>
            ) : (
              <Button type="button" variant="destructive" onClick={onStopScraping} className="flex-1">
                <Square className="h-4 w-4 mr-2" />
                Stop Scraping
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
