"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Search,
  Download,
  Upload,
  Calendar,
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  Edit,
  Trash2,
  ArrowLeft,
  FileText,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import type { JobApplication } from "@/app/page"

const statusColors = {
  applied: "bg-blue-100 text-blue-800",
  interview_scheduled: "bg-yellow-100 text-yellow-800",
  interviewed: "bg-purple-100 text-purple-800",
  offer_received: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-gray-100 text-gray-800",
}

const statusLabels = {
  applied: "Applied",
  interview_scheduled: "Interview Scheduled",
  interviewed: "Interviewed",
  offer_received: "Offer Received",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
}

export default function ApplicationTracker() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null)
  const [newApplication, setNewApplication] = useState<Partial<JobApplication>>({
    title: "",
    company: "",
    location: "",
    salary: "",
    jobType: "On-site",
    actionTarget: "",
    status: "applied",
    notes: "",
    priority: "medium",
    source: "linkedin",
    applicationMethod: "easy_apply",
    coverLetterUsed: false,
    tags: [],
  })

  // Load applications from localStorage on component mount
  useEffect(() => {
    const savedApplications = localStorage.getItem("job-applications")
    if (savedApplications) {
      try {
        setApplications(JSON.parse(savedApplications))
      } catch (error) {
        console.error("Error loading applications:", error)
      }
    }
  }, [])

  // Save applications to localStorage whenever applications change
  useEffect(() => {
    localStorage.setItem("job-applications", JSON.stringify(applications))
  }, [applications])

  const filteredApplications = applications.filter((app) => {
    if (
      searchTerm &&
      !app.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !app.company.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }
    if (statusFilter !== "all" && app.status !== statusFilter) {
      return false
    }
    if (priorityFilter !== "all" && app.priority !== priorityFilter) {
      return false
    }
    return true
  })

  const addApplication = () => {
    const application: JobApplication = {
      id: Date.now().toString(),
      jobId: newApplication.jobId || Date.now().toString(),
      title: newApplication.title || "",
      company: newApplication.company || "",
      location: newApplication.location || "",
      salary: newApplication.salary || null,
      jobType: newApplication.jobType || "On-site",
      actionTarget: newApplication.actionTarget || "",
      appliedDate: new Date().toISOString(),
      status: newApplication.status || "applied",
      notes: newApplication.notes || "",
      priority: newApplication.priority || "medium",
      source: newApplication.source || "linkedin",
      applicationMethod: newApplication.applicationMethod || "easy_apply",
      coverLetterUsed: newApplication.coverLetterUsed || false,
      tags: newApplication.tags || [],
      followUpDate: newApplication.followUpDate,
      interviewDate: newApplication.interviewDate,
      offerDetails: newApplication.offerDetails,
      rejectionReason: newApplication.rejectionReason,
      contactPerson: newApplication.contactPerson,
      contactEmail: newApplication.contactEmail,
      resumeVersion: newApplication.resumeVersion,
    }

    setApplications([...applications, application])
    setNewApplication({
      title: "",
      company: "",
      location: "",
      salary: "",
      jobType: "On-site",
      actionTarget: "",
      status: "applied",
      notes: "",
      priority: "medium",
      source: "linkedin",
      applicationMethod: "easy_apply",
      coverLetterUsed: false,
      tags: [],
    })
    setIsAddDialogOpen(false)
  }

  const updateApplication = (updatedApp: JobApplication) => {
    setApplications(applications.map((app) => (app.id === updatedApp.id ? updatedApp : app)))
    setEditingApplication(null)
  }

  const deleteApplication = (id: string) => {
    if (confirm("Are you sure you want to delete this application?")) {
      setApplications(applications.filter((app) => app.id !== id))
    }
  }

  const exportApplications = () => {
    const dataStr = JSON.stringify(applications, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `job-applications-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const importApplications = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedApps = JSON.parse(e.target?.result as string)
          if (Array.isArray(importedApps)) {
            setApplications([...applications, ...importedApps])
            alert(`Successfully imported ${importedApps.length} applications!`)
          } else {
            alert("Invalid file format. Please upload a valid JSON file.")
          }
        } catch (error) {
          alert("Error importing file. Please check the format.")
        }
      }
      reader.readAsText(file)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusStats = () => {
    const stats = applications.reduce(
      (acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    return stats
  }

  const getUpcomingFollowUps = () => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    return applications.filter((app) => {
      if (!app.followUpDate) return false
      const followUpDate = new Date(app.followUpDate)
      return followUpDate >= today && followUpDate <= nextWeek
    })
  }

  const getRecentApplications = () => {
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return applications.filter((app) => new Date(app.appliedDate) >= lastWeek)
  }

  const stats = getStatusStats()
  const upcomingFollowUps = getUpcomingFollowUps()
  const recentApplications = getRecentApplications()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Scraper
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Application Tracker</h1>
              <p className="text-gray-600">Manage and track all your job applications in one place</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{applications.length}</div>
              <div className="text-sm text-gray-600">Total Applied</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.interview_scheduled || 0}</div>
              <div className="text-sm text-gray-600">Interviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.offer_received || 0}</div>
              <div className="text-sm text-gray-600">Offers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected || 0}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {applications.filter((app) => app.priority === "high").length}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{upcomingFollowUps.length}</div>
              <div className="text-sm text-gray-600">Follow-ups Due</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">This week</span>
                  <span className="font-semibold">{recentApplications.length} applications</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success rate</span>
                  <span className="font-semibold">
                    {applications.length > 0
                      ? Math.round(((stats.offer_received || 0) / applications.length) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response rate</span>
                  <span className="font-semibold">
                    {applications.length > 0
                      ? Math.round(
                          (((stats.interview_scheduled || 0) + (stats.interviewed || 0) + (stats.offer_received || 0)) /
                            applications.length) *
                            100,
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Upcoming Follow-ups
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingFollowUps.length > 0 ? (
                <div className="space-y-2">
                  {upcomingFollowUps.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{app.company}</div>
                        <div className="text-xs text-gray-500">{app.title}</div>
                      </div>
                      <div className="text-xs text-gray-500">{app.followUpDate && formatDate(app.followUpDate)}</div>
                    </div>
                  ))}
                  {upcomingFollowUps.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">+{upcomingFollowUps.length - 3} more</div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No upcoming follow-ups</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Companies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(
                    applications.reduce(
                      (acc, app) => {
                        acc[app.company] = (acc[app.company] || 0) + 1
                        return acc
                      },
                      {} as Record<string, number>,
                    ),
                  )
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([company, count]) => (
                      <div key={company} className="flex items-center justify-between">
                        <span className="font-medium text-sm">{company}</span>
                        <span className="text-xs text-gray-500">{count} applications</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No applications yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Application Management</CardTitle>
              <div className="flex gap-2">
                <input type="file" accept=".json" onChange={importApplications} className="hidden" id="import-file" />
                <Button variant="outline" size="sm" onClick={() => document.getElementById("import-file")?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" size="sm" onClick={exportApplications}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Application
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Application</DialogTitle>
                      <DialogDescription>Track a new job application with detailed information.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title *</Label>
                        <Input
                          id="title"
                          value={newApplication.title}
                          onChange={(e) => setNewApplication({ ...newApplication, title: e.target.value })}
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company *</Label>
                        <Input
                          id="company"
                          value={newApplication.company}
                          onChange={(e) => setNewApplication({ ...newApplication, company: e.target.value })}
                          placeholder="Tech Corp"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={newApplication.location}
                          onChange={(e) => setNewApplication({ ...newApplication, location: e.target.value })}
                          placeholder="San Francisco, CA"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salary">Salary</Label>
                        <Input
                          id="salary"
                          value={newApplication.salary}
                          onChange={(e) => setNewApplication({ ...newApplication, salary: e.target.value })}
                          placeholder="$120,000 - $150,000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobType">Job Type</Label>
                        <Select
                          value={newApplication.jobType}
                          onValueChange={(value) => setNewApplication({ ...newApplication, jobType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Remote">Remote</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                            <SelectItem value="On-site">On-site</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={newApplication.priority}
                          onValueChange={(value: "low" | "medium" | "high") =>
                            setNewApplication({ ...newApplication, priority: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="source">Source</Label>
                        <Select
                          value={newApplication.source}
                          onValueChange={(value: "linkedin" | "company_website" | "referral" | "other") =>
                            setNewApplication({ ...newApplication, source: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="company_website">Company Website</SelectItem>
                            <SelectItem value="referral">Referral</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="applicationMethod">Application Method</Label>
                        <Select
                          value={newApplication.applicationMethod}
                          onValueChange={(value: "easy_apply" | "company_website" | "email" | "referral") =>
                            setNewApplication({ ...newApplication, applicationMethod: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy_apply">Easy Apply</SelectItem>
                            <SelectItem value="company_website">Company Website</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="referral">Referral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input
                          id="contactPerson"
                          value={newApplication.contactPerson}
                          onChange={(e) => setNewApplication({ ...newApplication, contactPerson: e.target.value })}
                          placeholder="John Smith"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={newApplication.contactEmail}
                          onChange={(e) => setNewApplication({ ...newApplication, contactEmail: e.target.value })}
                          placeholder="john@company.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="resumeVersion">Resume Version</Label>
                        <Input
                          id="resumeVersion"
                          value={newApplication.resumeVersion}
                          onChange={(e) => setNewApplication({ ...newApplication, resumeVersion: e.target.value })}
                          placeholder="Resume_v2.1_TechFocus"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="actionTarget">Job URL</Label>
                        <Input
                          id="actionTarget"
                          value={newApplication.actionTarget}
                          onChange={(e) => setNewApplication({ ...newApplication, actionTarget: e.target.value })}
                          placeholder="https://linkedin.com/jobs/view/123456"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="followUpDate">Follow-up Date</Label>
                        <Input
                          id="followUpDate"
                          type="date"
                          value={newApplication.followUpDate?.split("T")[0] || ""}
                          onChange={(e) =>
                            setNewApplication({
                              ...newApplication,
                              followUpDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="interviewDate">Interview Date</Label>
                        <Input
                          id="interviewDate"
                          type="datetime-local"
                          value={newApplication.interviewDate?.slice(0, 16) || ""}
                          onChange={(e) =>
                            setNewApplication({
                              ...newApplication,
                              interviewDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                            })
                          }
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={newApplication.notes}
                          onChange={(e) => setNewApplication({ ...newApplication, notes: e.target.value })}
                          placeholder="Additional notes about the application..."
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="coverLetter"
                          checked={newApplication.coverLetterUsed}
                          onCheckedChange={(checked) =>
                            setNewApplication({ ...newApplication, coverLetterUsed: !!checked })
                          }
                        />
                        <Label htmlFor="coverLetter">Cover Letter Used</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addApplication} disabled={!newApplication.title || !newApplication.company}>
                        Add Application
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by job title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="interviewed">Interviewed</SelectItem>
                  <SelectItem value="offer_received">Offer Received</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Applications</h3>
            <p className="text-sm text-gray-600">
              Showing {filteredApplications.length} of {applications.length} applications
            </p>
          </div>

          {filteredApplications.map((app) => (
            <Card key={app.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-xl font-semibold text-gray-900">{app.title}</h4>
                      <Badge className={statusColors[app.status]}>{statusLabels[app.status]}</Badge>
                      <Badge className={priorityColors[app.priority]}>{app.priority.toUpperCase()}</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        <span>{app.company}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{app.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Applied {formatDate(app.appliedDate)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">{app.jobType}</Badge>
                      <Badge variant="outline">{app.source}</Badge>
                      <Badge variant="outline">{app.applicationMethod.replace("_", " ")}</Badge>
                      {app.coverLetterUsed && <Badge variant="outline">Cover Letter</Badge>}
                    </div>

                    {app.salary && (
                      <div className="flex items-center gap-2 text-green-600 mb-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">{app.salary}</span>
                      </div>
                    )}

                    {app.notes && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <p className="text-sm text-gray-700">{app.notes}</p>
                      </div>
                    )}

                    {app.contactPerson && (
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Contact: </span>
                        {app.contactPerson}
                        {app.contactEmail && (
                          <span className="ml-2">
                            <a href={`mailto:${app.contactEmail}`} className="text-blue-600 hover:underline">
                              {app.contactEmail}
                            </a>
                          </span>
                        )}
                      </div>
                    )}

                    {app.followUpDate && (
                      <div className="text-sm text-orange-600 mb-2">
                        <span className="font-medium">Follow-up: </span>
                        {formatDate(app.followUpDate)}
                      </div>
                    )}

                    {app.interviewDate && (
                      <div className="text-sm text-purple-600 mb-2">
                        <span className="font-medium">Interview: </span>
                        {new Date(app.interviewDate).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {app.actionTarget && (
                      <Button variant="outline" size="sm" onClick={() => window.open(app.actionTarget, "_blank")}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setEditingApplication(app)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteApplication(app.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredApplications.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No applications found</p>
                <p className="text-gray-400 mt-2">
                  {applications.length === 0
                    ? "Start tracking your job applications by clicking 'Add Application'"
                    : "Try adjusting your search or filters"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Application Dialog */}
        {editingApplication && (
          <Dialog open={!!editingApplication} onOpenChange={() => setEditingApplication(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Application</DialogTitle>
                <DialogDescription>Update your application details and status.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Job Title</Label>
                  <Input
                    id="edit-title"
                    value={editingApplication.title}
                    onChange={(e) => setEditingApplication({ ...editingApplication, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Company</Label>
                  <Input
                    id="edit-company"
                    value={editingApplication.company}
                    onChange={(e) => setEditingApplication({ ...editingApplication, company: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingApplication.status}
                    onValueChange={(value: JobApplication["status"]) =>
                      setEditingApplication({ ...editingApplication, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                      <SelectItem value="interviewed">Interviewed</SelectItem>
                      <SelectItem value="offer_received">Offer Received</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    value={editingApplication.priority}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setEditingApplication({ ...editingApplication, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-followUpDate">Follow-up Date</Label>
                  <Input
                    id="edit-followUpDate"
                    type="date"
                    value={editingApplication.followUpDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      setEditingApplication({
                        ...editingApplication,
                        followUpDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-interviewDate">Interview Date</Label>
                  <Input
                    id="edit-interviewDate"
                    type="datetime-local"
                    value={editingApplication.interviewDate?.slice(0, 16) || ""}
                    onChange={(e) =>
                      setEditingApplication({
                        ...editingApplication,
                        interviewDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                      })
                    }
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={editingApplication.notes}
                    onChange={(e) => setEditingApplication({ ...editingApplication, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingApplication(null)}>
                  Cancel
                </Button>
                <Button onClick={() => updateApplication(editingApplication)}>Update Application</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
