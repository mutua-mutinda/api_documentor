import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Verify webhook secret
  const secret = request.headers.get("x-webhook-secret");

  if (secret !== process.env.STRAPI_WEBHOOK_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { event, model, entry } = body;

    // Revalidate based on the model and event
    if (model === "article") {
      // Revalidate all articles
      revalidateTag("articles");

      // Revalidate specific article if slug exists
      if (entry?.slug) {
        revalidateTag(`article-${entry.slug}`);
        revalidatePath(`/articles/${entry.slug}`);
      }

      // Revalidate articles list page
      revalidatePath("/articles");
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      model,
      event,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error revalidating", error: String(error) },
      { status: 500 },
    );
  }
}
