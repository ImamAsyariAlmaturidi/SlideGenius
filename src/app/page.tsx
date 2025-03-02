"use client";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { Heart, Send, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { main } from "./action/ai";
import { useState, useEffect } from "react";
import { Loader } from "@/components/ui/loader";
import { LoadingDots } from "@/components/loading-dots";
import { JsonViewer } from "@/components/json-viewer";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
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
  const [urlLink, setUrlLink] = useState<string>("");
  const [messages, setMessages] = useState<
    Array<{ type: "user" | "bot"; content: string }>
  >([
    {
      type: "bot",
      content: "Hello! What topic do you have on your mind today?",
    },
  ]);
  const handleDownload = () => {
    const url = urlLink;
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "presentation.pptx"); // Nama file saat didownload
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
          "For the best results, input at least three words with a subject, verb, and object. Example: 'A history about cats'",
        position: "top-center",
        style: {
          backgroundColor: "#ffb7c5",
          color: "#800020",
          border: "1px solid #ff69b4",
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

    // Add user message to chat
    setMessages((prev) => [...prev, { type: "user", content: promptValue }]);

    // Add initial bot response
    setMessages((prev) => [
      ...prev,
      { type: "bot", content: "Generating your presentation..." },
    ]);

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
            backgroundColor: "#ffb7c5",
            color: "#800020",
            border: "1px solid #ff69b4",
            fontWeight: "bold",
            textAlign: "center",
          },
        });
      }
      setResultJson(result.parsedOutput);
      setMessages((prev) => [
        ...prev.filter(
          (msg) => msg.content !== "Generating your presentation..."
        ),
        {
          type: "bot",
          content: `I've created a presentation on "${promptValue}" with ${result.parsedOutput?.slides.length} slides. You can view the details below and download it.`,
        },
      ]);

      setUrlLink(result.filename);
    } catch (error) {
      console.error("Error generating slides:", error);
    } finally {
      setLoading(false);
      setLoadingStage(null);
      setProgress(100);
    }
  }

  return (
    <div className="h-screen bg-pink-50 text-pink-900 flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-3xl flex flex-col flex-grow">
        {/* Header */}
        <Header />

        {/* Feedback Section */}
        <FeedbackSection />

        {/* Chat Interface */}
        <div className="flex flex-col space-y-4 mb-6 overflow-y-auto max-h-[50vh]">
          {messages.map((msg, index) => (
            <ChatBubble key={index} message={msg.content} type={msg.type} />
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mb-6 bg-pink-100 border border-pink-300 rounded-lg p-6 text-center shadow-md">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader className="border-pink-500" size="lg" />
              <p className="text-pink-700">{loadingStage}</p>
              <Progress
                value={progress}
                className="w-full max-w-md bg-pink-200"
              />
            </div>
          </div>
        )}

        {/* JSON Result */}
        {resultJson && !loading && (
          <div className="flex flex-col min-h-0">
            <div className="mb-6 max-h-[400px] overflow-auto border border-pink-300 rounded-lg bg-white shadow-md">
              <JsonViewer data={resultJson} />
            </div>
          </div>
        )}

        {/* Input Field (Dibuat agar berada di bawah) */}
        <div className="mt-auto w-full">
          <div>
            {urlLink && (
              <Button
                variant={"secondary"}
                onClick={() => handleDownload()}
                className="my-5 w-full bg-pink-500 hover:bg-pink-600 text-white"
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
              className="w-full bg-white border-pink-400 border rounded-md py-6 px-4 focus-visible:ring-pink-500 shadow-sm"
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
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-pink-500 hover:bg-pink-600 ${
                loading || !inputPrompt.trim()
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {loading ? (
                <LoadingDots color="bg-white" />
              ) : (
                <Send className="h-5 w-5 text-white" />
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
      <span className="text-pink-600">SlideGenius by Imam A'syari</span>{" "}
    </h1>
    <p className="text-xl md:text-2xl mt-4 text-pink-700">
      Converse, create, and improve your next PowerPoint by SlideGenius
    </p>
  </div>
);

const FeedbackSection = () => (
  <div className="p-2 mb-4 rounded-md bg-pink-100 border border-pink-300 shadow-sm">
    <p className="text-center text-pink-800">
      If you like SlideGenius, please consider leaving a heart{" "}
      <Heart className="inline h-5 w-5 text-red-500 fill-red-500" /> on the
      <Link href="#" className="text-pink-600 hover:underline">
        {" "}
        Hugging Face Space{" "}
      </Link>
      or a star{" "}
      <Star className="inline h-5 w-5 text-yellow-400 fill-yellow-400" /> on
      <Link
        href="https://github.com/ImamAsyariAlmaturidi"
        className="text-pink-600 hover:underline"
      >
        {" "}
        GitHub{" "}
      </Link>
      or checking out my
      <Link
        href="https://www.linkedin.com/in/imam-a-syari-almaturidi-21b885323/"
        className="text-pink-600 hover:underline"
      >
        {" "}
        LinkedIn{" "}
      </Link>{" "}
      is appreciated.
    </p>
  </div>
);

const ChatBubble = ({
  message,
  type,
}: {
  message: string;
  type: "user" | "bot";
}) => (
  <div
    className={`flex items-start gap-3 ${
      type === "user" ? "flex-row-reverse" : ""
    }`}
  >
    <div
      className={`${
        type === "bot" ? "bg-pink-400" : "bg-pink-600"
      } p-2 rounded-full flex-shrink-0 shadow-sm`}
    >
      <Image
        src="/bot.png"
        width={30}
        height={30}
        alt={type === "bot" ? "Bot icon" : "User icon"}
        className="h-6 w-6"
      />
    </div>
    <div
      className={`p-4 rounded-2xl max-w-[80%] shadow-sm ${
        type === "bot"
          ? "bg-white border border-pink-200 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl"
          : "bg-pink-300 text-pink-900 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
      }`}
    >
      <p className="text-sm md:text-base">{message}</p>
    </div>
  </div>
);
