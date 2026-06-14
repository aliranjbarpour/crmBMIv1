import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

function invalidScriptResponse(text: string, status: number) {
  const isEmptyScript =
    text.includes("did not return anything") ||
    text.includes("The script completed but did not return anything");

  return NextResponse.json(
    {
      success: false,
      message: isEmptyScript
        ? "این action در Google Script پیاده‌سازی نشده. کد google-apps-script/Code.gs را deploy کنید."
        : status === 404
          ? "آدرس Google Script پیدا نشد (404). اسکریپت را دوباره Deploy کنید."
          : "پاسخ نامعتبر از Google Script دریافت شد.",
    },
    { status: 502 }
  );
}

async function googleScriptResponse(response: Response) {
  const text = await response.text();

  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return invalidScriptResponse(text, response.status);
  }
}

async function proxyGetToGoogleScript(query: string) {
  if (!GOOGLE_SCRIPT_URL) {
    return NextResponse.json(
      {
        success: false,
        message: "آدرس Google Script در .env.local تنظیم نشده است.",
      },
      { status: 500 }
    );
  }

  const response = await fetch(`${GOOGLE_SCRIPT_URL}?${query}`, {
    method: "GET",
    redirect: "follow",
    cache: "no-store",
  });

  return googleScriptResponse(response);
}

async function proxyPostToGoogleScript(body: Record<string, unknown>) {
  if (!GOOGLE_SCRIPT_URL) {
    return NextResponse.json(
      {
        success: false,
        message: "آدرس Google Script در .env.local تنظیم نشده است.",
      },
      { status: 500 }
    );
  }

  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    redirect: "follow",
    cache: "no-store",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body),
  });

  return googleScriptResponse(response);
}

export async function GET(request: NextRequest) {
  return proxyGetToGoogleScript(request.nextUrl.searchParams.toString());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPostToGoogleScript(body);
}
