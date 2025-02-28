"use client";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Heart, Send, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { main } from "./action/ai";
import { useState, useEffect } from "react";
import { Loader } from "@/components/ui/loader";
import { LoadingDots } from "@/components/loading-dots";
import { JsonViewer } from "@/components/json-viewer";

type Slide = {
  heading: string;
  bullet_points: string[];
  key_message: string;
  content: string;
  image_keywords: string[];
};

type PresentationData = {
  title: string;
  slides: Slide[];
};

export default function Home() {
  const [resultJson, setResultJson] = useState<PresentationData | null>(null);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [filename, setFilename] = useState<string | null>("");
  const handleDownload = (filename: string) => {
    const url = `/api/download/${filename}`;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (loading) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            clearInterval(timer);
            return 100;
          }
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 100);
        });
      }, 500);

      return () => {
        clearInterval(timer);
      };
    }
  }, [loading]);

  async function handlePrompt() {
    if (!inputPrompt.trim()) return;

    if (inputPrompt.trim().split(/\s+/).length < 3) {
      return toast.warning("Input must be atleast 3 words!", {
        description:
          "For the best results, input at least three words with a subject, verb, and object. Example: 'A history about Hitler🗿'",
        position: "top-center",
        style: {
          backgroundColor: "green",
          color: "#000",
          border: "1px solid black",
          fontWeight: "bold",
          textAlign: "center",
        },
      });
    }

    setLoading(true);
    setLoadingStage("Generating presentation...");
    setProgress(0);

    const promptValue = inputPrompt;
    setInputPrompt("");

    try {
      // Simulate different loading stages for better UX
      setTimeout(() => setLoadingStage("Analyzing topic..."), 1000);
      setTimeout(() => setLoadingStage("Creating slides..."), 3000);
      setTimeout(() => setLoadingStage("Finalizing content..."), 5000);

      const result = await main(promptValue);
      if (result.message) {
        return toast.error(result.message, {
          description: "Prompting failed, please try again",
          position: "top-center",
          style: {
            backgroundColor: "red",
            color: "#000",
            border: "1px solid black",
            fontWeight: "bold",
            textAlign: "center",
          },
        });
      }
      setResultJson(result.parsedOutput);
      setFilename(result.filename);
    } catch (error) {
      console.error("Error generating slides:", error);
    } finally {
      setLoading(false);
      setLoadingStage(null);
      setProgress(100);
    }
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-3xl flex flex-col flex-grow">
        {/* Header */}
        <Header />

        {/* Feedback Section */}
        <FeedbackSection />

        {/* Chat Interface */}
        <ChatMessage message="Hello! What topic do you have on your mind today?" />

        {/* Loading State */}
        {loading && (
          <div className="mb-6 bg-zinc-900 border border-zinc-700 rounded-lg p-6 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader className="border-green-500" size="lg" />
              <p className="text-zinc-300">{loadingStage}</p>
              <Progress value={progress} className="w-full max-w-md" />
            </div>
          </div>
        )}

        {/* JSON Result */}

        {resultJson && !loading && (
          <div className="flex flex-col min-h-0">
            <div className="mb-6 max-h-[400px] overflow-auto  border-zinc-700 rounded-lg">
              <JsonViewer data={resultJson} />
            </div>
          </div>
        )}

        {/* Input Field (Dibuat agar berada di bawah) */}
        <div className="mt-auto w-full">
          <div>
            {filename && (
              <Button
                variant={"secondary"}
                onClick={() => handleDownload(filename)}
                className="my-5 w-full"
              >
                Download File
              </Button>
            )}
          </div>
          <div className="relative">
            <Input
              placeholder="Write the topic or instructions here"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              className="w-full bg-transparent border-green-800 border rounded-md py-6 px-4 focus-visible:ring-green-500"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handlePrompt();
                }
              }}
              disabled={loading}
            />
            <Button
              onClick={handlePrompt}
              size="icon"
              disabled={loading || !inputPrompt.trim()}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent ${
                loading || !inputPrompt.trim()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-zinc-800"
              }`}
            >
              {loading ? (
                <LoadingDots color="bg-green-500" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const Header = () => (
  <div className="mb-8 text-center">
    <h1 className="text-4xl md:text-5xl font-bold mb-2">
      <span className="text-green-500">SlideGenius by Imam A'syari</span>{" "}
    </h1>
    <p className="text-xl md:text-2xl mt-4">
      Converse, create, and improve your next PowerPoint by SlideGenius
    </p>
  </div>
);

const FeedbackSection = () => (
  <div className="p-2 mb-4 rounded-md bg-green-950 border border-green-900">
    <p className="text-center">
      If you like SlideGenius, please consider leaving a heart{" "}
      <Heart className="inline h-5 w-5 text-red-500 fill-red-500" /> on the
      <Link href="#" className="text-blue-400 hover:underline">
        {" "}
        Hugging Face Space{" "}
      </Link>
      or a star{" "}
      <Star className="inline h-5 w-5 text-yellow-400 fill-yellow-400" /> on
      <Link
        href="https://github.com/ImamAsyariAlmaturidi"
        className="text-blue-400 hover:underline"
      >
        {" "}
        GitHub{" "}
      </Link>
      or checking out my
      <Link
        href="https://www.linkedin.com/in/imam-a-syari-almaturidi-21b885323/"
        className="text-blue-400 hover:underline"
      >
        {" "}
        LinkedIn{" "}
      </Link>{" "}
      is appreciated.
    </p>
  </div>
);

const ChatMessage = ({ message }: { message: string }) => (
  <div className="flex items-start gap-3 mb-8">
    <div className="bg-green-500 p-2 rounded-md">
      <Image
        src="/placeholder.svg?height=24&width=24"
        width={24}
        height={24}
        alt="Bot icon"
        className="h-6 w-6"
      />
    </div>
    <div className="bg-zinc-900 p-4 rounded-md border border-zinc-700 flex-1">
      <p>{message}</p>
    </div>
  </div>
);
