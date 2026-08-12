import type { Payload } from "./blueprints.js";

declare global {
    namespace Express {
        interface Request {
            user?: Payload;
        }
    }
}