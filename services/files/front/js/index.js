import notificationService from "./notification.js";
import "/js/capacitor.min.js";

const {LocalNotifications, PushNotifications} = Capacitor.Plugins;

document.addEventListener("logged-in", async () => await notificationService.openWebSocket());
await notificationService.openWebSocket();

if (Capacitor.isNativePlatform()) {
    await createNotificationChannel();
    await testNotification();

    await LocalNotifications.addListener("localNotificationActionPerformed", (notification) => {
        console.log("User clicked on notification:", notification);
        alert("CLIQUE PAS SUR LA NOTIF");
    });
}

// Initialize push notifications
async function initializePushNotifications() {
    // Create notification channels for Android
    await createNotificationChannel();

    // Request permission to receive push notifications
    const permStatus = await PushNotifications.requestPermissions();

    if (permStatus.receive === "granted") {
        // Register with FCM (Firebase Cloud Messaging) on Android or APNS on iOS
        await PushNotifications.register();

        // Setup push notification listeners
        setupPushListeners();

        // For testing, you can still use local notifications
        await testLocalNotification();
    } else {
        console.log("Push notification permission denied");
    }
}

// Setup push notification listeners
function setupPushListeners() {
    // When registration succeeds
    PushNotifications.addListener("registration", (token) => {
        console.log("Push registration success: ", token.value);
        // Send this token to your server to associate with the user
        //sendTokenToServer(token.value);
    });

    // If registration fails
    PushNotifications.addListener("registrationError", (error) => {
        console.error("Push registration failed: ", error);
    });

    // When a push notification is received while the app is in foreground
    PushNotifications.addListener("pushNotificationReceived", (notification) => {
        console.log("Push notification received: ", notification);
        // You can show a local notification here if desired
    });

    // When a user taps on a push notification
    PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
        console.log("Push notification action performed: ", notification);
        // Handle notification tap here - navigate to specific page, etc.
    });
}

// Function to send device token to your server
function sendTokenToServer(token) {
    // Implement API call to send token to your backend
    // Example:
    fetch("your-api-endpoint/register-device", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            deviceToken: token,
            platform: Capacitor.getPlatform()
            // Include user ID or other identifiers as needed
        })
    })
        .then(response => response.json())
        .then(data => console.log("Token registered with server:", data))
        .catch(error => console.error("Error registering token:", error));
}


// Request permission
async function requestPermission() {
    const permResult = await LocalNotifications.requestPermissions();
    console.log("Permission result:", permResult);
    return permResult.display === "granted";
}

// Function to trigger a test notification
async function testNotification() {
    // First request permission
    const hasPermission = await requestPermission();

    if (hasPermission) {
        // Schedule a notification to appear 5 seconds from now
        await LocalNotifications.schedule({
            notifications: [
                {
                    id: 123,
                    title: "Test Notification",
                    body: "This is a test local notification from Capacitor",
                    schedule: {at: new Date(Date.now() + 5000)},
                    channelId: "important-notifications", // Specify the channel ID here
                    autoCancel: true
                }
            ]
        });
        console.log("Notification scheduled!");
    } else {
        console.log("Notification permission was denied");
    }
}

// Create a channel (only needed for Android)
async function createNotificationChannel() {
    if (Capacitor.getPlatform() === "android") {
        await LocalNotifications.createChannel({
            id: "important-notifications",
            name: "Important Notifications",
            description: "Notifications that require immediate attention",
            importance: 5, // IMPORTANCE_HIGH
            visibility: 1, // PUBLIC
            sound: "beep.wav",
            vibration: true,
            lights: true
        });
        console.log("Notification channel created");
    }
}
