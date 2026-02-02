import { NextRequest, NextResponse } from "next/server";
import { getFeedbacks } from "@/lib/queries/article";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const articleIdParam = searchParams.get("articleId");

    if (!articleIdParam) {
      return NextResponse.json(
        { error: "articleId is required" },
        { status: 400 }
      );
    }

    const articleId = Number(articleIdParam);

    if (Number.isNaN(articleId)) {
      return NextResponse.json(
        { error: "Invalid articleId" },
        { status: 400 }
      );
    }

    const feedbacks = await getFeedbacks(articleId);

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("GET /api/feedbacks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
