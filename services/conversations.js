var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { prisma } from "@/lib/prisma";
export const ConversationsService = {
    async listByUser(userId) {
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
        return rows.map((_a) => {
            var { _count } = _a, rest = __rest(_a, ["_count"]);
            return (Object.assign(Object.assign({}, rest), { messagesCount: _count.messages }));
        });
    },
    async create(input) {
        const { userId, title, modelUsed } = input;
        return prisma.conversation.create({
            data: {
                title: title !== null && title !== void 0 ? title : "Nova Conversa",
                modelUsed: modelUsed !== null && modelUsed !== void 0 ? modelUsed : "gpt-3.5-turbo",
                userId,
                isArchived: false,
            },
        });
    },
    async findById(userId, id) {
        return prisma.conversation.findFirst({
            where: { id, userId },
            include: {
                messages: { orderBy: { createdAt: "asc" } },
            },
        });
    },
    async update(userId, id, data) {
        const exists = await prisma.conversation.findFirst({
            where: { id, userId },
            select: { id: true },
        });
        if (!exists)
            return null;
        return prisma.conversation.update({
            where: { id },
            data: Object.assign(Object.assign({}, (data.title !== undefined && { title: data.title })), (data.isArchived !== undefined && { isArchived: data.isArchived })),
        });
    },
    async remove(userId, id) {
        const exists = await prisma.conversation.findFirst({
            where: { id, userId },
            select: { id: true },
        });
        if (!exists)
            return null;
        await prisma.conversation.delete({ where: { id } });
        return true;
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udmVyc2F0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbnZlcnNhdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBdUJ0QyxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRztJQUNsQyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQWM7UUFDN0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQztZQUM5QyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUU7WUFDakIsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTtZQUM5QixNQUFNLEVBQUU7Z0JBQ04sRUFBRSxFQUFFLElBQUk7Z0JBQ1IsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsRUFBRTthQUN2QztTQUNGLENBQUMsQ0FBQztRQUVILE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQW1CLEVBQUUsRUFBRTtnQkFBdkIsRUFBRSxNQUFNLE9BQVcsRUFBTixJQUFJLGNBQWpCLFVBQW1CLENBQUY7WUFBTyxPQUFBLGlDQUNwQyxJQUFJLEtBQ1AsYUFBYSxFQUFFLE1BQU0sQ0FBQyxRQUFRLElBQzlCLENBQUE7U0FBQSxDQUFDLENBQUM7SUFDTixDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUE4QjtRQUN6QyxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFDM0MsT0FBTyxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztZQUNoQyxJQUFJLEVBQUU7Z0JBQ0osS0FBSyxFQUFFLEtBQUssYUFBTCxLQUFLLGNBQUwsS0FBSyxHQUFJLGVBQWU7Z0JBQy9CLFNBQVMsRUFBRSxTQUFTLGFBQVQsU0FBUyxjQUFULFNBQVMsR0FBSSxlQUFlO2dCQUN2QyxNQUFNO2dCQUNOLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBYyxFQUFFLEVBQVU7UUFDdkMsT0FBTyxNQUFNLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQztZQUNuQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFO1lBQ3JCLE9BQU8sRUFBRTtnQkFDUCxRQUFRLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEVBQUU7YUFDNUM7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFjLEVBQUUsRUFBVSxFQUFFLElBQTZCO1FBQ3BFLE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUM7WUFDakQsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRTtZQUNyQixNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFO1NBQ3JCLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxNQUFNO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFekIsT0FBTyxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztZQUNoQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUU7WUFDYixJQUFJLGtDQUNDLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQ25ELENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQ3RFO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBYyxFQUFFLEVBQVU7UUFDckMsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQztZQUNqRCxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFO1lBQ3JCLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUU7U0FDckIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPLElBQUksQ0FBQztRQUV6QixNQUFNLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUNGLENBQUMifQ==