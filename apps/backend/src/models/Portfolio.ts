import mongoose from "mongoose";

const PortfolioSchema = new mongoose.Schema(
  {
    personalInfo: {
      name: String,
      role: String,
      location: String,
      email: String,
      phone: String,
      summary: String,
      about: String,
      profileImage: String,
      socials: {
        github: String,
        linkedin: String,
      },
    },
    experiences: [
      {
        company: String,
        role: String,
        period: String,
        location: String,
        description: [String],
      },
    ],
    skills: {
      type: Map,
      of: [String],
    },
    projects: [
      {
        title: String,
        description: String,
        technologies: [String],
        link: String,
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        period: String,
      },
    ],
    resumeUrl: String,
  },
  { timestamps: true },
);

export default mongoose.models.Portfolio ||
  mongoose.model("Portfolio", PortfolioSchema);
