import { relations } from "drizzle-orm";
import {
	boolean,
	timestamp,
	uuid,
	text,
	integer,
	pgTable,
} from "drizzle-orm/pg-core";

export const filesTable = pgTable("files", {
	id: uuid("id").primaryKey().defaultRandom(),
	// file and folder information
	name: text("name").notNull(),
	path: text("path").notNull(),
	size: integer("size").notNull(),
	mimeType: text("mimeType").notNull(),

	// storage information
	fileURL: text("fileURL").notNull(),
	thumbnailURL: text("thumbnailURL"),

	// Ownership information
	userId: text("userId").notNull(),
	parentId: uuid("parentId"), // Parent folder ID (null for root folder and files)

	// file and folder flags
	isFolder: boolean("isFolder").notNull().default(false),
	isStarred: boolean("isStarred").notNull().default(false),
	isTrash: boolean("isTrash").notNull().default(false),

	// timestamps
	createdAt: timestamp("createdAt").defaultNow().notNull(),
	updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

/*
parent: Each file/folder can have a parent folder, which is represented by the parentId column. This allows for a hierarchical structure where folders can contain other folders and files.

children: Each folder can have multiple child files/folders, which are represented by the parentId column in the child files/folders. This allows for a tree-like structure where folders can contain other folders and files.

*/

export const filesRelations = relations(filesTable, ({ one, many }) => ({
	parent: one(filesTable, {
		fields: [filesTable.parentId],
		references: [filesTable.id],
	}),

	// relation to child files/folders
	children: many(filesTable),
}));

// TypeScript types for the table and relations
// $inferSelect is used to infer the types of the selected columns from the table

export type FileInsert = typeof filesTable.$inferInsert;
export type File = typeof filesTable.$inferSelect;

// TODO: know more about $inferSelect and $inferInsert
// TODO: Understand the schema and relations better
