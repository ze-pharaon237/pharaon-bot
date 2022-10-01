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
const db_1 = __importDefault(require("../lib/db"));
const moduleCategory_1 = require("../lib/moduleCategory");
const input_sanitization_1 = __importDefault(require("../sidekick/input-sanitization"));
const message_type_1 = require("../sidekick/message-type");
const love = db_1.default.love;
module.exports = {
    name: "love",
    description: love.DESCRIPTION,
    extendedDescription: love.EXTENDED_DESCRIPTION,
    demo: { isEnabled: false },
    category: moduleCategory_1.ModuleCategory.game,
    handle(client, chat, BotsApp, args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!BotsApp.isGroup) {
                    client.sendMessage(BotsApp.chatId, db_1.default.general.NOT_A_GROUP, message_type_1.MessageType.text).catch(err => input_sanitization_1.default.handleError(err, client, BotsApp));
                    return;
                }
                if (!args[0]) {
                    client.sendMessage(BotsApp.chatId, db_1.default.remove.INPUT_ERROR, message_type_1.MessageType.text).catch(err => input_sanitization_1.default.handleError(err, client, BotsApp));
                    return;
                }
                yield client.getGroupMetaData(BotsApp.chatId, BotsApp);
                if (args.length == 2) {
                    console.log(BotsApp);
                    var member1 = args[0].substring(1);
                    var member2 = args[1].substring(1);
                    var isMember1 = yield input_sanitization_1.default.isMember(member1, BotsApp.groupMembers);
                    var isMember2 = yield input_sanitization_1.default.isMember(member2, BotsApp.groupMembers);
                    if (!isMember1) {
                        client.sendMessage(BotsApp.chatId, args[0] + " is not a group member", message_type_1.MessageType.text).catch(err => input_sanitization_1.default.handleError(err, client, BotsApp));
                        return;
                    }
                    if (!isMember2) {
                        client.sendMessage(BotsApp.chatId, args[1] + " is not a group member", message_type_1.MessageType.text).catch(err => input_sanitization_1.default.handleError(err, client, BotsApp));
                        return;
                    }
                    var pourc = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
                    let members = [member1 + '@s.whatsapp.net', member2 + '@s.whatsapp.net'];
                    client.sendMessage(BotsApp.chatId, "for " + args[0] + " and " + args[1] + ", we have " + pourc + " %", message_type_1.MessageType.text, {
                        contextInfo: {
                            mentionedJid: members,
                        }
                    }).catch(err => input_sanitization_1.default.handleError(err, client, BotsApp));
                    return;
                }
                if (args.length == 3) {
                    client.sendMessage(BotsApp.chatId, "Ooh noo, please forget this 'plan à 3' ! ", message_type_1.MessageType.text).catch(err => input_sanitization_1.default.handleError(err, client, BotsApp));
                    return;
                }
                client.sendMessage(BotsApp.chatId, love.EXTENDED_DESCRIPTION, message_type_1.MessageType.text).catch(err => input_sanitization_1.default.handleError(err, client, BotsApp));
                return;
            }
            catch (err) {
                yield input_sanitization_1.default.handleError(err, client, BotsApp);
            }
        });
    },
};
//# sourceMappingURL=love.js.map