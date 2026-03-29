import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => [
  { title: "Resumind | Review" },
  { name: "description", content: "Detailed overview of your Resume" },
];

const Resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();
  const navigate = useNavigate();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isLoading && auth && !auth?.isAuthenticated) {
      navigate(`/auth?next=/resume/${id}`, { replace: true });
    }
  }, [isLoading, auth, id, navigate]);

  // Load resume data only after auth confirmed
  useEffect(() => {
    if (isLoading || !auth?.isAuthenticated || !id) return;

    const loadResume = async () => {
      try {
        const resume = await kv.get(`resume:${id}`);
        if (!resume) return;

        const data = JSON.parse(resume);

        // Load PDF
        const resumeBlob = await fs.read(data.resumePath);
        if (resumeBlob) {
          const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
          setResumeUrl(URL.createObjectURL(pdfBlob));
        }

        // Load image
        const imageBlob = await fs.read(data.imagePath);
        if (imageBlob) {
          setImageUrl(URL.createObjectURL(imageBlob));
        }

        setFeedback(data.feedback);
      } catch (err) {
        console.error("Failed to load resume:", err);
      }
    };

    loadResume();
  }, [isLoading, auth?.isAuthenticated, id]);

  // Cleanup blob URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (resumeUrl) URL.revokeObjectURL(resumeUrl);
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [resumeUrl, imageUrl]);

  return (
    <main className="!pt-0">
      <nav className="resume-nav">
        {/* ✅ Link to="/" goes cleanly to home because upload used replace:true */}
        <Link to="/" className="back-button">
          <img src="/icons/back.svg" alt="back" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
        </Link>
      </nav>

      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        {/* Left — Resume preview */}
        <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
          {imageUrl && resumeUrl ? (
            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] w-fit">
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={imageUrl}
                  className="w-full h-full object-contain rounded-2xl"
                  title="resume"
                  alt="Resume preview"
                />
              </a>
            </div>
          ) : (
            <img
              src="/images/resume-scan-2.gif"
              className="w-[200px]"
              alt="Loading resume..."
            />
          )}
        </section>

        {/* Right — Feedback */}
        <section className="feedback-section">
          <h2 className="text-4xl !text-black font-bold">Resume Review</h2>

          {feedback ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
              <Summary feedback={feedback} />
              <ATS
                score={feedback?.ATS?.score || 0}
                suggestions={feedback?.ATS?.tips || []}
              />
              <Details feedback={feedback as Feedback} />
            </div>
          ) : (
            <img
              src="/images/resume-scan-2.gif"
              className="w-full"
              alt="Loading feedback..."
            />
          )}
        </section>
      </div>
    </main>
  );
};

export default Resume;