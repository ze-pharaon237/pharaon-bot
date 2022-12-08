import Strings from "../lib/db";
import { ModuleCategory as Cat } from "../lib/moduleCategory";
import inputSanitization from "../sidekick/input-sanitization";
import { MessageType } from "../sidekick/message-type";
import Client from "../sidekick/client";
import { proto } from "@adiwajshing/baileys";
import BotsApp from "../sidekick/sidekick";
const vote = Strings.vote;
import fs from 'fs';
import { group } from "console";


export = {
    name: "vote",
    description: vote.DESCRIPTION,
    extendedDescription: vote.EXTENDED_DESCRIPTION,
    demo: { isEnabled: false },
    category: Cat.game,
    async handle(client: Client, chat: proto.IWebMessageInfo, BotsApp: BotsApp, args: string[]): Promise<void> {
        try {

            if (!BotsApp.isGroup) {
                client.sendMessage(
                    BotsApp.chatId,
                    Strings.general.NOT_A_GROUP,
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }

            await client.getGroupMetaData(BotsApp.chatId, BotsApp);

            if (args[0] === vote.CREATE) {
                console.log(vote.CREATE);
                if (!BotsApp.isSenderGroupAdmin) {
                    client.sendMessage(
                        BotsApp.chatId,
                        Strings.general.ADMIN_PERMISSION,
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    return;
                }

                //syntaxe : .vote create vote_message ///choix1 / choix2 / choix3 ...
                let syntax = "";
                for (var index = 1; index < args.length; index++) {
                    syntax += args[index] + " ";
                }
                let syntaxTab = syntax.split("///");

                if (syntaxTab[0].length == 0 || syntaxTab[1].length == 0) {
                    client.sendMessage(
                        BotsApp.chatId,
                        "A part can't have 0 character.",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    return;
                } else if (syntaxTab.length > 2) {
                    client.sendMessage(
                        BotsApp.chatId,
                        "The create vote syntaxe can't have more that 2 part ! (part1 /// part2)",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    return;
                } else if (syntaxTab[1].split("/").length > 2) {
                    client.sendMessage(
                        BotsApp.chatId,
                        "You can make only 2 choices !",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    return;
                }

                await client.getGroupMetaData(BotsApp.chatId, BotsApp);
                let label = syntaxTab[0];
                let creator = BotsApp.sender;
                let choice = syntaxTab[1].split("/");
                let group = BotsApp.groupId;

                let result = await JSON_createVote(label, creator, choice, group);

                if (result) {
                    let members = [];
                    for (var i = 0; i < BotsApp.groupMembers.length; i++) {
                        members[i] = BotsApp.groupMembers[i].id;
                    }
                    client.sendMessage(
                        BotsApp.chatId,
                        displayVote(result, BotsApp),
                        MessageType.buttonsMessage,
                        {
                            contextInfo: {
                                mentionedJid: members,
                            }
                        },
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    return;

                } else {
                    client.sendMessage(
                        BotsApp.chatId,
                        "Unknow error, please contact my owner !",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    return;
                }

            } else if (args[0] === vote.CHOOSE) {
                console.log(vote.CHOOSE);

                if (args.length < 3) {
                    client.sendMessage(
                        BotsApp.chatId,
                        "Wrong command, try .help vote !!!",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    return;
                } else {
                    let voteId: number = +args[1];
                    let choice = "";

                    for (var i = 2; i < args.length; i++) {
                        choice += args[i];
                    }
                    var result = await JSON_addMemberChoice(BotsApp.groupId, voteId, BotsApp.sender, choice);
                    client.sendMessage(
                        BotsApp.chatId,
                        result,
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    return;
                }

            } else if (args[0] === vote.LIST) {
                console.log(vote.LIST);
                if (!BotsApp.isSenderGroupAdmin) {
                    client.sendMessage(
                        BotsApp.chatId,
                        Strings.general.ADMIN_PERMISSION,
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    return;
                }

                const obj = await readFile();
                var message = "";
                let members = [];
                // get group
                let groupe: Group;
                let groupExistIndex = isGroupExist(obj.group, BotsApp.groupId);
                if (groupExistIndex >= 0) {
                    groupe = obj.group[groupExistIndex];
                    if (groupe.voteList.length > 0) {
                        for (var tab of groupe.voteList) {
                            if (!members.includes(tab.creatorId)) {
                                members.push(tab.creatorId);
                            }
                            message += "°" + tab.voteId + " - " + tab.date + " : @" + tab.creatorId.split("@")[0] + " \n" + "*Vote :* " + tab.label + " \n\n";
                        }
                    } else {
                        message = "Empty";
                    }
                } else {
                    message = "Empty";
                }

                client.sendMessage(
                    BotsApp.chatId,
                    message,
                    MessageType.text,
                    {
                        contextInfo: {
                            mentionedJid: members,
                        }
                    },
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;

            } else if (args[0] === vote.SHOW) {
                console.log(vote.SHOW);
                if (!BotsApp.isSenderGroupAdmin) {
                    client.sendMessage(
                        BotsApp.chatId,
                        Strings.general.ADMIN_PERMISSION,
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    return;
                }

                if (args.length < 2) {
                    client.sendMessage(
                        BotsApp.chatId,
                        "Wrong command, try .help vote !!!",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    return;
                } else {
                    const obj = await readFile();
                    let voteId: number = +args[1];

                    // get group
                    let groupe: Group;
                    let groupExistIndex = isGroupExist(obj.group, BotsApp.groupId);
                    if (groupExistIndex >= 0) {
                        groupe = obj.group[groupExistIndex];
                    } else {
                        client.sendMessage(
                            BotsApp.chatId,
                            "Unknow vote, maybe vote are delete by the administrator or my owner",
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                        return;
                    }

                    for (var tab of groupe.voteList) {
                        if (tab.voteId == voteId) {
                            client.sendMessage(
                                BotsApp.chatId,
                                displayVote(tab, BotsApp),
                                MessageType.buttonsMessage,
                                {
                                    contextInfo: {
                                        mentionedJid: [tab.creatorId],
                                    }
                                },
                            ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                            return;
                        }
                    }

                    client.sendMessage(
                        BotsApp.chatId,
                        "Unknow vote, maybe vote are delete by the administrator or my owner",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    return;


                }

            } else if (args[0] === vote.RESULT) {
                console.log(vote.RESULT);
                if (!BotsApp.isSenderGroupAdmin) {
                    client.sendMessage(
                        BotsApp.chatId,
                        Strings.general.ADMIN_PERMISSION,
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    return;
                }

                if (args.length < 2) {
                    client.sendMessage(
                        BotsApp.chatId,
                        "Wrong command, try .help vote !!!",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    return;
                } else {
                    const obj = await readFile();
                    let voteId: number = +args[1];

                    // get group
                    let groupe: Group;
                    let groupExistIndex = isGroupExist(obj.group, BotsApp.groupId);
                    if (groupExistIndex >= 0) {
                        groupe = obj.group[groupExistIndex];
                    } else {
                        client.sendMessage(
                            BotsApp.chatId,
                            "Unknow vote, maybe vote are delete by the administrator or my owner",
                            MessageType.text
                        ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                        return;
                    }

                    for (var tab of groupe.voteList) {
                        if (tab.voteId == voteId) {
                            client.sendMessage(
                                BotsApp.chatId,
                                displayResult(tab, BotsApp),
                                MessageType.text,
                            ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                            return;
                        }
                    }

                    client.sendMessage(
                        BotsApp.chatId,
                        "Unknow vote, maybe vote are delete by the administrator or my owner",
                        MessageType.text
                    ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                    return;


                }

            } else {
                client.sendMessage(
                    BotsApp.chatId,
                    "Unknow command, try .help vote !",
                    MessageType.text
                ).catch(err => inputSanitization.handleError(err, client, BotsApp));
                return;
            }

        } catch (err) {
            await inputSanitization.handleError(err, client, BotsApp);
        }
    },


};


/// display command

function displayVote(_vote: Vote, BotsApp: BotsApp): any {
    var sender = "@" + _vote.creatorId.split("@")[0];
    var text = "*Vote creator :* \n" + sender + "\n\n" + "*label :* \n" + _vote.label + "\n";
    var buttons = [];
    var i = 1;
    buttons.push({buttonId: 'id1', buttonText: {displayText: " "}, type:1});
    for (var str of _vote.choice) {
        if (str.length > 0) {
            buttons.push(
                {buttonId: 'id1', buttonText: {displayText: ".vote " + vote.CHOOSE + " " + _vote.voteId + " " + str}, type:1}
            );
        }
        i++;
    }
    console.log(buttons);
    const buttonMessage = {
        text: text,
        buttons: buttons,
        footer: "Generated by PharaonBot",
        headerType: 1
    }

    return buttonMessage;
}

function displayResult(_vote: Vote, BotsApp: BotsApp): any {
    var sender = "@" + _vote.creatorId.split("@")[0];
    var text = "*Result of vote :" + _vote.voteId + "* \n" + "\n\n";
    text += "date : " + _vote.date + "\n";
    text += "*Member vote count:* " + _vote.memberVote.length + "/" + BotsApp.groupMembers.length + "\n\n";
    text += "*Details :* \n"
    for (var str of _vote.choice) {
        var x = 0;
        for (var memberVote of _vote.memberVote) {
            if (isValidMemberVoteChoice(str, memberVote.choice)) {
                x++;
            }
        }
        text += "-" + str + ":" + x + "/" + _vote.memberVote.length + "\n";
    }

    return text;
}

/// command function

async function JSON_createVote(_label: string, _creator: string, _choice: string[], _group: string): Promise<Vote> {
    try {
        let obj = await readFile();

        /// create or get groupe
        let groupe: Group;
        let existIndex = isGroupExist(obj.group, _group);
        if (existIndex >= 0) {
            groupe = obj.group[existIndex];
        } else {
            groupe = new Group();
            groupe.groupId = _group;
            obj.group.push(groupe);
        }

        /// create vote
        let vote = new Vote();
        if (groupe.voteList.length > 0) {
            vote.voteId = groupe.voteList[groupe.voteList.length - 1].voteId + 1;
        } else {
            vote.voteId = 1;
        }
        vote.date = new Date().toLocaleString();
        vote.label = _label;
        vote.creatorId = _creator;
        vote.choice = _choice;

        groupe.voteList.push(vote);

        await writeFile(obj);

        return vote;

    } catch (error) {
        console.log(error);
        return null;
    }


}

async function JSON_addMemberChoice(_group: string, _vote: number, _memberId: string, _choice: string): Promise<string> {
    try {
        let obj = await readFile();

        // get group
        let groupe;
        let groupExistIndex = isGroupExist(obj.group, _group);
        if (groupExistIndex >= 0) {
            groupe = obj.group[groupExistIndex];
        } else {
            return "Unknow vote, maybe vote are delete by the administrator or my owner";
        }

        /// get vote
        let vote;
        let voteExistIndex = isVoteExist(groupe.voteList, _vote);
        if (voteExistIndex >= 0) {
            vote = groupe.voteList[voteExistIndex];
            console.log(vote);
        } else {
            return "Unknow vote, maybe vote are delete by the administrator or my owner";
        }

        //verify choice
        if (!isMemberVoteChoiceExist(vote.choice, _choice)) {
            console.log("'" + _choice + "'");
            return _choice + " is not a valid choice !";
        }

        // add member vote
        let memberVote;
        let memberVoteExistIndex = isMemberVoteExist(vote.memberVote, _memberId);
        if (memberVoteExistIndex >= 0) {
            memberVote = vote.memberVote[memberVoteExistIndex];
            memberVote.choice = _choice;
            await writeFile(obj);
            return "We are *change* your vote : " + _choice;
        } else {
            memberVote = new MemberVote(_memberId, _choice);
            vote.memberVote.push(memberVote);
            await writeFile(obj);
            return "We are *save* your vote : " + _choice;
        }

    } catch (error) {
        console.log(error);
        return "Unknow error, contact my owner";
    }
}

async function readFile(): Promise<Obj> {
    let obj = new Obj();
    await fs.promises.readFile(vote.FILE, "utf8").then((data) => {
        if (data.length > 0) {
            obj = JSON.parse(data);
        } else {
            console.log("Empty list");
        }
    }).catch(() => {
        console.log("err");
    });
    return obj;
}

async function writeFile(obj: Obj): Promise<boolean> {
    let value = false;
    await fs.promises.writeFile(vote.FILE, JSON.stringify(obj), "utf8")
        .then(() => {
            value = true;
        })
        .catch((err) => {
            console.log("err");
        });
    return value;
}


/// verification function

function isGroupExist(_groupe: Group[], id: string): number {
    for (var i = 0; i < _groupe.length; i++) {
        if (_groupe[i].groupId === id) return i;
    }
    return -1;
}

function isVoteExist(_vote: Vote[], id: number): number {
    for (var i = 0; i < _vote.length; i++) {
        if (_vote[i].voteId == id) return i;
    }
    return -1;
}

function isMemberVoteExist(_memberVote: MemberVote[], memberId: string): number {
    for (var i = 0; i < _memberVote.length; i++) {
        if (_memberVote[i].memberId === memberId) return i;
    }
    return -1;
}

function isMemberVoteChoiceExist(_choice: string[], choiceValue: string): boolean {
    for (var i = 0; i < _choice.length; i++) {
        console.log("\n");
        console.log(_choice[i]);
        console.log(choiceValue);
        console.log(_choice[i].length);
        console.log(_choice[i].split(" ").length);
        console.log(choiceValue.length);
        if (isValidMemberVoteChoice(_choice[i], choiceValue)) {
            return true;
        }
    }
    return false;
}

function isValidMemberVoteChoice(item: string, choice: string): boolean {
    for (let str of choice.split("")) {
        if (!item.includes(str)) {
            return false;
        }
    }
    if (item.length == (item.split(" ").length - 1 + choice.length)) {
        return true;
    } else {
        return false;
    }
}

/// class

class Obj {
    group: Group[] = [];
}

class Group {
    groupId = "";
    voteList: Vote[] = [];
}

class Vote {
    voteId = 0;
    creatorId = "";
    label = "";
    date = "";
    choice: string[] = [];
    memberVote: MemberVote[] = [];
}

class MemberVote {
    memberId = "";
    choice = "";

    constructor(mid: string, ch: string) {
        this.memberId = mid;
        this.choice = ch;
    }
}
