"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, Loader2, Eye } from "lucide-react"

interface ScrapingProgressProps {
  isActive: boolean
  progress: string
  error?: string
}

export function ScrapingProgress({ isActive, progress, error }: ScrapingProgressProps) {
  const isCaptchaMode =
    progress.includes("CAPTCHA") || progress.includes("visible mode") || progress.includes("manually")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isActive ? (
            isCaptchaMode ? (
              <Eye className="h-5 w-5 text-orange-500" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            )
          ) : error ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {isCaptchaMode ? "Manual Verification Required" : "Scraping Status"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isActive && !isCaptchaMode && (
            <div className="space-y-2">
              <Progress value={undefined} className="w-full" />
              <p className="text-sm text-gray-600">Scraping in progress...</p>
            </div>
          )}

          {isCaptchaMode && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <Eye className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">Browser Opened for Manual Verification</p>
                  <p className="text-sm text-orange-700">
                    Please complete CAPTCHA or verification in the browser window
                  </p>
                </div>
              </div>
            </div>
          )}

          <div
            className={`p-3 rounded-lg ${
              error
                ? "bg-red-50 border border-red-200"
                : isCaptchaMode
                  ? "bg-orange-50 border border-orange-200"
                  : isActive
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-green-50 border border-green-200"
            }`}
          >
            <div
              className={`text-sm ${
                error
                  ? "text-red-700"
                  : isCaptchaMode
                    ? "text-orange-700"
                    : isActive
                      ? "text-blue-700"
                      : "text-green-700"
              }`}
            >
              {progress.split("\n").map((line, index) => (
                <div key={index} className={index > 0 ? "mt-1" : ""}>
                  {line || "Ready to start scraping"}
                </div>
              ))}
              {error && <div className="mt-2 font-medium">{error}</div>}
            </div>
          </div>

          {isCaptchaMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-800 mb-2">Instructions:</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. A browser window should have opened automatically</li>
                <li>2. Complete the login process including any CAPTCHA</li>
                <li>3. Wait until you reach the LinkedIn homepage</li>
                <li>4. The scraper will automatically continue once login is detected</li>
                <li>5. Do not close the browser window manually</li>
              </ol>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
