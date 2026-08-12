import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import type { Payload } from "../types/blueprints.js";

type JwtPayloadWithMetadata = Payload & { iat?: number; exp?: number; nbf?: number };

const withoutJwtMetadata = (payload: Payload): Payload => {
    const { iat, exp, nbf, ...userPayload } = payload as JwtPayloadWithMetadata;
    return userPayload;
};

export const generateAccessToken = (payload: Payload): string => {
    return jwt.sign(
        withoutJwtMetadata(payload), 
        env.accessKeySecret, 
        { 
            expiresIn: env.accessKeyExpiry as NonNullable<SignOptions["expiresIn"]> 
        }
    );
};

export const generateRefreshToken = (payload: Payload): string => {
    return jwt.sign(
        withoutJwtMetadata(payload), 
        env.refreshKeySecret, 
        { 
            expiresIn: env.refreshKeyExpiry as NonNullable<SignOptions["expiresIn"]> 
        }
    );
};

export const verifyAccessToken = (token: string): Payload => {
    return jwt.verify(token, env.accessKeySecret) as Payload;
};

export const verifyRefreshToken = (token: string): Payload => {
    return jwt.verify(token, env.refreshKeySecret) as Payload;
};
