import { Storage } from "@google-cloud/storage";
import path from "path";
import { NextResponse } from "next/server";
const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS ?? "");
// Konfigurasi GCS
const storage = new Storage({
  keyFilename: path.join(process.cwd(), credentials),
});

const bucketName = "saas-jruhub";
const bucket = storage.bucket(bucketName);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    const fileName = `uploads/${Date.now()}-${file.name}`;
    const gcsFile = bucket.file(fileName);

    await gcsFile.save(buffer, {
      metadata: { contentType: file.type },
      public: true,
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    console.log("Upload success:", publicUrl);
    return NextResponse.json({ message: "Upload success", url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
