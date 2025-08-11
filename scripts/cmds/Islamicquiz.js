module.exports.config = {
  name: "quiz",
  version: "1.0",
  author: "Md Apon + ChatGPT",
  cooldowns: 5,
  role: 0,
  description: "Islamic quiz with 150 questions",
};

const questions = [
  { question: "কোন মাসে রমজান পালন করা হয়?", options: ["মুহররম", "রজব", "রমজান", "শাবান"], answer: 3 },
  { question: "পাঁচ ওয়াক্ত নামাজের মধ্যে প্রথম নামাজ কোনটি?", options: ["জোহর", "ফজর", "আসর", "মাগরিব"], answer: 2 },
  { question: "ইসলামে কতো রুকন আছে?", options: ["৫", "৬", "৭", "৮"], answer: 1 },
  { question: "মহানবী (সা:) এর পিতার নাম কি?", options: ["আবু তালিব", "আবদুল্লাহ", "আবু বকর", "আলি"], answer: 2 },
  { question: "কোনটি ইসলামের পঞ্চস্তম্ভের একটি?", options: ["হজ", "বৌদ্ধধর্ম", "খ্রিস্টান ধর্ম", "হিন্দুধর্ম"], answer: 1 },
  { question: "কোন মাসে হজ পালন করা হয়?", options: ["জিলকদ", "জুমাদুল আউয়াল", "রজব", "মুহররম"], answer: 1 },
  { question: "নামাজের কতটি ফরজ রাকাত আছে?", options: ["৫", "১৭", "২০", "৭"], answer: 2 },
  { question: "সাহাবীদের মধ্যে প্রথম খলিফা কে ছিলেন?", options: ["অবু বকর", "উমর", "ওসমান", "আলী"], answer: 1 },
  { question: "ইসলামের পবিত্র গ্রন্থ কোনটি?", options: ["বাইবেল", "কোরআন", "বেদ", "তৌরাত"], answer: 2 },
  { question: "রাসূলুল্লাহ (সা:) কত বছর বয়সে নবুয়ত গ্রহণ করেন?", options: ["৩০", "৪০", "৫০", "৬০"], answer: 2 },
  { question: "জুমার নামাজ কবে পড়া হয়?", options: ["শুক্রবার দুপুর", "শনিবার সকাল", "রবিবার সন্ধ্যা", "সোমবার বিকাল"], answer: 1 },
  { question: "কোরআনের প্রথম সূরা কোনটি?", options: ["আল ফাতিহা", "আল বাকারা", "আল ইখলাস", "আল ফালাক"], answer: 1 },
  { question: "কোরআনে মোট কতটি সূরা আছে?", options: ["১১৪", "১২০", "১০০", "৯৯"], answer: 1 },
  { question: "ইসলামের শেষ নবী কে?", options: ["মোসা (আঃ)", "ইসা (আঃ)", "মুহাম্মদ (সা:)", "ইব্রাহিম (আঃ)"], answer: 3 },
  { question: "জানাজার নামাজ কত রাকাত?", options: ["২", "৪", "৩", "১"], answer: 1 },
  { question: "রমজানের ইফতার কখন করা হয়?", options: ["মাগরিবের আগে", "আসর শেষে", "জোহরের পরে", "ইশার আগে"], answer: 1 },
  { question: "সাওম অর্থ কি?", options: ["দোয়া", "রোজা", "নামাজ", "যাকাত"], answer: 2 },
  { question: "নামাজে প্রথম কিয়াম অর্থ কি?", options: ["উঠে দাঁড়া", "বসা", "রুকু করা", "সাজদা করা"], answer: 1 },
  { question: "জানাজার নামাজের শেষতম সালাম কেমন হয়?", options: ["বাম দিকে", "ডান দিকে", "মধ্যম", "সোজা সামনের দিকে"], answer: 2 },
  { question: "যাকাত কি ধরনের ফরজ?", options: ["ঈমানের", "আকীদার", "ফিলালের", "অর্থের"], answer: 4 },
  //...এভাবে আরও ১৩০+ প্রশ্ন তৈরি করতে হবে
];

// ১৫০ প্রশ্নের সম্পূর্ণ তালিকা খুব লম্বা হবে, এখানে মাত্র ২০টি দিচ্ছি নমুনা হিসেবে।  
// তুমি চাইলে সম্পূর্ণ ফাইল আলাদা ফাইলে চাইতে পারো অথবা ধাপে ধাপে দিতে বলো।

const activeQuiz = new Map();

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID, senderID, body } = event;

  if (!activeQuiz.has(threadID)) {
    const qIndex = Math.floor(Math.random() * questions.length);
    const q = questions[qIndex];

    let msg = `🕌 ইসলামিক কুইজ শুরু!\n\nপ্রশ্ন: ${q.question}\n`;
    q.options.forEach((opt, i) => {
      msg += `\n${i + 1}. ${opt}`;
    });
    msg += `\n\nউত্তর দিতে 1 থেকে 4 এর মধ্যে একটি সংখ্যা টাইপ করুন।`;

    activeQuiz.set(threadID, { questionIndex: qIndex, senderID });

    return api.sendMessage(msg, threadID, messageID);
  } else {
    const quizData = activeQuiz.get(threadID);
    if (senderID !== quizData.senderID) return;

    const userAnswer = parseInt(body);
    if (isNaN(userAnswer) || userAnswer < 1 || userAnswer > 4) {
      return api.sendMessage("❌ দয়া করে 1 থেকে 4 এর মধ্যে একটি সংখ্যা পাঠান।", threadID, messageID);
    }

    const correctAnswer = questions[quizData.questionIndex].answer;
    if (userAnswer === correctAnswer) {
      api.sendMessage("✅ সঠিক উত্তর! আপনি ভালো করেছেন।", threadID, messageID);
    } else {
      const correctOption = questions[quizData.questionIndex].options[correctAnswer - 1];
      api.sendMessage(`❌ ভুল উত্তর! সঠিক উত্তর হল: ${correctAnswer}. (${correctOption})`, threadID, messageID);
    }
    activeQuiz.delete(threadID);
  }
};
