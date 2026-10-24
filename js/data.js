/*
  NEXORA — site content
  ---------------------
  Everything people will want to edit lives here, so nobody has to dig
  through the animation code. Leave a field as "" and the site shows a
  placeholder for it. Text is shown exactly as written here.

  photo:   path to an image, e.g. "assets/team/ansshita.jpg"
  link:    portfolio, LinkedIn, resume... LinkedIn URLs are labelled
           "LinkedIn", anything else is labelled "Portfolio".
  college: only for people from other colleges; shown at the end of the line.
*/

window.NEXORA = {
  socials: {
    instagram: "https://www.instagram.com/nexora.thecodingcommunity",
    linkedin: "https://www.linkedin.com/company/nexora-thecodingcommunity",
    discord: "https://discord.gg/SurJ2DFBS",
  },

  // URL of the Google Apps Script web app that saves applications to the
  // Google Sheet (see backend/SETUP.md). Left empty, the form still works on
  // the page but nothing is saved.
  formEndpoint: "",

  union: [
    {
      role: "President", name: "Ansshita Kumar",
      course: "bsc (H) physics", year: "2nd year",
      line: "Physics student and tech enthusiast who loves building websites, hackathon projects and anything that turns an idea into something real.",
      link: "https://gurltff.github.io/myportfolio/", photo: "assets/team/ansshita.jpg",
    },
    {
      role: "Vice President", name: "Anoushka Dey",
      course: "bsc prog physical science with chemistry", year: "2nd year",
      line: "curiosity always got the best of me in STEM :3",
      link: "https://www.linkedin.com/in/anoushka-dey-909aa3377", photo: "assets/team/anoushka.jpg",
    },
    {
      role: "General Secretary", name: "Rachiel Singh",
      course: "B.Sc.(H) physics", year: "2 year",
      line: "",
      link: "https://reyysingh.github.io/rey-portfolio/", photo: "assets/team/rachiel.jpg",
    },
    {
      role: "Treasurer", name: "Sakshi Sharma",
      course: "BSc(prog) Physical Science with Chemistry", year: "2nd year",
      line: "Science, Tech and research enthusiast",
      link: "https://www.linkedin.com/in/sakshi-sharma-7b8a34378", photo: "assets/team/sakshi.jpg",
    },
  ],

  departments: [
    {
      id: "frontend", name: "Frontend", side: "Technical", icon: "frontend",
      heads: [
        { name: "Ansshita Kumar", course: "bsc (H) physics", year: "2nd year", link: "https://gurltff.github.io/myportfolio/", photo: "assets/team/ansshita.jpg" },
        { name: "Anoushka Dey", course: "bsc prog physical science with chemistry", year: "2nd year", link: "https://www.linkedin.com/in/anoushka-dey-909aa3377", photo: "assets/team/anoushka.jpg" },
      ],
    },
    {
      id: "backend", name: "Backend", side: "Technical", icon: "backend",
      heads: [
        { name: "Sakshi Sharma", course: "BSc(prog) Physical Science with Chemistry", year: "2nd year", link: "https://www.linkedin.com/in/sakshi-sharma-7b8a34378", photo: "assets/team/sakshi.jpg" },
        { name: "Rachiel Singh", course: "B.Sc.(H) physics", year: "2 year", link: "https://reyysingh.github.io/rey-portfolio/", photo: "assets/team/rachiel.jpg" },
      ],
    },
    {
      id: "data-science", name: "Data Science", side: "Technical", icon: "data",
      heads: [
        { name: "Nishtha", course: "B.Sc.(H) physics", year: "2nd year", link: "", photo: "assets/team/nishtha.jpg" },
      ],
    },
    {
      id: "events", name: "Events Management", side: "Non-Technical", icon: "events",
      heads: [
        { name: "Nidhi Singh", course: "Bsc prog physical science with chemistry", year: "2nd year", link: "https://www.linkedin.com/in/nidhi-singh-9434b0387", photo: "assets/team/nidhi.jpg" },
        { name: "Raghav Singh", course: "BA Economics (H)", year: "2nd Year", college: "Maharaja Agrasen Institute of Management", link: "https://gurltff.github.io/myportfolio2/", photo: "assets/team/raghav.jpg" },
      ],
    },
    {
      id: "design", name: "Design & Creative", side: "Non-Technical", icon: "design",
      heads: [
        { name: "Shagun Tomar", course: "BSc Hons Physics", year: "Second year", link: "https://in.linkedin.com/in/shagun-tomar-b80340307", photo: "assets/team/shagun.jpg" },
        { name: "Lakshay", course: "BTECH CSE AIML", year: "3RD YEAR", college: "UPES Dehradun", link: "", photo: "assets/team/lakshay.jpg" },
      ],
    },
    {
      id: "pr", name: "PR & Outreach", side: "Non-Technical", icon: "pr",
      heads: [
        { name: "Arya Mishra", course: "Bcom (H)", year: "2nd year", link: "", photo: "assets/team/arya.jpg" },
      ],
    },
  ],
};
