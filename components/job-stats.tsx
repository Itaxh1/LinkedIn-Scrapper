import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, Building2, MapPin, Clock } from "lucide-react"

interface Metadata {
  totalResults: number
  currentPage: number
  resultsPerPage: number
  searchQuery: string
  location: string
  timestamp: string
}

interface JobStatsProps {
  metadata: Metadata
  totalFiltered: number
}

export function JobStats({ metadata, totalFiltered }: JobStatsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalFiltered}</p>
              <p className="text-sm text-gray-600">Jobs Available</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{metadata.totalResults}</p>
              <p className="text-sm text-gray-600">Total Results</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{metadata.location}</p>
              <p className="text-sm text-gray-600">Location</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{formatDate(metadata.timestamp)}</p>
              <p className="text-sm text-gray-600">Last Updated</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
