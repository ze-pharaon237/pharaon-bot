"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../lib/db"));
const message_type_1 = require("../sidekick/message-type");
const input_sanitization_1 = __importDefault(require("../sidekick/input-sanitization"));
const Reply = db_1.default.block;
module.exports = {
    name: "block",
    description: Reply.DESCRIPTION,
    extendedDescription: Reply.EXTENDED_DESCRIPTION,
    handle(client, chat, BotsApp, args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const reply = chat.message.extendedTextMessage;
                var contact = "";
                if (args.length == 0 && !BotsApp.isTextReply) {
                    client.sendMessage(BotsApp.chatId, Reply.MESSAGE_NOT_TAGGED, message_type_1.MessageType.text);
                    return;
                }
                if (!(args.length > 0) && BotsApp.isTextReply) {
                    contact = reply.contextInfo.participant.split("@")[0];
                }
                else {
                    contact = yield input_sanitization_1.default.getCleanedContact(args, client, BotsApp);
                }
                if (contact === BotsApp.owner.split("@")[0]) {
                    client.sendMessage(BotsApp.chatId, Reply.NOT_BLOCK_BOT, message_type_1.MessageType.text);
                    return;
                }
                if (contact === "") {
                    client.sendMessage(BotsApp.chatId, Reply.MESSAGE_NOT_TAGGED, message_type_1.MessageType.text);
                    return;
                }
                var JID = contact + "@s.whatsapp.net";
                client.sock.updateBlockStatus(JID, "block");
                client.sendMessage(BotsApp.chatId, "*" + contact + " blocked successfully.*", message_type_1.MessageType.text);
            }
            catch (err) {
                yield input_sanitization_1.default.handleError(err, client, BotsApp, Reply.MESSAGE_NOT_TAGGED);
            }
        });
    },
};
//# sourceMappingURL=block.js.map