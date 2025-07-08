"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Building2, MapPin, DollarSign, Clock, CheckCircle, Zap, ExternalLink } from "lucide-react"

interface Job {
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
}

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
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

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">{job.title}</h3>
              {job.isVerified && <CheckCircle className="h-5 w-5 text-green-500" />}
            </div>

            <div className="flex items-center gap-4 text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
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
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {job.salary && (
            <div className="flex items-center gap-2 text-green-600">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">{job.salary}</span>
            </div>
          )}

          {job.benefits && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Benefits: </span>
              {Array.isArray(job.benefits) ? job.benefits.join(", ") : `${job.benefits} benefits`}
            </div>
          )}

          {job.relevanceInsight && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">{job.relevanceInsight}</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Clock className="h-4 w-4" />
            <span>Posted {formatDate(job.postedDate)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button className="w-full" onClick={() => window.open(job.actionTarget, "_blank")}>
          View Job
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  )
}
