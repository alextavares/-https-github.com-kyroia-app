import { prisma } from "@/lib/prisma";

export type ConversationSummary = {
  id: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  modelUsed: string | null;
  isArchived: boolean;
  messagesCount: number;
};

export type ConversationCreateInput = {
  userId: string;
  title?: string | null;
  modelUsed?: string | null;
};

export type ConversationUpdateInput = {
  title?: string;
  isArchived?: boolean;
};

export const ConversationsService = {
  async listByUser(userId: string): Promise<ConversationSummary[]> {
    const rows = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        modelUsed: true,
        isArchived: true,
        _count: { select: { messages: true } },
      },
    });

    return rows.map(({ _count, ...rest }) => ({
      ...rest,
      messagesCount: _count.messages,
    }));
  },

  async create(input: ConversationCreateInput) {
    const { userId, title, modelUsed } = input;
    return prisma.conversation.create({
      data: {
        title: title ?? "Nova Conversa",
        modelUsed: modelUsed ?? "gpt-3.5-turbo",
        userId,
        isArchived: false,
      },
    });
  },

  async findById(userId: string, id: string) {
    return prisma.conversation.findFirst({
      where: { id, userId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
  },

  async update(userId: string, id: string, data: ConversationUpdateInput) {
    const exists = await prisma.conversation.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!exists) return null;

    return prisma.conversation.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.isArchived !== undefined && { isArchived: data.isArchived }),
      },
    });
  },

  async remove(userId: string, id: string) {
    const exists = await prisma.conversation.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!exists) return null;

    await prisma.conversation.delete({ where: { id } });
    return true;
  },
};