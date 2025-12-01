import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Fetch the URL
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ResourceBot/1.0)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch URL" },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Extract meta tags
    const getMetaTag = (name: string): string | null => {
      // Try property first (for og: tags)
      const propertyRegex = new RegExp(
        `<meta[^>]*property=["']${name}["'][^>]*content=["']([^"']*)["']`,
        "i"
      );
      const propertyMatch = html.match(propertyRegex);
      if (propertyMatch) return propertyMatch[1];

      // Try name attribute
      const nameRegex = new RegExp(
        `<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`,
        "i"
      );
      const nameMatch = html.match(nameRegex);
      if (nameMatch) return nameMatch[1];

      // Try reverse order (content before name/property)
      const reverseRegex = new RegExp(
        `<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`,
        "i"
      );
      const reverseMatch = html.match(reverseRegex);
      if (reverseMatch) return reverseMatch[1];

      return null;
    };

    // Get title
    let title =
      getMetaTag("og:title") ||
      getMetaTag("twitter:title") ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
      "";

    // Get description
    let description =
      getMetaTag("og:description") ||
      getMetaTag("twitter:description") ||
      getMetaTag("description") ||
      "";

    // Get thumbnail/image
    let thumbnail =
      getMetaTag("og:image") ||
      getMetaTag("twitter:image") ||
      getMetaTag("image") ||
      "";

    // Make thumbnail URL absolute if it's relative
    if (thumbnail && !thumbnail.startsWith("http")) {
      const urlObj = new URL(url);
      if (thumbnail.startsWith("//")) {
        thumbnail = urlObj.protocol + thumbnail;
      } else if (thumbnail.startsWith("/")) {
        thumbnail = urlObj.origin + thumbnail;
      } else {
        thumbnail = urlObj.origin + "/" + thumbnail;
      }
    }

    // Clean up HTML entities
    title = title.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
    description = description.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();

    return NextResponse.json({
      title: title || null,
      description: description || null,
      thumbnail: thumbnail || null,
    });
  } catch (error) {
    console.error("Error scraping URL:", error);
    return NextResponse.json(
      { error: "Failed to scrape URL metadata" },
      { status: 500 }
    );
  }
}
