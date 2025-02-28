"use server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import PptxGenJS from "pptxgenjs";
const GOOGLE_API_KEY = "AIzaSyBZx12vyE9aHZsdj0ea-zPlihhinW40LII";
const model = new ChatGoogleGenerativeAI({
  temperature: 1,
  model: "gemini-2.0-pro-exp-02-05",
  apiKey: GOOGLE_API_KEY,
});

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

function createPPT(slidesData: PresentationData) {
  let pptx = new PptxGenJS();

  // Set title slide
  let slideTitle = pptx.addSlide();
  slideTitle.addText(slidesData.title, {
    x: 1,
    y: 1,
    fontSize: 32,
    bold: true,
  });

  // Iterate over slides
  slidesData.slides.forEach((slide: Slide) => {
    let slidePPT = pptx.addSlide();

    // Add heading
    slidePPT.addText(slide.heading, {
      x: 0.5,
      y: 0.5,
      fontSize: 20,
      bold: true,
    });

    // Add bullet points
    let bulletText = slide.bullet_points
      .map((point: string) => `• ${point}`)
      .join("\n");
    slidePPT.addText(bulletText, {
      x: 0.5,
      y: 1.5,
      fontSize: 18,
      color: "363636",
    });

    // Add key message
    slidePPT.addText(`Key Message: ${slide.key_message}`, {
      x: 0.5,
      y: 3.5,
      fontSize: 16,
      italic: true,
      color: "008000",
    });

    // Add content (expanded explanation)
    slidePPT.addText(slide.content, {
      x: 0.5,
      y: 4.5,
      fontSize: 14,
      color: "404040",
      w: 9,
    });

    // Optional: Add image placeholder (requires real images)
    slidePPT.addText(`Images: ${slide.image_keywords.join(", ")}`, {
      x: 0.5,
      y: 6.5,
      fontSize: 12,
      color: "808080",
    });
  });

  // Save the PowerPoint file
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .split("Z")[0];
  const fileName = `presentations/presentation_${timestamp}.pptx`;
  const splitting = fileName.split("/");
  const prefix = splitting[1];

  pptx
    .writeFile({ fileName })
    .then(() => {
      console.log(`PowerPoint berhasil disimpan di ${fileName}`);
    })
    .catch((err) => {
      console.error("Gagal menyimpan PowerPoint:", err);
    });

  return prefix;
}

// Step 1: Define the expected JSON output structure
const parser = StructuredOutputParser.fromNamesAndDescriptions({
  title: "The title of the presentation",
  slides:
    "An array of slides, each containing heading, bullet points, key message, content, and image keywords. Do not use backticks (`) or smart quotes (“ ”) in the values.",
});

// Step 2: Define a structured prompt with format instructions
const prompt = new PromptTemplate({
  template: `You are an AI assistant that generates structured JSON for PowerPoint slides.
    Generate **at least 7 slides** for a presentation on "{topic}".
  
    Ensure:
    - The output must be in valid JSON format, without any additional characters (e.g., backticks or quotes around the entire JSON).
    - Each slide includes:
      - A heading
      - Bullet points
      - A key message
      - A detailed content section
      - Image keywords
    - The 'content' field should be a paragraph that expands on the key message.
    
    {format_instructions}`,
  inputVariables: ["topic"],
  partialVariables: { format_instructions: parser.getFormatInstructions() },
});

// Step 3: Generate structured slide content
async function generateSlides(topic: string) {
  try {
    const formattedPrompt = await prompt.format({ topic });
    const response = await model.invoke(formattedPrompt);

    if (!response || !response.content) {
      throw new Error("Empty response from model.");
    }

    let rawContent = response.content.toString().trim();

    // Menghapus triple backticks secara lebih aman
    rawContent = rawContent.replace(/^```json\s*|\s*```$/g, "");

    let parsedOutput: PresentationData;

    try {
      parsedOutput = JSON.parse(rawContent);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return {
        parsedOutput: null,
        filename: null,
        message: "Invalid JSON format, please refine your topic.",
      };
    }

    // Pastikan parsedOutput memiliki slides yang dalam format string, lalu parse lagi
    if (parsedOutput?.slides && typeof parsedOutput.slides === "string") {
      try {
        parsedOutput.slides = JSON.parse(parsedOutput.slides);
      } catch (error) {
        console.error("Error parsing slides JSON:", error);
        return {
          parsedOutput: null,
          filename: null,
          message: "Slides format is incorrect.",
        };
      }
    }

    // Pastikan parsedOutput benar-benar valid sebelum membuat file PPT
    if (
      !parsedOutput ||
      !parsedOutput.slides ||
      !Array.isArray(parsedOutput.slides)
    ) {
      return {
        parsedOutput: null,
        filename: null,
        message: "Invalid slides data structure.",
      };
    }

    const filename = createPPT(parsedOutput);
    return { parsedOutput, filename };
  } catch (error) {
    console.error("Error generating slides:", error);
    return {
      parsedOutput: null,
      filename: null,
      message: "An error occurred while generating slides. Please try again.",
    };
  }
}

// Step 4: Execute and display output
export async function main(prompt: string) {
  const slidesData = await generateSlides(prompt);
  return slidesData;
}
