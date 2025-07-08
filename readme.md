
# LinkedIn Job Scraper & Application Tracker  

A handy tool to help you find and track job opportunities on LinkedIn. Built with Next.js and Playwright, this application lets you search for jobs efficiently while keeping your application process organized—all from your browser.  

## Key Features  

### 🔍 Find Jobs  
- **LinkedIn Search**: Pull job postings directly from LinkedIn  
- **Custom Filters**: Narrow down by location, job type, experience level, and posting date  
- **Live Updates**: See results as they come in  
- **CAPTCHA Support**: Handles verification prompts when needed  
- **Login Management**: Works with your LinkedIn account  

### 📋 Track Applications  
- **Full History**: Log every application from start to finish  
- **Status Updates**: Track where you are in the process (applied, interviewed, offer, etc.)  
- **Priority Levels**: Flag important opportunities  
- **Contact Info**: Save recruiter/hiring manager details  
- **Follow-ups**: Set reminders for next steps  
- **Notes**: Add thoughts or details for each application  

### ⚡ Quick Tools  
- **One-Click Apply Tracking**: Mark jobs as applied right from search results  
- **Company Blocklist**: Hide jobs from specific companies  
- **Experience Filter**: Skip postings that don’t match your level  
- **Auto-Hide**: Clean up viewed or irrelevant jobs  

### 📊 Insights  
- **Stats Dashboard**: See application rates, responses, and trends  
- **Progress Overview**: Visualize your job search journey  
- **Weekly Activity**: Track how many jobs you’ve applied to  
- **Top Companies**: See who’s posting the most  

### 💾 Data Handling  
- **Local Storage**: Everything stays in your browser  
- **Backup/Restore**: Save or load your data via JSON  
- **Saved Preferences**: Filters and settings persist between sessions  

## Setup  

### What You’ll Need  
- Node.js 18+  
- npm or yarn  

### Get Started  
1. Clone the repo:  
   ```bash  
   git clone <repo-url>  
   cd linkedin-job-scraper  
   ```  
2. Install dependencies:  
   ```bash  
   npm install  
   ```  
3. Set up Playwright:  
   ```bash  
   npx playwright install  
   ```  
4. Run the app:  
   ```bash  
   npm run dev  
   ```  
5. Open your browser to `http://localhost:3000`  

## How to Use  

### Searching for Jobs  
1. **Set Your Criteria**: Enter keywords, location, and filters.  
2. **Log In**: Provide your LinkedIn credentials (not stored).  
3. **Start Searching**: Click "Scrape Jobs" and watch results appear.  
4. **Handle CAPTCHAs**: Solve any verification prompts if they pop up.  
5. **Review Jobs**: Browse listings and take action.  

### Quick Job Actions  
- **✓ Applied**: Log an application  
- **🚫 Block**: Hide jobs from a company  
- **❌ Skip**: Remove mismatched roles  
- **View Posting**: Open the original LinkedIn page  

### Managing Applications  
1. Go to the **Tracker** tab.  
2. **Add Manually** or let the scraper auto-add when you mark jobs as applied.  
3. **Update Statuses** as you progress through interviews.  
4. **Check Stats** to see how your search is going.  

## Data & Privacy  
- **Everything stays local**—no data is collected or sent elsewhere.  
- **Credentials are used once** for login and never saved.  

## Troubleshooting  
- **CAPTCHA Issues**: Solve it in the browser window that opens.  
- **No Jobs Found?** Adjust your filters or keywords.  
- **Login Problems**: Double-check your LinkedIn credentials.  
- **Data Not Saving**: Ensure your browser allows local storage.  

## Fair Use  
This tool is for **personal use only**. Be mindful of LinkedIn’s terms, and avoid excessive scraping that could trigger account restrictions.  

