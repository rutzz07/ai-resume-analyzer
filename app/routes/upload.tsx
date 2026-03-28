import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import FileUploader from '~/components/FileUploader';
import { usePuterStore } from '~/lib/puter';
import { useNavigate } from 'react-router';
import { convertPdfToImage } from '~/lib/pdf2img';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions } from 'constants/index';

const Upload = () => {
  const { fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    try {
      setIsProcessing(true);

      // 1️⃣ Upload PDF
      setStatusText("Uploading the file...");
      const uploadedFile = await fs.upload([file]);

      if (!uploadedFile) {
        setStatusText('Error: Failed to upload file');
        setIsProcessing(false);
        return;
      }

      // 2️⃣ Convert PDF
      setStatusText("Converting to image...");
      const imageFile = await convertPdfToImage(file);

      console.log("PDF RESULT:", imageFile);

      if (!imageFile.file) {
        setStatusText(imageFile.error || 'Error: Failed to convert PDF to image');
        setIsProcessing(false);
        return;
      }

      // 3️⃣ Upload Image
      setStatusText("Uploading the image...");
      const uploadedImage = await fs.upload([imageFile.file]);

      if (!uploadedImage) {
        setStatusText('Error: Failed to upload image');
        setIsProcessing(false);
        return;
      }

      // 4️⃣ Save initial data
      setStatusText("Preparing data...");
      const uuid = generateUUID();

      const data: any = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: {},
      };

      console.log("Saving to KV...");

      await Promise.race([
        kv.set(`resume:${uuid}`, JSON.stringify(data)),
        new Promise((_, reject) =>
          setTimeout(() => reject("KV Timeout"), 10000)
        )
      ]);

      console.log("KV SAVED");

      // 5️⃣ AI Analyze
      setStatusText("Analyzing...");

      console.log("AI START");

      const feedback: any = await Promise.race([
        ai.feedback(
          uploadedFile.path,
          prepareInstructions({ jobTitle, jobDescription })
        ),
        // new Promise((_, reject) =>
        //   setTimeout(() => reject("AI Timeout"), 15000)
        // )
      ]);

      console.log("AI DONE", feedback);

      if (!feedback || (feedback as any).success === false) {
        const errorMsg = (feedback as any)?.error || 'Failed to analyze resume';
        setStatusText(`Error: ${errorMsg}`);
        setIsProcessing(false);
        return;
      }

      // 6️⃣ Parse safely
      try {
        const content = (feedback as any)?.message?.content;
        const feedbackText =
          typeof content === 'string'
            ? content
            : content?.[0]?.text;

        data.feedback = JSON.parse(feedbackText);
      } catch (err) {
        setStatusText("Error parsing AI response");
        setIsProcessing(false);
        return;
      }

      await kv.set(`resume:${uuid}`, JSON.stringify(data));

      setStatusText("Analysis complete! Redirecting...");
      setIsProcessing(false);

      setTimeout(() => {
        navigate(`/resume/${uuid}`);
      }, 1000);

    } catch (err) {
      console.error(err);
      setStatusText(`Error: ${err}`);
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const companyName = formData.get('company-name') as string;
    const jobTitle = formData.get('job-title') as string;
    const jobDescription = formData.get('job-description') as string;

    if (!file) return;

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className='page-heading py-16'>
          <h1>Smart feedback for your dream job</h1>

          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan-2.gif" className='w-full' alt="processing" />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}

          {!isProcessing && (
            <form onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>

              <div className='form-div'>
                <label>Company Name</label>
                <input type="text" name="company-name" required />
              </div>

              <div className='form-div'>
                <label>Job Title</label>
                <input type="text" name="job-title" required />
              </div>

              <div className='form-div'>
                <label>Job Description</label>
                <textarea rows={5} name="job-description" />
              </div>

              <div className='form-div'>
                <label>Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>

              <button className='primary-button' type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;