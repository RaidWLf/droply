import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { filesTable } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return new Response("Unauthorized", { status: 401 });
		}

		// parsing request body
		const body = await request.json();
		const { imagekit, userId: bodyUserId } = body;

		if (bodyUserId !== userId) {
			return new Response("Unauthorized", { status: 401 });
		}

		if (!imagekit || !imagekit.url) {
			return NextResponse.json(
				{
					error: "invalid file upload data",
				},
				{ status: 401 }
			);
		}

		const fileData = {
			name: imagekit.name || "Untitled",
			path: imagekit.filePath || `/droply/${userId}/${imagekit.name}`,
			size: imagekit.size || 0,
			mimeType: imagekit.fileType || "image",
			fileURL: imagekit.url,
			thumbnailURL: imagekit.thumbnailUrl || null,
			userId: userId,
			parentId: null, // Root level by default
			isFolder: false,
			isStarred: false,
			isTrash: false,
		};

		const [newFile] = await db
			.insert(filesTable)
			.values(fileData)
			.returning();

		return NextResponse.json({
			newFile,
		});
	} catch (error) {
		return NextResponse.json(
			{
				error: "Failed to save info to db",
			},
			{ status: 500 }
		);
	}
}
