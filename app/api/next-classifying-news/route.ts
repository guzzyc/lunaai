import { getNextCenterNews, getNextClassifyingNews } from "@/lib/queries/article";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const news = await getNextClassifyingNews();
    if (!news) return new NextResponse("No more news", { status: 404 });

    return NextResponse.json(news);
  } catch (err) {
    // return new NextResponse("Unauthorized", { status: 401 });
    return new NextResponse("Not found", { status: 404 });
  }
}
