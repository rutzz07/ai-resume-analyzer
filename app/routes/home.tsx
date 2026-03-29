import type { Route } from "./+types/home";
import Navbar from "../components/Navbar";
import ResumeCard from "../components/ResumeCard";
import { usePuterStore } from "../lib/puter";
import { useNavigate, Link } from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resume Analyze" },
    { name: "description", content: "Smart feedback for your dream job" },
  ];
}

export default function Home() {
  const { auth, isLoading, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!isLoading && !auth?.isAuthenticated) {
      navigate("/auth?next=/", { replace: true });
    }
  }, [isLoading, auth?.isAuthenticated, navigate]);

  // Load resumes only after auth is confirmed
  useEffect(() => {
    if (isLoading || !auth?.isAuthenticated) return;

    const loadResumes = async () => {
      setLoadingResumes(true);
      try {
        const resumes = (await kv.list("resume:*", true)) as KVItem[];
        const parsedResumes = resumes?.map(
          (resume) => JSON.parse(resume.value) as Resume
        );
        setResumes(parsedResumes || []);
      } catch (err) {
        console.error("Failed to load resumes:", err);
        setResumes([]);
      } finally {
        setLoadingResumes(false);
      }
    };

    loadResumes();
  }, [isLoading, auth?.isAuthenticated]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Application & Resume Ratings</h1>
          {!loadingResumes && resumes?.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback</h2>
          ) : (
            <h2>Review your Submission and check AI-Powered Feedback</h2>
          )}

          {loadingResumes && (
            <div className="flex flex-col items-center justify-center">
              <img
                src="/images/resume-scan-2.gif"
                className="w-[200px]"
                alt="Loading..."
              />
            </div>
          )}
        </div>

        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {!loadingResumes && resumes.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link
              to="/upload"
              className="primary-button w-fit text-xl font-semibold"
            >
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}