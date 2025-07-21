import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

export const DeleteWhatsAppMessage = async (messageId: string): Promise<Message> => {
  const message = await Message.findByPk(messageId, {
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"]
      }
    ]
  });

  if (!message) {
    throw new AppError("No message found with this ID.");
  }

  const { ticket } = message;

  const messageToDelete = await GetWbotMessage(ticket, messageId);

  try {
    await messageToDelete.delete(true);
  } catch (err) {
    throw new AppError("ERR_DELETE_WAPP_MSG");
  }

  await message.update({ isDeleted: true });

  return message;
};


export const DeleteMessagesByTimeRange = async (
  fromDate: Date,
  toDate: Date
): Promise<Message[]> => {
  const messages = await Message.findAll({
    where: {
      isDeleted: false,
      createdAt: {
        [Op.between]: [fromDate.getTime(), toDate.getTime()]
      }
    },
    include: [
      {
        association: "ticket",
        include: ["contact"]
      }
    ]
  });

  const deletedMessages: Message[] = [];

  for (const msg of messages) {
    console.log("🚀 ~ msg:", msg)
    try {
      const deleted = await DeleteWhatsAppMessage(msg.id);
      deletedMessages.push(deleted);
    } catch (err) {
      console.error(`Failed to delete message ${msg.id}:`, err.message);
      // bisa disimpan ke log atau dilewati saja
    }
  }

  return deletedMessages;
};

