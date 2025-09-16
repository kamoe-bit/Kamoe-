const a = require("axios");
const b = "https://nix-baby-apis.vercel.app";
const amiTomakeValobashi = ["😚", "Yes 😀, I am here", "What's up?", "Bolo jaan ki korte panmr jonno"];
const d = () => amiTomakeValobashi[Math.floor(Math.random() * amiTomakeValobashi.length)];

function e(f) {
    if (!f) return '';
    return f.replace(/[\p{Emoji_Presentation}\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Modifier_Base}\uFE0F\u20E3]/gu, '').trim();
}

function g(f) {
    if (!f) return '';
    const h = f.replace(/[^\p{L}\p{N}\s-]/gu, '').trim();
    if (h.length === 0 && f.replace(/[\s]/g, '').length > 0) {
        return f;
    }
    return h;
}

module.exports.config = {
    name: "bby",
    aliases: ["baby"],
    version: "0.0.1",
    author: "ArYAN",
    cooldowns: 0,
    role: 0,
    shortDescription: "AI chat bot with learning",
    longDescription: "Chat bot with random replies, teaching, removing, editing",
    category: "chat",
    guide: {
        en: `Chat: {pn} [msg]
Teach: {pn} teach [msg] - [reply1, reply2]
Remove: {pn} remove [msg]
Remove specific reply: {pn} rm [msg] - [index]
List teachers: {pn} list all
View info: {pn} list
Edit reply: {pn} edit [msg] - [newReply]`
    }
};

async function h(api, event, text) {
    try {
        const i = await a.get(`${b}/baby?text=${encodeURIComponent(text)}&senderID=${event.senderID}&font=1`);
        const j = i?.data?.reply;
        if (j) {
            api.sendMessage(j, event.threadID, (err, info) => {
                if (!err) {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: module.exports.config.name,
                        type: "reply",
                        messageID: info.messageID,
                        author: event.senderID
                    });
                }
            }, event.messageID);
        } else {
            api.sendMessage("❌ | No response found. Please teach me!", event.threadID, event.messageID);
        }
    } catch (k) {
        console.error(k);
        api.sendMessage("❌ | Failed to fetch reply.", event.threadID, event.messageID);
    }
}

module.exports.onStart = async ({ api, event, args, usersData }) => {
    if (!event.body) return;
    const l = args.join(" ").trim();
    const m = event.senderID;
    try {
        if (!l) {
            return api.sendMessage(d(), event.threadID, event.messageID);
        }

        if (args[0] === "remove") {
            const n = l.slice(7).trim();
            const o = await a.get(`${b}/baby-remove?key=${encodeURIComponent(n)}`);
            return api.sendMessage(o.data.message || "Removed", event.threadID, event.messageID);
        }

        if (args[0] === "rm" && l.includes("-")) {
            const [n, p] = l.slice(3).split(/\s*-\s*/);
            if (!n || p === undefined) {
                return api.sendMessage("❌ | Use: rm [msg] - [reply/index]", event.threadID, event.messageID);
            }
            const q = !isNaN(parseInt(p)) ? `index=${encodeURIComponent(p)}` : `reply=${encodeURIComponent(p)}`;
            const o = await a.get(`${b}/baby-remove?key=${encodeURIComponent(n)}&${q}`);
            return api.sendMessage(o.data.message || "Removed", event.threadID, event.messageID);
        }

        if (args[0] === "list") {
            if (args[1] === "all") {
                const r = await a.get(`${b}/teachers`);
                const s = r.data.teachers || {};
                const t = Object.keys(s).sort((u, v) => s[v] - s[u]);
                const u = await Promise.all(t.map(async v => {
                    const w = await usersData.getName(v).catch(() => v);
                    return `• ${w}: ${s[v]}`;
                }));
                return api.sendMessage(`👑 | Teachers:\n${u.join("\n")}`, event.threadID, event.messageID);
            } else {
                const x = await a.get(`${b}/baby-info`);
                return api.sendMessage(
                    `❇️ | Total Teach = ${x.data.totalKeys || "api off"}\n♻️ | Total Response = ${x.data.totalReplies || "api off"}`,
                    event.threadID,
                    event.messageID
                );
            }
        }

        if (args[0] === "edit") {
            const y = l.split(/\s*-\s*/);
            if (y.length < 2) {
                return api.sendMessage("❌ | Use: edit [msg] - [newReply]", event.threadID, event.messageID);
            }
            const z = y[0].replace("edit ", "");
            const A = y[1];
            const o = await a.get(`${b}/baby-edit?key=${encodeURIComponent(z)}&replace=${encodeURIComponent(A)}&senderID=${m}`);
            return api.sendMessage(o.data.message || "Edited", event.threadID, event.messageID);
        }

        if (args[0] === "teach" && args[1] === "react") {
            const [B, C] = l.split(/\s*-\s*/);
            const D = B.replace("teach react ", "");
            if (!C) {
                return api.sendMessage("❌ | Invalid format!", event.threadID, event.messageID);
            }
            try {
                const o = await a.get(`${b}/baby?teach=${encodeURIComponent(D)}&react=${encodeURIComponent(C)}`);
                return api.sendMessage(`✅ Reactions updated successfully: ${o.data.message}`, event.threadID, event.messageID);
            } catch (E) {
                if (E.response && E.response.status === 400 && E.response.data.message === "Bad word not allowed") {
                    return api.sendMessage("❌ | Bad word not allowed!", event.threadID, event.messageID);
                }
                throw E;
            }
        }

        if (args[0] === "teach") {
            const [B, C] = l.split(/\s*-\s*/);
            const D = B.replace("teach ", "");
            if (!C) {
                return api.sendMessage("❌ | Invalid format!", event.threadID, event.messageID);
            }

            try {
                const o = await a.get(`${b}/baby?teach=${encodeURIComponent(D)}&reply=${encodeURIComponent(C)}&senderID=${m}`);
                const F = await usersData.getName(m).catch(() => m);

                if (o.data.message === "This reply has already been taught for this question." || o.data.addedReplies?.length === 0) {
                    return api.sendMessage(`❌ | This reply has already been taught for this question.\nTeacher: ${F}\nReply: ${C}`, event.threadID, event.messageID);
                }

                const G = await a.get(`${b}/teachers`);
                const H = G.data.teachers[m] || 0;

                const I = o.data.addedReplies?.join(", ") || C;
                return api.sendMessage(`✅ | Replies added "${I}" added to "${D}".\nTeacher: ${F}\nTeachs: ${H}`, event.threadID, event.messageID);
            } catch (E) {
                if (E.response && E.response.status === 400 && E.response.data.message === "Bad word not allowed") {
                    return api.sendMessage("❌ | Bad word not allowed!", event.threadID, event.messageID);
                }
                throw E;
            }
        }

        h(api, event, l);
    } catch (k) {
        console.error(k);
        api.sendMessage("❌ | Something went wrong.", event.threadID, event.messageID);
    }
};

module.exports.onReply = async ({ api, event }) => {
    if (!event.messageReply?.body) return;
    const J = g(e(event.body)).toLowerCase();
    h(api, event, J);
};

module.exports.onChat = async ({ api, event, usersData }) => {
    if (event.senderID === api.getCurrentUserID() || !event.body) return;
    const K = event.body.toLowerCase();
    const L = K.match(/^(baby|bby|bot|বেবি|জান|jan|বট|বেবী|বাবু|janu)\s*(.*)/);
    if (!L) return;

    let M = L[2]?.trim();
    const m = event.senderID;

    if (!M) {
        const N = d();
        return api.sendMessage(N, event.threadID, (err, info) => {
            if (!err) {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: module.exports.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID
                });
            }
        }, event.messageID);
    }

    const O = g(e(M));
    if (O.length > 0) {
        h(api, event, O);
    }
};
