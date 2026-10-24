/*
  NEXORA — site content
  ---------------------
  Everything people will want to edit lives here, so nobody has to dig
  through the animation code. Leave a field as "" and the site shows a
  placeholder for it.

  photo:     path to an image, e.g. "assets/team/president.jpg"
  portfolio: full URL to a portfolio, resume PDF, GitHub, etc.
*/

window.NEXORA = {
  socials: {
    instagram: "",
    linkedin: "",
    discord: "",
  },

  // Where the "Join our community" form gets sent.
  // Works with Formspree / Getform / any endpoint that accepts a JSON POST.
  // Left empty, the form still works on the page but nothing is sent anywhere.
  formEndpoint: "",

  union: [
    { role: "President",         name: "", course: "", year: "", line: "", photo: "" },
    { role: "Vice President",    name: "", course: "", year: "", line: "", photo: "" },
    { role: "General Secretary", name: "", course: "", year: "", line: "", photo: "" },
    { role: "Treasurer",         name: "", course: "", year: "", line: "", photo: "" },
  ],

  departments: [
    {
      id: "frontend", name: "Frontend", side: "Technical", icon: "frontend",
      heads: [
        { name: "", course: "", year: "", portfolio: "", photo: "" },
        { name: "", course: "", year: "", portfolio: "", photo: "" },
      ],
    },
    {
      id: "backend", name: "Backend", side: "Technical", icon: "backend",
      heads: [
        { name: "", course: "", year: "", portfolio: "", photo: "" },
        { name: "", course: "", year: "", portfolio: "", photo: "" },
      ],
    },
    {
      id: "data-science", name: "Data Science", side: "Technical", icon: "data",
      heads: [
        { name: "", course: "", year: "", portfolio: "", photo: "" },
      ],
    },
    {
      id: "events", name: "Events Management", side: "Non-Technical", icon: "events",
      heads: [
        { name: "", course: "", year: "", portfolio: "", photo: "" },
        { name: "", course: "", year: "", portfolio: "", photo: "" },
      ],
    },
    {
      id: "design", name: "Design & Creative", side: "Non-Technical", icon: "design",
      heads: [
        { name: "", course: "", year: "", portfolio: "", photo: "" },
        { name: "", course: "", year: "", portfolio: "", photo: "" },
      ],
    },
    {
      id: "pr", name: "PR & Outreach", side: "Non-Technical", icon: "pr",
      heads: [
        { name: "", course: "", year: "", portfolio: "", photo: "" },
      ],
    },
  ],
};
