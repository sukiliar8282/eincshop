import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

type DownloadRouteProps = {
  params: Promise<{
    grantId: string;
  }>;
};

export async function GET(request: Request, { params }: DownloadRouteProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const { grantId } = await params;

  const grant = await prisma.downloadGrant.findFirst({
    where: {
      id: grantId,
      userId: session.user.id,
      status: "ACTIVE",
      order: {
        paymentStatus: "PAID",
      },
      digitalAsset: {
        status: "ACTIVE",
      },
    },
    include: {
      digitalAsset: true,
      order: {
        select: {
          paymentStatus: true,
        },
      },
    },
  });

  if (!grant) {
    return NextResponse.json(
      { error: "Download tidak tersedia." },
      { status: 404 },
    );
  }

  const blob = await get(grant.digitalAsset.storageKey, {
    access: "private",
    ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
  });

  if (!blob) {
    return NextResponse.json(
      { error: "File tidak ditemukan." },
      { status: 404 },
    );
  }

  if (blob.statusCode === 304) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: blob.blob.etag,
        "Cache-Control": "private, no-store",
      },
    });
  }

  await prisma.downloadGrant.update({
    where: {
      id: grant.id,
    },
    data: {
      downloadCount: {
        increment: 1,
      },
    },
  });

  return new NextResponse(blob.stream, {
    status: 200,
    headers: {
      "Content-Type": blob.blob.contentType,
      "Content-Disposition": `attachment; filename="${grant.digitalAsset.fileName}"`,
      ETag: blob.blob.etag,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
