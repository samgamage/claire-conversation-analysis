const lodash = require("lodash");
const language = require("@google-cloud/language");
const cors = require("cors");

const convsersationAnalysis = async (req, res) => {
  const client = new language.LanguageServiceClient();
  const messages = req.body.messages;
  if (!messages) {
    res.status(400).send({
      ok: false,
      sentiment: 0,
      reason: "No messages from one user."
    });
    return;
  }
  const [user1, user2] = lodash.uniq(messages.map(message => message.sender));

  const user1Messages = messages.filter(message => message.sender === user1);
  const user2Messages = messages.filter(message => message.sender === user2);

  // if no messages in either user then just return
  if (user1Messages.length === 0 || user2Messages.length === 0) {
    res.status(400).send({
      ok: false,
      sentiment: 0,
      reason: "No messages from one user."
    });
    return;
  }

  const a =
    user1Messages.length < user2Messages.length
      ? user1Messages.length
      : user2Messages.length;
  const b =
    user1Messages.length > user2Messages.length
      ? user1Messages.length
      : user2Messages.length;
  const ratio = a / b;

  if (ratio <= 0.3) {
    res.status(200).send({ ok: true, sentiment: 0 });
    return;
  }

  let conversation = "";

  req.body.messages.forEach(async message => {
    conversation += " " + message.content;
  });

  const document = {
    content: conversation,
    type: "PLAIN_TEXT"
  };

  const [result] = await client.analyzeSentiment({ document });
  const sentiment = result.documentSentiment;
  console.log(conversation);
  console.log(sentiment);

  res.status(200).send({ ok: true, sentiment });
};

exports.convsersationAnalysis = async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  const corsFn = cors({ origin: true });
  corsFn(req, res, async () => {
    await convsersationAnalysis(req, res);
  });
};
