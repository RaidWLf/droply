import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { filesTable } from "@/lib/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { name, userId: bodyUserId, parentId = null } = body;

		// Verify the user is creating a folder in their own account
		if (bodyUserId !== userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		if (!name || typeof name !== "string" || name.trim() === "") {
			return NextResponse.json(
				{ error: "Folder name is required" },
				{ status: 400 }
			);
		}

		// Check if parent folder exists if parentId is provided
		if (parentId) {
			const [parentFolder] = await db
				.select()
				.from(filesTable)
				.where(
					and(
						eq(filesTable.id, parentId),
						eq(filesTable.userId, userId),
						eq(filesTable.isFolder, true)
					)
				);

			if (!parentFolder) {
				return NextResponse.json(
					{ error: "Parent folder not found" },
					{ status: 404 }
				);
			}
		}

		// Create folder record in database
		const folderData = {
			id: uuidv4(),
			name: name.trim(),
			path: `/folders/${userId}/${uuidv4()}`,
			size: 0,
			mimeType: "folder",
			fileURL: "",
			thumbnailURL: null,
			userId,
			parentId,
			isFolder: true,
			isStarred: false,
			isTrash: false,
		};

		const [newFolder] = await db
			.insert(filesTable)
			.values(folderData)
			.returning();

		return NextResponse.json({
			success: true,
			message: "Folder created successfully",
			folder: newFolder,
		});
	} catch (error) {
		console.error("Error creating folder:", error);
		return NextResponse.json(
			{ error: "Failed to create folder" },
			{ status: 500 }
		);
	}
}
