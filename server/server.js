const express = require("express");
const app = express();
const webpush = require("web-push");
let USER_SUBSCRIPTIONS = [
  {
    endpoint:
      "https://fcm.googleapis.com/fcm/send/czOwkWXot7w:APA91bGHB-dxD5Q_c6ubdPWncUBhShDJKKHAhebbCFmu9CsHn3c0XFLI0c7GpVzFJqxIImiOabRppZAQ9M_exSsMFpaQYSdQ2HN0pb74GvHSIIxnJ_JIqbcn5n7C-CUiHCwJZMUoDhqk",
    expirationTime: null,
    keys: {
      p256dh:
        "BNrQ7PztQxVz5mi0wuV8o3gN_l8yRilZIX5SxbTNClLVCYnfMwA-pviiHLsLXouHnJBiVXlaqNn_Jx2_aZrlp94",
      auth: "fZYkWs0HivEZKF-60hcPnA",
    },
  },
];

const VAPID_KEYS = {
  publicKey:
    "BNKUkKcQ2gXYbypqLe6ejJvOcnQKfDATy5SBNOoGrV39WgFoHuBni6v11Vzf5NeUNxOsOTMiJeDWXdKJGAsbNEI",
  privateKey: "uRq7FSi7oZL3ms8tMa0z5rfpIccrmQgDqyd0cDabsNk",
};
// handling CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:4200");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

webpush.setVapidDetails(
  "mailto:example@yourdomain.org",
  VAPID_KEYS.publicKey,
  VAPID_KEYS.privateKey
);
// route for handling requests from the Angular client
// app.get("/api/message", (req, res) => {
//   res.json({ message: "Hello GEEKS FOR GEEKS Folks from the Express server!" });
// });

app.post("/api/notifications", (req, res) => {
  const sub = req.body;
  console.log("req", sub);
  //   console.log("res", res);
  console.log("Received Subscription on the server: ", sub);

  //   USER_SUBSCRIPTIONS.push(sub);

  res.status(200).json({ message: "Subscription added successfully." });
  console.log("Total subscriptions 1", USER_SUBSCRIPTIONS);
});

app.route("/api/newsletter").post((req, res) => {
  console.log("Total subscriptions", USER_SUBSCRIPTIONS);

  // sample notification payload
  const notificationPayload = {
    notification: {
      title: "Angular News",
      body: "Newsletter Available!",
      icon: "https://miro.medium.com/v2/resize:fit:640/format:webp/1*BSNDashSJZks1euWcyMj1w.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
      actions: [
        {
          action: "explore",
          title: "Go to the site",
        },
      ],
    },
  };

  Promise.all(
    USER_SUBSCRIPTIONS.map((sub) => {
      console.log("sendNotification", sub);
      webpush.sendNotification(sub, JSON.stringify(notificationPayload));
    })
  )
    .then(() =>
      res.status(200).json({ message: "Newsletter sent successfully." })
    )
    .catch((err) => {
      console.error("Error sending notification, reason: ", err);
      res.sendStatus(500);
    });
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
