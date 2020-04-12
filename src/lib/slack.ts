import axios from "axios";
const webhookUrl = process.env.SLACK_WEBHOOK_URL;

function slackNotifier(type: "error" | "log", message: any): Promise<string> {
  // 1. Build message body
  const messageBody = {
    username: "covid19_nagano_csv_to_json",
    text: type.toUpperCase() + (type === "error" ? "<!here>" : ""),
    attachments: [
      {
        color: type === "error" ? "#ee3333" : "#009900",
        text: JSON.stringify(message)
      }
    ]
  };

  // 2. Send
  if (webhookUrl) {
    return new Promise(function (resolve, reject) {
      try {
        axios
          .post(webhookUrl, JSON.stringify(messageBody), {
            headers: { "Content-type": "application/json" }
          })
          .then((response) => {
            resolve(response.statusText);
          });
      } catch (err) {
        reject(err);
      }
    });
  } else {
    const logger = type === "error" ? console.error : console.log;
    logger(messageBody);
    return Promise.resolve("0");
  }
}

export { slackNotifier };
