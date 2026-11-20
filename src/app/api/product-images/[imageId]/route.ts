import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

type ProductImageRouteProps = {
  params: Promise<{
    imageId: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: ProductImageRouteProps,
) {
  const { imageId } = await params;

  // Temukan metadata gambar produk di database
  const image = await prisma.productImage.findUnique({
    where: {
      id: imageId,
    },
    select: {
      storageKey: true,
    },
  });

  if (!image) {
    return NextResponse.json(
      { error: "Image tidak ditemukan." },
      { status: 404 },
    );
  }

  const blob = await get(image.storageKey, {
    access: "private",
    ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
  });

  if (!blob) {
    return NextResponse.json(
      { error: "File image tidak ditemukan." },
      { status: 404 },
    );
  }

  if (blob.statusCode === 304) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: blob.blob.etag,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  return new NextResponse(blob.stream, {
    status: 200,
    headers: {
      "Content-Type": blob.blob.contentType,
      ETag: blob.blob.etag,
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}