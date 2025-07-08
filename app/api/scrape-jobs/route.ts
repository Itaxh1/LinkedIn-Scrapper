import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const params = await request.json()

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      // Function to send progress updates
      const sendProgress = (message: string) => {
        const data = JSON.stringify({ type: "progress", message })
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }

      // Function to send completion
      const sendComplete = (data: any) => {
        const response = JSON.stringify({ type: "complete", data })
        controller.enqueue(encoder.encode(`data: ${response}\n\n`))
      }

      // Function to send error
      const sendError = (message: string) => {
        const error = JSON.stringify({ type: "error", message })
        controller.enqueue(encoder.encode(`data: ${error}\n\n`))
      }

      // Start the scraping process
      runScraper(params, sendProgress, sendComplete, sendError).finally(() => {
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

async function runScraper(
  params: any,
  sendProgress: (message: string) => void,
  sendComplete: (data: any) => void,
  sendError: (message: string) => void,
) {
  try {
    // Import Playwright dynamically (since it's a Node.js module)
    const { chromium } = await import("playwright")

    sendProgress("Launching browser...")

    // Start with headless mode
    let browser = await chromium.launch({
      headless: true,
      slowMo: 500,
    })

    let context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0",
    })
    let page = await context.newPage()

    sendProgress("Navigating to LinkedIn login...")
    await page.goto("https://www.linkedin.com/login")

    sendProgress("Filling login credentials...")
    await page.fill("input#username", params.email)
    await page.fill("input#password", params.password)

    sendProgress("Submitting login form...")
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 30000 }),
      page.click('button[type="submit"]'),
    ])

    // Check login success
    const urlAfterLogin = page.url()
    sendProgress(`Login attempt completed. Current URL: ${urlAfterLogin}`)

    if (
      urlAfterLogin.includes("/checkpoint") ||
      urlAfterLogin.includes("login") ||
      urlAfterLogin.includes("challenge")
    ) {
      sendProgress("⚠️ CAPTCHA or verification detected! Switching to visible browser mode...")

      // Close headless browser
      await browser.close()

      // Launch browser in visible mode for CAPTCHA solving
      browser = await chromium.launch({
        headless: false,
        slowMo: 1000,
        args: ["--start-maximized"],
      })

      context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0",
        viewport: null, // Use full screen
      })
      page = await context.newPage()

      sendProgress("🔓 Browser opened in visible mode. Please solve CAPTCHA manually...")
      sendProgress("📋 Steps to complete:")
      sendProgress("1. Navigate to https://www.linkedin.com/login")
      sendProgress("2. Enter your credentials")
      sendProgress("3. Solve any CAPTCHA or verification")
      sendProgress("4. Wait until you reach LinkedIn homepage")
      sendProgress("⏳ Waiting for you to complete login manually...")

      // Navigate to login page
      await page.goto("https://www.linkedin.com/login")

      // Fill credentials again
      await page.fill("input#username", params.email)
      await page.fill("input#password", params.password)

      // Wait for user to manually complete login and reach homepage
      let loginCompleted = false
      let attempts = 0
      const maxAttempts = 60 // 5 minutes (60 * 5 seconds)

      while (!loginCompleted && attempts < maxAttempts) {
        try {
          const currentUrl = page.url()
          sendProgress(
            `⏳ Waiting for login completion... (${attempts + 1}/${maxAttempts}) - Current URL: ${currentUrl}`,
          )

          // Check if we're on LinkedIn homepage or feed
          if (
            currentUrl.includes("linkedin.com/feed") ||
            currentUrl.includes("linkedin.com/in/") ||
            (currentUrl.includes("linkedin.com") &&
              !currentUrl.includes("login") &&
              !currentUrl.includes("checkpoint") &&
              !currentUrl.includes("challenge"))
          ) {
            loginCompleted = true
            sendProgress("✅ Login completed successfully!")
            break
          }

          // Wait 5 seconds before checking again
          await page.waitForTimeout(5000)
          attempts++
        } catch (error) {
          sendProgress(`⏳ Still waiting for login... (${attempts + 1}/${maxAttempts})`)
          attempts++
          await page.waitForTimeout(5000)
        }
      }

      if (!loginCompleted) {
        await browser.close()
        sendError("❌ Login timeout. Please try again and complete the login process faster.")
        return
      }
    } else {
      sendProgress("✅ Login successful without CAPTCHA!")
    }

    sendProgress("🔑 Login successful, extracting session data...")

    // Get cookies and extract csrf-token from JSESSIONID
    const cookies = await context.cookies()
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ")
    const jsessionCookie = cookies.find((c) => c.name === "JSESSIONID")
    const csrfToken = jsessionCookie?.value?.replace(/"/g, "")

    if (!csrfToken) {
      sendError("❌ Could not extract CSRF token. Login may have failed.")
      await browser.close()
      return
    }

    // Prepare API headers - matching your working code exactly
    const apiHeaders = {
      authority: "www.linkedin.com",
      accept: "application/vnd.linkedin.normalized+json+2.1",
      "csrf-token": csrfToken,
      "x-restli-protocol-version": "2.0.0",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0",
      cookie: cookieHeader,
    }

    // Build search query exactly like your working code
    let searchQuery = `(origin:JOB_SEARCH_PAGE_JOB_FILTER,keywords:${params.keywords},locationUnion:(geoId:${params.geoId})`

    // Add filters only if they're not default values
    const filters = []

    if (params.timePosted && params.timePosted !== "" && params.timePosted !== "any") {
      filters.push(`timePostedRange:List(${params.timePosted})`)
    }

    if (params.jobType !== "all") {
      filters.push(`jobType:List(${params.jobType})`)
    }

    if (params.experienceLevel !== "all") {
      filters.push(`experienceLevel:List(${params.experienceLevel})`)
    }

    if (filters.length > 0) {
      searchQuery += `,selectedFilters:(${filters.join(",")})`
    }

    searchQuery += ",spellCorrectionEnabled:true)"

    // Build the complete API URL like your working code - WITHOUT encoding the query
    const apiUrl = `https://www.linkedin.com/voyager/api/voyagerJobsDashJobCards?decorationId=com.linkedin.voyager.dash.deco.jobs.search.JobSearchCardsCollection-220&count=${params.count}&q=jobSearch&query=${searchQuery}&start=${params.startPage * params.count}`

    sendProgress("🔍 Fetching job data from LinkedIn API...")
    sendProgress(`📡 API URL: ${apiUrl}`)

    // Make request to LinkedIn Jobs Voyager API
    const response = await context.request.get(apiUrl, { headers: apiHeaders })

    if (response.ok()) {
      const data = await response.json()

      sendProgress("⚙️ Processing and filtering job data...")

      // Filter and process the job data
      const filteredJobs = filterJobData(data)

      sendProgress(`✅ Successfully processed ${filteredJobs.jobs.length} jobs`)

      // Send the complete data
      sendComplete(filteredJobs)
    } else {
      const errorText = await response.text()
      sendError(`❌ Failed to fetch API: ${response.status()} - ${errorText}`)
      sendError(`📡 API URL was: ${apiUrl}`)
    }

    await browser.close()
  } catch (error) {
    sendError(`💥 Scraping error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Your existing filter functions (copied from the original script)
function filterJobData(rawData: any) {
  const jobs: any[] = []
  const companies: any = {}

  // Extract job postings from included array
  const jobPostings =
    rawData.included?.filter((item: any) => item.$type === "com.linkedin.voyager.dash.jobs.JobPosting") || []

  // Extract job posting cards from included array
  const jobCards =
    rawData.included?.filter(
      (item: any) =>
        item.$type === "com.linkedin.voyager.dash.jobs.JobPostingCard" && item.entityUrn?.includes("JOBS_SEARCH"),
    ) || []

  // Extract company information
  rawData.included?.forEach((item: any) => {
    if (item.$type === "com.linkedin.voyager.dash.organization.Company") {
      companies[item.entityUrn] = {
        name: extractCompanyName(item.entityUrn),
        logo: item.logo?.vectorImage?.rootUrl || null,
      }
    }
  })

  // Process job cards and match with job postings
  jobCards.forEach((card: any) => {
    const jobId = extractJobId(card.jobPostingUrn)
    const jobPosting = jobPostings.find((posting: any) => posting.entityUrn.includes(jobId))

    if (jobPosting && card.title) {
      const job = {
        id: jobId,
        title: cleanTitle(card.title.text),
        company: card.primaryDescription?.text || "Unknown Company",
        location: card.secondaryDescription?.text || "Location not specified",
        salary: card.tertiaryDescription?.text || null,
        postedDate: extractPostedDate(card.footerItems),
        isPromoted: isPromotedJob(card.footerItems),
        isEasyApply: isEasyApplyJob(card.footerItems),
        isVerified: card.jobPostingVerificationUrn ? true : false,
        isReposted: jobPosting.repostedJob || false,
        actionTarget: `https://www.linkedin.com/jobs/view/${jobId}`,
        trackingId: card.trackingId || null,
        companyLogo: extractCompanyLogo(card.logo),
        relevanceInsight: card.relevanceInsight?.text?.text || null,
        benefits: extractBenefits(card.tertiaryDescription?.text),
        jobType: extractJobType(card.secondaryDescription?.text),
      }

      jobs.push(job)
    }
  })

  return {
    metadata: {
      totalResults: rawData.data?.paging?.total || 0,
      currentPage: Math.floor((rawData.data?.paging?.start || 0) / 25) + 1,
      resultsPerPage: rawData.data?.paging?.count || 25,
      searchQuery: rawData.data?.metadata?.keywords || "angular",
      location: rawData.data?.metadata?.title?.text || "United States",
      timestamp: new Date().toISOString(),
    },
    jobs: jobs.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()),
  }
}

function extractJobId(jobPostingUrn: string) {
  const match = jobPostingUrn?.match(/(\d+)/)
  return match ? match[1] : null
}

function cleanTitle(title: string) {
  return title?.replace(/\s+/g, " ").trim() || ""
}

function extractPostedDate(footerItems: any[]) {
  const dateItem = footerItems?.find((item) => item.type === "LISTED_DATE")
  if (dateItem?.timeAt) {
    return new Date(dateItem.timeAt).toISOString()
  }
  return null
}

function isPromotedJob(footerItems: any[]) {
  return footerItems?.some((item) => item.type === "PROMOTED") || false
}

function isEasyApplyJob(footerItems: any[]) {
  return footerItems?.some((item) => item.type === "EASY_APPLY_TEXT") || false
}

function extractCompanyName(entityUrn: string) {
  const match = entityUrn?.match(/company:(\d+)/)
  return match ? `Company_${match[1]}` : "Unknown Company"
}

function extractCompanyLogo(logo: any) {
  if (logo?.attributes?.[0]?.detailDataUnion?.companyLogo) {
    return logo.actionTarget || null
  }
  return null
}

function extractBenefits(tertiaryText: string) {
  if (!tertiaryText) return null

  const benefitMatch = tertiaryText.match(/(\d+)\s+benefit/)
  if (benefitMatch) {
    return Number.parseInt(benefitMatch[1])
  }

  const benefits = []
  if (tertiaryText.includes("401(k)")) benefits.push("401(k)")
  if (tertiaryText.includes("Medical")) benefits.push("Medical")
  if (tertiaryText.includes("Vision")) benefits.push("Vision")

  return benefits.length > 0 ? benefits : null
}

function extractJobType(locationText: string) {
  if (!locationText) return "Not specified"

  if (locationText.includes("Remote")) return "Remote"
  if (locationText.includes("Hybrid")) return "Hybrid"
  if (locationText.includes("On-site")) return "On-site"

  return "On-site"
}
