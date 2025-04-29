import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { filesTable } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import ImageKit from "imagekit";
import { v4 as uuidv4 } from "uuid";

// Initialize ImageKit with your credentials
const imagekit = new ImageKit({
	publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
	privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
	urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const formData = await request.formData();
		const file = formData.get("file") as File;
		const formUserId = formData.get("userId") as string;
		const parentId = (formData.get("parentId") as string) || null;

		// Verify the user is uploading to their own account
		if (formUserId !== userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		if (!file) {
			return NextResponse.json(
				{ error: "No file provided" },
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

		// Don't allow executables or bash file
		if (
			file.type === "application/x-executable" ||
			file.type === "application/x-sh" ||
			file.type === "application/x-bsh" ||
			file.type === "application/x-csh" ||
			file.type === "application/x-tcsh"
		) {
			return NextResponse.json(
				{ error: "We don't support executables" },
				{ status: 400 }
			);
		}

		const buffer = await file.arrayBuffer();
		const fileBuffer = Buffer.from(buffer);

		const originalFilename = file.name;
		const fileExtension = originalFilename.split(".").pop() || "";
		const uniqueFilename = `${uuidv4()}.${fileExtension}`;

		// Create folder path based on parent folder if exists
		const folderPath = parentId
			? `/droply/${userId}/folders/${parentId}`
			: `/droply/${userId}`;

		const uploadResponse = await imagekit.upload({
			file: fileBuffer,
			fileName: uniqueFilename,
			folder: folderPath,
			useUniqueFileName: false,
		});

		const fileData = {
			name: originalFilename,
			path: uploadResponse.filePath,
			size: file.size,
			mimeType: file.type,
			fileURL: uploadResponse.url,
			thumbnailURL: uploadResponse.thumbnailUrl || null,
			userId: userId,
			parentId: parentId,
			isFolder: false,
			isStarred: false,
			isTrash: false,
		};

		const [newFile] = await db
			.insert(filesTable)
			.values(fileData)
			.returning();

		return NextResponse.json(newFile);
	} catch (error) {
		console.error("Error uploading file:", error);
		return NextResponse.json(
			{ error: "Failed to upload file" },
			{ status: 500 }
		);
	}
}
