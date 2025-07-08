"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

interface Filters {
  jobType: string
  company: string
  isVerified: boolean
  isEasyApply: boolean
  hasRemote: boolean
  hasSalary: boolean
}

interface JobFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  jobs: any[]
}

export function JobFilters({ filters, onFiltersChange, jobs }: JobFiltersProps) {
  const updateFilter = (key: keyof Filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      jobType: "all",
      company: "all",
      isVerified: false,
      isEasyApply: false,
      hasRemote: false,
      hasSalary: false,
    })
  }

  // Get unique companies and job types
  const companies = [...new Set(jobs.map((job) => job.company))].sort()
  const jobTypes = [...new Set(jobs.map((job) => job.jobType))].sort()

  const hasActiveFilters =
    filters.jobType !== "all" ||
    filters.company !== "all" ||
    filters.isVerified ||
    filters.isEasyApply ||
    filters.hasRemote ||
    filters.hasSalary

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Job Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Type</label>
            <Select value={filters.jobType} onValueChange={(value) => updateFilter("jobType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
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
          </div>

          {/* Company Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Company</label>
            <Select value={filters.company} onValueChange={(value) => updateFilter("company", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Checkbox Filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={filters.isVerified}
              onCheckedChange={(checked) => updateFilter("isVerified", checked)}
            />
            <label htmlFor="verified" className="text-sm">
              Verified Only
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="easyApply"
              checked={filters.isEasyApply}
              onCheckedChange={(checked) => updateFilter("isEasyApply", checked)}
            />
            <label htmlFor="easyApply" className="text-sm">
              Easy Apply
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remote"
              checked={filters.hasRemote}
              onCheckedChange={(checked) => updateFilter("hasRemote", checked)}
            />
            <label htmlFor="remote" className="text-sm">
              Remote Only
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="salary"
              checked={filters.hasSalary}
              onCheckedChange={(checked) => updateFilter("hasSalary", checked)}
            />
            <label htmlFor="salary" className="text-sm">
              Has Salary
            </label>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Active Filters:</label>
            <div className="flex flex-wrap gap-2">
              {filters.jobType !== "all" && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter("jobType", "all")}>
                  {filters.jobType} <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {filters.company !== "all" && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter("company", "all")}>
                  {filters.company} <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {filters.isVerified && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter("isVerified", false)}>
                  Verified <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {filters.isEasyApply && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => updateFilter("isEasyApply", false)}
                >
                  Easy Apply <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {filters.hasRemote && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter("hasRemote", false)}>
                  Remote <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {filters.hasSalary && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => updateFilter("hasSalary", false)}>
                  Has Salary <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
