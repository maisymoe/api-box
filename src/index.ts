// Imports
import alert from "alert";
import Filter from "bad-words";
import { createServer } from "http";
import { createApp, createRouter, useBody, IncomingMessage, ServerResponse } from "h3";

// Create the app and router
const app = createApp();
const router = createRouter();

// Make the app use the router
app.use(router);

// Configuration, see the README
const port: number = parseInt(process.env.AB_PORT as string) || parseInt(process.argv[2] as string) || 3000;
const charLimit: number = parseInt(process.env.AB_CHAR_LIMIT as string) || parseInt(process.argv[3] as string) || 500;
const censor: boolean = Boolean(process.env.AB_CENSOR) || Boolean(process.argv[4]) || true;
const censorStrict: boolean = Boolean(process.env.AB_CENSOR_STRICT) || Boolean(process.argv[5]) || false;

// Instantiate a map for rate limiting
const requests = new Map();

// Instantiate the profanity filter
const profanityFilter = new Filter();

router.post("/", async (req: IncomingMessage, res: ServerResponse) => {
    // Use the body parser to get the body of a request
    const body = await useBody(req);

    // Ensure the message is a string
    let message = body.message.toString();

    // Get the IP address of the client
    const address = req.socket.remoteAddress === "::1" ? req.headers["x-forwarded-for"] : req.socket.remoteAddress;

    // Crappy rate limiting
    if (requests.has(address)) {
        const limitedSince = requests.get(address);

        if (Date.now() - limitedSince < 5000) {
            res.statusCode = 429;
            return { message: `Too many requests, rate limited since ${limitedSince}` };
        } else {
            requests.set(address, Date.now());
        };
    } else {
        requests.set(address, Date.now());
    };

    // Ensure the message is not empty/undefined
    if (message) {
        // Censor the message if configured to do so
        if (censor && profanityFilter.isProfane(message)) {
            // Block the request entirely if strict mode is enabled
            if (censorStrict) {
                res.statusCode = 400;
                return { message: "Watch your language! (The server has the profanity filter set to strict mode)." }
            } else {
                message = profanityFilter.clean(message);
            }
        };

        // Ensure the message is not too long
        if (message.length > charLimit) { 
            res.statusCode = 413;
            return { message: `Message too long! Limit is ${charLimit} characters.` } 
        };

        // Finally, show the message
        alert(message);

        // Set status code to success, and inform the client
        res.statusCode = 200;
        return { message: "Successfully sent the message!" };
    } else {
        // Set status code to failure, and inform the client
        res.statusCode = 400;
        return { message: "No message provided!" };
    };
});

// If people go to the URL in their browser, or just GET /, inform them to send a POST request instead
router.get("/", async (req: IncomingMessage, res: ServerResponse) => {
    return { message: "Please send a POST request to / with a field named 'message' in the body." };
});

// Listen on the configured port
createServer(app).listen(port, () => {
    console.log(`Listening on port ${port}`);
});
