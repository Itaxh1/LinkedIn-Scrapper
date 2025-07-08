const { chromium } = require("playwright")
const fs = require("fs")
;(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 })
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0",
  })
  const page = await context.newPage()

  // Login
  await page.goto("https://www.linkedin.com/login")
  await page.fill("input#username", "email.com")
  await page.fill("input#password", "Password123")
  await Promise.all([page.waitForNavigation({ waitUntil: "domcontentloaded" }), page.click('button[type="submit"]')])

  // Check login success
  const urlAfterLogin = page.url()
  if (urlAfterLogin.includes("/checkpoint") || urlAfterLogin.includes("login")) {
    console.error("❌ Login failed — possibly CAPTCHA or verification required.")
    await browser.close()
    return
  }

  // Get cookies and extract csrf-token from JSESSIONID
  const cookies = await context.cookies()
  const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ")
  const jsessionCookie = cookies.find((c) => c.name === "JSESSIONID")
  const csrfToken = jsessionCookie?.value?.replace(/"/g, "") // remove quotes from value

  // Prepare API headers
  const apiHeaders = {
    authority: "www.linkedin.com",
    accept: "application/vnd.linkedin.normalized+json+2.1",
    "csrf-token": csrfToken,
    "x-restli-protocol-version": "2.0.0",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0",
    cookie: cookieHeader,
  }

  // Voyager job search API URL
  const apiUrl =
    "https://www.linkedin.com/voyager/api/voyagerJobsDashJobCards?decorationId=com.linkedin.voyager.dash.deco.jobs.search.JobSearchCardsCollection-220&count=25&q=jobSearch&query=(origin:JOB_SEARCH_PAGE_JOB_FILTER,keywords:angular,locationUnion:(geoId:103644278),selectedFilters:(timePostedRange:List(r86400)),spellCorrectionEnabled:true)&start=25"

  // Make request to LinkedIn Jobs Voyager API
  const response = await context.request.get(apiUrl, { headers: apiHeaders })

  if (response.ok()) {
    const data = await response.json()

    // Filter and process the job data
    const filteredJobs = filterJobData(data)

    // Save both raw and filtered data
    fs.writeFileSync("linkedin-angular-jobs-raw.json", JSON.stringify(data, null, 2))
    fs.writeFileSync("linkedin-angular-jobs-filtered.json", JSON.stringify(filteredJobs, null, 2))

    console.log("✅ Saved raw job results to linkedin-angular-jobs-raw.json")
    console.log("✅ Saved filtered job results to linkedin-angular-jobs-filtered.json")
    console.log(`📊 Found ${filteredJobs.jobs.length} jobs`)
  } else {
    console.error(`❌ Failed to fetch API: ${response.status()}`)
    const errorText = await response.text()
    console.error(errorText)
  }

  await browser.close()
})()

function filterJobData(rawData) {
  const jobs = []
  const companies = {}

  // Extract job postings from included array
  const jobPostings =
    rawData.included?.filter((item) => item.$type === "com.linkedin.voyager.dash.jobs.JobPosting") || []

  // Extract job posting cards from included array
  const jobCards =
    rawData.included?.filter(
      (item) =>
        item.$type === "com.linkedin.voyager.dash.jobs.JobPostingCard" && item.entityUrn?.includes("JOBS_SEARCH"),
    ) || []

  // Extract company information
  rawData.included?.forEach((item) => {
    if (item.$type === "com.linkedin.voyager.dash.organization.Company") {
      companies[item.entityUrn] = {
        name: extractCompanyName(item.entityUrn),
        logo: item.logo?.vectorImage?.rootUrl || null,
      }
    }
  })

  // Process job cards and match with job postings
  jobCards.forEach((card) => {
    const jobId = extractJobId(card.jobPostingUrn)
    const jobPosting = jobPostings.find((posting) => posting.entityUrn.includes(jobId))

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
    jobs: jobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate)),
  }
}

function extractJobId(jobPostingUrn) {
  const match = jobPostingUrn?.match(/(\d+)/)
  return match ? match[1] : null
}

function cleanTitle(title) {
  // Remove verification icons and extra spaces
  return title?.replace(/\s+/g, " ").trim() || ""
}

function extractPostedDate(footerItems) {
  const dateItem = footerItems?.find((item) => item.type === "LISTED_DATE")
  if (dateItem?.timeAt) {
    return new Date(dateItem.timeAt).toISOString()
  }
  return null
}

function isPromotedJob(footerItems) {
  return footerItems?.some((item) => item.type === "PROMOTED") || false
}

function isEasyApplyJob(footerItems) {
  return footerItems?.some((item) => item.type === "EASY_APPLY_TEXT") || false
}

function extractCompanyName(entityUrn) {
  // Extract company name from URN or return generic name
  const match = entityUrn?.match(/company:(\d+)/)
  return match ? `Company_${match[1]}` : "Unknown Company"
}

function extractCompanyLogo(logo) {
  if (logo?.attributes?.[0]?.detailDataUnion?.companyLogo) {
    return logo.actionTarget || null
  }
  return null
}

function extractBenefits(tertiaryText) {
  if (!tertiaryText) return null

  const benefitMatch = tertiaryText.match(/(\d+)\s+benefit/)
  if (benefitMatch) {
    return Number.parseInt(benefitMatch[1])
  }

  // Extract specific benefits mentioned
  const benefits = []
  if (tertiaryText.includes("401(k)")) benefits.push("401(k)")
  if (tertiaryText.includes("Medical")) benefits.push("Medical")
  if (tertiaryText.includes("Vision")) benefits.push("Vision")

  return benefits.length > 0 ? benefits : null
}

function extractJobType(locationText) {
  if (!locationText) return "Not specified"

  if (locationText.includes("Remote")) return "Remote"
  if (locationText.includes("Hybrid")) return "Hybrid"
  if (locationText.includes("On-site")) return "On-site"

  return "On-site" // Default assumption
}
