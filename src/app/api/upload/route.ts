import { Storage } from "@google-cloud/storage";
import path from "path";
import { NextResponse } from "next/server";
// Konfigurasi GCS
const serviceAccount = {
  type: "service_account",
  project_id: "saas-jruhub-gdrive",
  private_key_id: "da3dcb328d3deeb4e3aa34cff33b50ddf931dbfa",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDMvErrpCjSzegC\n83A7fCCIfHRCmx9OWPit9CZLle77h+Yf9fx8QCedyQYIZitVJjSroUQWg9XsAgwm\nad4GpF2kiqidic4irsFzMP+QupUcQtIuVKL6nOdBxhwF3ImboRwuHPu1+NdaKrNd\nL04BMMfbQAVgoZK499/MS8gjj4o9Mg3ngIh89DVOVZ2NXEXdqgd7JZKO02iWQFj1\nY7p8UgPmrDNlYfRHAheIVYLnUmo1coRB3PkpwQuqM7jrZ4vKxkN7Ue2HrVkj50U7\nFGR01UQnUxgDUCATRrTLY9vpfQjuI2md/1UawGGWRlecIdphQYlfUx9ChjRjg5/6\nGeSJZVsJAgMBAAECggEACOArcR2pamgkSodCT193q2Sv1DJhSbZINtLEKHGcNG0L\nqckler9IqGNUxSwlIHiHsh5+sxyTu24XfkChMDfTpz44OWosh+riqcTorQRo642t\ncUMLwYi06ta0+mXfuyHUwas4GCDs6+fSS+dXPtLeGzAIyHIz7oJkDwYeOIWj+Dg3\nJmFs22nlvcN5kWuSyhyCPv9+lOv5gUy0R44qLxmRIB3xmCdlFm8GqTLubf21yQam\nbI8eOw6jL6MU/O961eUKMFPrrvpCkzbn54rMIJU6lglF4WC+G8C3GSP4/PyDFaCA\n1iRtbG+0bxW6schF1i7pjIDQevm6a7Ez+H7O7dMeLQKBgQD08pPGioiMcIzyHP/p\ntpwNElFEeZyKKGDN1Bl3aOB81EZrPN2S1Y0oxI3e1uyWXLp+EMH+HZrR8HzxnDZp\nKjYvi6Gjr3FXwPg1625x5xlaGNGbTdHS5vQldGSg22K/l+8yDfEHtB+sthzgLt09\nrahAgUogGAbRNS9KZ4mA2OlTfQKBgQDV+Th1u7H8UxNlFyK96sr/mCl4DngtuAYV\nPuKoDyCck6Q8l2Hqnrguu2s6Li7EUqUWuHu/yJZiLPOJxWAubby2alZ8JB3J5wmc\noq8JiVq7AwaULAvNdapSTFFYPluo6VKuG+IQbjdsGpEB3ds6lhy52i++O7PHaUYI\nlmZcz7ujfQKBgGqL1cHH4quMDZMHED4+A1UgQZ9ScsgZ1jnR553sTbGeuF7PI+ZJ\n49P242sp+9FP1oMdkPSTNhPZ0s9ZzsUh6l32E8JafyfXtV/m36zGBF4Pa6VtTTa6\n5Tohjd/2bda/JPmV3OEn9ZsvwBG38N5yWjxswKyDJvv7cW2g6cvVDnEVAoGANBkz\nUw85XfuITGPetKk3dhZBepbjUhZtfLzMCSltwlH8ejhNwgeVRuOhTxAxmOGairau\ngtq/KvZQ8emZ6pQTj8LCfgV5L1DOuVGvFr5X1hL9hhRXZ1ZP+yvT3o2IWc89r2Dg\noSmE2xB44CB5oYEtS19Boqr8sgAC6lJcaBq4UC0CgYEAwjQ5YsjRBEVfDxd8q+uc\nNGUF+qxSfKK+PzJGqRVzF20iYhROKlDm1ewZm8TB45Duq99FMpiCRS4gTo52ZEBQ\nYfCBqEwg/D2nwLSlnl+uqAoyLB5cEOIRqUE6+ibtBC3VuQe+/uJ/eghYlNdCu1W8\nN4hD7ziLebOKHXax3FfUUnU=\n-----END PRIVATE KEY-----\n",
  client_email: "gcs-uploader@saas-jruhub-gdrive.iam.gserviceaccount.com",
  client_id: "111913019412903709671",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/gcs-uploader%40saas-jruhub-gdrive.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

const storage = new Storage({
  credentials: serviceAccount,
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
