const fs = require("fs")

// Utility script to analyze the filtered job data
function analyzeJobs() {
  try {
    const data = JSON.parse(fs.readFileSync("linkedin-angular-jobs-filtered.json", "utf8"))

    console.log("📊 Job Analysis Report")
    console.log("=".repeat(50))
    console.log(`Total Jobs: ${data.jobs.length}`)
    console.log(`Search Query: ${data.metadata.searchQuery}`)
    console.log(`Location: ${data.metadata.location}`)
    console.log(`Generated: ${data.metadata.timestamp}`)
    console.log()

    // Job type distribution
    const jobTypes = {}
    data.jobs.forEach((job) => {
      jobTypes[job.jobType] = (jobTypes[job.jobType] || 0) + 1
    })

    console.log("Job Type Distribution:")
    Object.entries(jobTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} jobs`)
    })
    console.log()

    // Top companies
    const companies = {}
    data.jobs.forEach((job) => {
      companies[job.company] = (companies[job.company] || 0) + 1
    })

    const topCompanies = Object.entries(companies)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    console.log("Top 5 Companies:")
    topCompanies.forEach(([company, count]) => {
      console.log(`  ${company}: ${count} jobs`)
    })
    console.log()

    // Salary information
    const jobsWithSalary = data.jobs.filter((job) => job.salary && job.salary.includes("$"))
    console.log(`Jobs with Salary Info: ${jobsWithSalary.length}/${data.jobs.length}`)

    // Verification status
    const verifiedJobs = data.jobs.filter((job) => job.isVerified).length
    console.log(`Verified Jobs: ${verifiedJobs}/${data.jobs.length}`)

    // Easy Apply jobs
    const easyApplyJobs = data.jobs.filter((job) => job.isEasyApply).length
    console.log(`Easy Apply Jobs: ${easyApplyJobs}/${data.jobs.length}`)
  } catch (error) {
    console.error("Error analyzing jobs:", error.message)
  }
}

// Run analysis if this file is executed directly
if (require.main === module) {
  analyzeJobs()
}

module.exports = { analyzeJobs }
