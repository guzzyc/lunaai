import { searchNews } from "@/lib/queries/article";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      sourceId,
      fromDate,
      toDate,
      // industryId,
      // categoryId,
      // companyId,
      page,
      dateMode
    } = body ?? {};

    const result = await searchNews({
      sourceId: sourceId ? Number(sourceId) : undefined,
      fromDate: fromDate,
      toDate: toDate,
      // industryId: industryId ? Number(industryId) : undefined,
      // categoryId: categoryId ? Number(categoryId) : undefined,
      // companyId: companyId ? Number(companyId) : undefined,
      page: page ? Number(page) : 1,
      dateMode: dateMode,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("search news error:", error);

    return NextResponse.json(
      { error: "Failed to search news" },
      { status: 500 }
    );
  }
}
